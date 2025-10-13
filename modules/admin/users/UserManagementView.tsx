"use client"

import { useEffect, useMemo, useState } from "react"
import type { UserRole } from "@/types/auth"
import { useToast } from "@/components/ui/use-toast"
import Hashids from "hashids"
import { useAuth } from "@/contexts/auth-context"
import { UserManagementHeader } from "../users/components/UserManagementHeader"
import { UserMetrics } from "../users/components/UserMetrics"
import { UserTable } from "../users/components/UserTable"
import { UserDialog } from "../users/components/UserDialog"
import type {
  ApiRole,
  FormData,
  FormErrors,
  Office,
  OfficeId,
  SelectedOfficePill,
  SystemUser,
} from "./types"

/* =================== API base =================== */
const RAW = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const BASE = RAW.replace(/\/+$/, "")

/* =================== Tipos base =================== */
const ROLE_ID_BY_ROLE: Record<UserRole, number> = {
  administrador: 1,
  gerente: 2,
  coordinador: 3,
  agente: 4,
  propietario: 5,
  inquilino: 6,
}
const ROLE_BY_ID: Record<number, UserRole> = Object.fromEntries(
  Object.entries(ROLE_ID_BY_ROLE).map(([k, v]) => [v, k as UserRole])
) as Record<number, UserRole>

/* =================== Hashids (Oficinas) =================== */
const SALT = process.env.NEXT_PUBLIC_HASHIDS_SALT ?? ""
const O_SALT = process.env.NEXT_PUBLIC_HASHIDS_OFFICES_SALT ?? SALT
const MIN = Number(process.env.NEXT_PUBLIC_HASHIDS_MIN_LENGTH ?? 0)
const ALPH = process.env.NEXT_PUBLIC_HASHIDS_ALPHABET || undefined

type HashidsCandidate = { salt: string; min: number; alph?: string; inst: Hashids }
function makeCandidate(salt: string, min: number, alph?: string): HashidsCandidate {
  return { salt, min, alph, inst: new Hashids(salt, min, alph) }
}
const CANDIDATES_BASE: HashidsCandidate[] = []
if (O_SALT || SALT) {
  const salts = Array.from(
    new Set([
      O_SALT,
      SALT,
      `${SALT}oficinas`,
      `${SALT}_oficinas`,
      `${SALT}:oficinas`,
      `${SALT}offices`,
      `${SALT}_offices`,
      `${SALT}:offices`,
    ].filter(Boolean))
  )
  const mins = Array.from(new Set([MIN, 0, 6, 8, 10]))
  for (const s of salts) for (const m of mins) CANDIDATES_BASE.push(makeCandidate(s, m, ALPH || undefined))
}
let ACTIVE_DECODER: Hashids | null = CANDIDATES_BASE.length ? CANDIDATES_BASE[0].inst : null

function isNumericString(s: string) { return /^\d+$/.test(s) }
function decodeWith(h: Hashids | null, hid: string): number | null {
  if (!hid) return null
  if (isNumericString(hid)) return Number(hid)
  if (!h) return null
  const arr = h.decode(hid)
  if (Array.isArray(arr) && arr.length && typeof arr[0] === "number") return arr[0] as number
  const hex = (h as any).decodeHex?.(hid)
  if (typeof hex === "string" && hex.length) {
    const n = parseInt(hex, 16)
    if (Number.isFinite(n)) return n
  }
  return null
}
function tryDecodeWithCandidates(hid: string, candidates: HashidsCandidate[]): number | null {
  for (const c of candidates) {
    const n = decodeWith(c.inst, hid)
    if (typeof n === "number" && n > 0) {
      ACTIVE_DECODER = c.inst
      return n
    }
  }
  return null
}
function decodeOfficeId(hidOrNum: OfficeId): number | null {
  if (typeof hidOrNum === "number") return hidOrNum
  const s = String(hidOrNum)
  if (isNumericString(s)) return Number(s)
  const nA = decodeWith(ACTIVE_DECODER, s)
  if (typeof nA === "number") return nA
  return tryDecodeWithCandidates(s, CANDIDATES_BASE)
}
function isOfficeSelected(selected: OfficeId[], candidate: OfficeId) {
  if (selected.includes(candidate)) return true
  const candNum = decodeOfficeId(candidate)
  if (typeof candNum !== "number") return false
  return selected.some((s) => {
    if (s === candidate) return true
    const sn = decodeOfficeId(s)
    return typeof sn === "number" && sn === candNum
  })
}
function mergeOfficeIds(prev: OfficeId[], id: OfficeId, add: boolean): OfficeId[] {
  if (add) { if (isOfficeSelected(prev, id)) return prev; return [...prev, id] }
  const remNum = decodeOfficeId(id)
  return prev.filter((x) => {
    if (x === id) return false
    const xn = decodeOfficeId(x)
    return !(typeof remNum === "number" && typeof xn === "number" && remNum === xn)
  })
}
function ensureNumericOfficeIds(ids: OfficeId[]): number[] {
  const out: number[] = []
  for (const v of ids) {
    const n = decodeOfficeId(v)
    if (typeof n === "number" && Number.isFinite(n)) out.push(n)
    else throw new Error(`No se pudo convertir la oficina "${String(v)}" a entero. No se logró decodificar con Hashids.`)
  }
  return out
}

/* =================== Hashids (Roles) =================== */
const R_SALT = process.env.NEXT_PUBLIC_HASHIDS_ROLES_SALT ?? SALT
const ROLE_CANDIDATES: HashidsCandidate[] = []
{
  const salts = Array.from(
    new Set([
      R_SALT,
      `${SALT}roles`,
      `${SALT}_roles`,
      `${SALT}:roles`,
      `${SALT}rol`,
      `${SALT}_rol`,
      `${SALT}:rol`,
    ].filter(Boolean))
  )
  const mins = Array.from(new Set([MIN, 0, 6, 8, 10]))
  for (const s of salts) for (const m of mins) ROLE_CANDIDATES.push(makeCandidate(s, m, ALPH || undefined))
}
let ACTIVE_ROLE_DECODER: Hashids | null = ROLE_CANDIDATES.length ? ROLE_CANDIDATES[0].inst : null
function decodeRoleId(hidOrNum: string | number | null | undefined): number | null {
  if (hidOrNum == null) return null
  if (typeof hidOrNum === "number") return hidOrNum
  const s = String(hidOrNum)
  if (isNumericString(s)) return Number(s)
  const nA = decodeWith(ACTIVE_ROLE_DECODER, s)
  if (typeof nA === "number") return nA
  return tryDecodeWithCandidates(s, ROLE_CANDIDATES)
}

/* =================== Normalizadores =================== */
function normalizeRoleToUserRole(value: any): UserRole {
  const raw =
    typeof value === "object" && value
      ? value.nombre ?? value.name ?? value.code ?? value.display_name ?? ""
      : value ?? ""
  const v = String(raw).trim().toLowerCase()
  const map: Record<string, UserRole> = {
    administrador: "administrador",
    "administrador del sistema": "administrador",
    admin: "administrador",
    gerente: "gerente",
    manager: "gerente",
    coordinador: "coordinador",
    coordinator: "coordinador",
    agente: "agente",
    agent: "agente",
    propietario: "propietario",
    owner: "propietario",
    inquilino: "inquilino",
    tenant: "inquilino",
  }
  return map[v] ?? "agente"
}

function toSystemUser(u: any): SystemUser {
  const fullName =
    u?.nombre_completo ||
    [u?.nombres, u?.primer_apellido, u?.segundo_apellido].filter(Boolean).join(" ").trim() ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim() ||
    u?.username ||
    (u?.correo ?? u?.email)?.split("@")?.[0] ||
    "Sin nombre"

  const email = u?.correo ?? u?.email ?? ""

  let role: UserRole = normalizeRoleToUserRole(u?.role ?? u?.rol)
  if (!role && typeof u?.role_id === "number") role = ROLE_BY_ID[u.role_id] ?? "agente"

  const roleName =
    u?.role?.nombre ??
    u?.role_nombre ??
    u?.role?.name ??
    (role ? role.charAt(0).toUpperCase() + role.slice(1) : "—")

  let oficinaName = "—"
  const offices = u?.offices ?? u?.oficinas ?? u?.office ?? u?.oficina
  if (Array.isArray(offices) && offices.length) {
    oficinaName = offices
      .map((o: any) => (typeof o === "object" ? o.nombre ?? o.name : o))
      .filter(Boolean)
      .join(", ")
  } else if (offices) {
    oficinaName = typeof offices === "object" ? (offices.nombre ?? offices.name ?? "—") : String(offices)
  }

  const rawPerms = u?.permisos ?? u?.permissions ?? u?.role?.permisos ?? u?.role?.permissions ?? []
  const permissions: string[] = Array.isArray(rawPerms)
    ? rawPerms
        .map((p: any) => (typeof p === "string" ? p : p?.nombre ?? p?.name ?? null))
        .filter(Boolean)
    : []

  const isActive =
    typeof u?.is_active === "boolean" ? u.is_active :
    typeof u?.activo === "boolean" ? u.activo : !!u?.isActive

  const lastLoginISO = u?.last_login_at ?? u?.ultimo_acceso ?? u?.lastLogin
  const lastLogin = lastLoginISO ? new Date(lastLoginISO).toLocaleString() : "Nunca"

  const safeId =
    (u?.id && String(u.id)) ||
    (email && `email:${String(email)}`) ||
    (u?.username && `user:${String(u.username)}`) ||
    ([u?.nombres, u?.primer_apellido, u?.segundo_apellido].filter(Boolean).join("-") || "no-id")

  return {
    id: safeId,
    name: String(fullName),
    email: String(email),
    role,
    roleName,
    oficina: String(oficinaName),
    permissions,
    isActive,
    lastLogin,
  }
}

function genTempPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const symbols = "!@#$%*"
  const all = letters + digits + symbols
  let out = ""
  for (let i = 0; i < 10; i++) out += all[Math.floor(Math.random() * all.length)]
  return out
}

/* =================== Tipos para roles (lista del backend) =================== */
/* =================== Validaciones =================== */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const hasUpper = (s: string) => /[A-Z]/.test(s)
const hasDigit = (s: string) => /\d/.test(s)
const hasSpecial = (s: string) => /[^A-Za-z0-9]/.test(s)
const cleanPhone = (s: string) => s.replace(/\D+/g, "")
const phoneOk = (s: string) => {
  const d = cleanPhone(s)
  return d.length >= 10 && d.length <= 15
}

/* =================== Helper clave: role_id numérico =================== */
function ensureNumericRoleId(
  selectedRoleId: number | undefined,
  selectedRoleUid: string | undefined,
  formRole: UserRole,
  roles: ApiRole[],
): number {
  if (typeof selectedRoleId === "number" && Number.isFinite(selectedRoleId)) return selectedRoleId

  if (selectedRoleUid) {
    const found = roles.find(r => (r.uid ?? String(r.id)) === selectedRoleUid)
    if (typeof found?.id === "number" && Number.isFinite(found.id)) return found.id
    const dec = decodeRoleId(selectedRoleUid)
    if (typeof dec === "number" && Number.isFinite(dec)) return dec
  }

  const fallback = ROLE_ID_BY_ROLE[formRole]
  if (typeof fallback === "number" && Number.isFinite(fallback)) return fallback

  throw new Error("No se pudo determinar un role_id numérico válido")
}

/* =================== Componente =================== */
export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

  const [offices, setOffices] = useState<Office[]>([])
  const [officesLoading, setOfficesLoading] = useState(false)
  const [officeSearch, setOfficeSearch] = useState("")
  const [selectedOfficeIds, setSelectedOfficeIds] = useState<OfficeId[]>([])

  // === roles ===
  const [roles, setRoles] = useState<ApiRole[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [selectedRoleUid, setSelectedRoleUid] = useState<string | undefined>(undefined)
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined) // << clave

  const { toast } = useToast()
  const { user } = useAuth()
  const creatorRole = (user?.role ?? "agente").toString().toLowerCase()

  function getAllowedTargetRoles(creator: string): UserRole[] {
    switch (creator) {
      case "administrador":
        return ["administrador","gerente","coordinador","agente","propietario","inquilino"]
      case "gerente":
        return ["coordinador","agente","propietario","inquilino"]
      case "coordinador":
        return ["agente","propietario","inquilino"]
      default:
        return []
    }
  }
  function canManageTarget(creator: UserRole, target: UserRole): boolean {
    if (creator === "administrador") return true
    if (creator === "gerente") return !["administrador","gerente"].includes(target)
    if (creator === "coordinador") return ["agente","propietario","inquilino"].includes(target)
    return false
  }
  const allowedTargetRoles = useMemo(() => getAllowedTargetRoles(creatorRole), [creatorRole])
  const canCreateUsers = allowedTargetRoles.length > 0

  const filteredOffices = useMemo(() => {
    const q = officeSearch.trim().toLowerCase()
    if (!q) return offices
    return offices.filter((o) =>
      [o.nombre, o.clave, o.ciudad, o.estado].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [officeSearch, offices])

  const selectedOfficePills = useMemo<SelectedOfficePill[]>(() => {
    return selectedOfficeIds.map((id) => {
      const match = offices.find((office) => isOfficeSelected([office.id], id))
      const label = match?.nombre ?? (typeof id === "string" ? id : `#${id}`)
      return { id, label }
    })
  }, [selectedOfficeIds, offices])

  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    correo: "",
    telefono: "",
    whatsapp: "",
    role: "agente",
    isActive: true,
    password: genTempPassword(),
  })
  const [errors, setErrors] = useState<FormErrors>({})

  /* ===== Validación de campos (live) ===== */
  function validateField(name: keyof FormData, value: string): string | "" {
    const v = value?.trim?.() ?? ""
    switch (name) {
      case "nombres":
        if (!v) return "Ingresa el nombre."
        if (v.length < 2) return "El nombre debe tener al menos 2 caracteres."
        return ""
      case "correo":
        if (!v) return "Ingresa el correo."
        if (!emailRe.test(v)) return "Correo inválido."
        return ""
      case "password": {
        if (editingUser && !v) return ""
        if (v.length < 8) return "Mínimo 8 caracteres."
        if (!hasUpper(v)) return "Debe incluir al menos 1 mayúscula."
        if (!hasDigit(v)) return "Debe incluir al menos 1 número."
        if (!hasSpecial(v)) return "Debe incluir al menos 1 carácter especial."
        return ""
      }
      case "telefono":
      case "whatsapp":
        if (!v) return ""
        if (!phoneOk(v)) return "Debe contener entre 10 y 15 dígitos."
        return ""
      case "primer_apellido":
      case "segundo_apellido":
        if (!v) return ""
        if (v.length < 2) return "Debe tener al menos 2 caracteres."
        return ""
      default:
        return ""
    }
  }

  function validateAll(): FormErrors {
    const e: FormErrors = {}
    ;(["nombres","correo","password","telefono","whatsapp","primer_apellido","segundo_apellido"] as (keyof FormData)[])
      .forEach((k) => {
        const msg = validateField(k, formData[k] as string)
        if (msg) e[k] = msg
      })
    try {
      ensureNumericRoleId(selectedRoleId, selectedRoleUid, formData.role, roles)
    } catch {
      e.roleUid = "Selecciona un rol válido."
    }
    return e
  }

  const setAndValidate = (patch: Partial<FormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...patch }
      const changedKeys = Object.keys(patch) as (keyof FormData)[]
      const nextErrors: FormErrors = { ...errors }
      for (const k of changedKeys) {
        const msg = validateField(k, String((next as any)[k] ?? ""))
        if (msg) nextErrors[k] = msg
        else delete nextErrors[k]
      }
      setErrors(nextErrors)
      return next
    })
  }

  function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  }

  /* ========== API: usuarios ========== */
  async function fetchUsersFromApi() {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/users`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: "no-store",
      })
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)
      const raw = await res.json()
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []
      setUsers(list.map(toSystemUser))
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo cargar la lista de usuarios", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  /* ========== API: oficinas ========== */
  async function fetchOfficesFromApi() {
    setOfficesLoading(true)
    try {
      const token = getToken()
      const url = `${BASE}/offices?estatus_actividad=true`
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: "no-store",
      })
      const text = await res.text()
      if (!res.ok) throw new Error(text || `Error ${res.status}`)
      let data: any
      try { data = JSON.parse(text) } catch { throw new Error("La respuesta de /offices no es JSON válido") }
      const list: any[] = Array.isArray(data) ? data : data?.data ?? data?.result ?? []
      const mapped: Office[] = list.map((o) => ({
        id: (o?.id ?? o?.office_id) as OfficeId,
        nombre: String(o?.nombre ?? o?.name ?? o?.clave ?? "Oficina"),
        clave: o?.clave ?? undefined,
        ciudad: o?.ciudad ?? o?.city ?? undefined,
        estado: o?.estado ?? o?.state ?? undefined,
        activo: typeof o?.activo === "boolean" ? o.activo : undefined,
      }))
      const samples = mapped.map(x => x.id).filter(id => typeof id === "string" && !isNumericString(String(id))) as string[]
      for (const s of samples.slice(0, 2)) {
        const probe = decodeOfficeId(s)
        if (typeof probe === "number" && probe > 0) break
      }
      setOffices(mapped)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudieron cargar las oficinas", variant: "destructive" })
      setOffices([])
    } finally {
      setOfficesLoading(false)
    }
  }

  /* ========== API: roles ========== */
  async function fetchRolesFromApi() {
    setRolesLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/roles`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: "no-store",
      })
      const text = await res.text()
      if (!res.ok) throw new Error(text || `Error ${res.status}`)
      let data: any
      try { data = JSON.parse(text) } catch { throw new Error("La respuesta de /roles no es JSON válido") }
      const list: ApiRole[] = Array.isArray(data) ? data : (data?.data ?? data?.result ?? [])
      // Filtra opciones del selector conforme al rol del creador
      const filtered = list.filter(r => allowedTargetRoles.includes(normalizeRoleToUserRole(r.nombre)))
      setRoles(filtered)

      // Sin selección previa: intenta por nombre normalizado del form, o el primero permitido.
      if (!selectedRoleUid) {
        const normalized = (name?: string) => normalizeRoleToUserRole(name ?? "")
        const byName = filtered.find(r => normalized(r.nombre) === formData.role)
        const chosen = byName ?? filtered[0]
        if (chosen) {
          setSelectedRoleUid(chosen.uid ?? String(chosen.id ?? ""))
          if (chosen.id != null) setSelectedRoleId(chosen.id)
        }
      } else {
        const f = filtered.find(r => (r.uid ?? String(r.id)) === selectedRoleUid)
        if (f?.id != null) setSelectedRoleId(f.id)
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudieron cargar los roles", variant: "destructive" })
      setRoles([])
    } finally {
      setRolesLoading(false)
    }
  }

  useEffect(() => { fetchUsersFromApi() }, [])

  // Al abrir el modal cargamos offices/roles si hace falta
  useEffect(() => {
    if (isDialogOpen) {
      if (offices.length === 0 && !officesLoading) fetchOfficesFromApi()
      if (roles.length === 0 && !rolesLoading) fetchRolesFromApi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen])

  useEffect(() => {
    if (!editingUser) return
    if (roles.length === 0) return

    const targetRole = editingUser.role
    const targetRoleByName = editingUser.roleName ? normalizeRoleToUserRole(editingUser.roleName) : null

    const match = roles.find((r) => {
      const normalized = normalizeRoleToUserRole(r.nombre ?? "")
      if (normalized === targetRole) return true
      if (targetRoleByName && normalized === targetRoleByName) return true
      if (typeof r.id === "number" && ROLE_BY_ID[r.id] === targetRole) return true
      return false
    })

    if (!match) return
    const value = match.uid ?? String(match.id ?? "")
    if (selectedRoleUid !== value) setSelectedRoleUid(value)
    if (typeof match.id === "number" && match.id !== selectedRoleId) setSelectedRoleId(match.id)
  }, [editingUser, roles, selectedRoleUid, selectedRoleId])

  /* ========== CRUD ==========\*/
  async function createUser() {
    setSubmitting(true)
    try {
      const token = getToken()

      const role_id = ensureNumericRoleId(selectedRoleId, selectedRoleUid, formData.role, roles)

      const numericOfficeIds = ensureNumericOfficeIds(selectedOfficeIds)
      const payload: any = {
        nombres: formData.nombres,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        correo: formData.correo,
        password: formData.password,
        role_id, // siempre número
        telefono: formData.telefono || undefined,
        whatsapp: formData.whatsapp || undefined,
        offices: numericOfficeIds.map((id) => ({ id })),
        is_active: formData.isActive,
      }
      const res = await fetch(`${BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)
      toast({ title: "Éxito", description: "Usuario creado correctamente" })
      setIsDialogOpen(false)
      await fetchUsersFromApi()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo crear el usuario", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  async function updateUser(userId: string) {
    setSubmitting(true)
    try {
      const token = getToken()

      const role_id = ensureNumericRoleId(selectedRoleId, selectedRoleUid, formData.role, roles)

      const numericOfficeIds = ensureNumericOfficeIds(selectedOfficeIds)
      const payload: any = {
        nombres: formData.nombres,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        correo: formData.correo,
        role_id, // siempre número
        telefono: formData.telefono || undefined,
        whatsapp: formData.whatsapp || undefined,
        offices: numericOfficeIds.map((id) => ({ id })),
        is_active: formData.isActive,
      }
      if (formData.password?.trim()) payload.password = formData.password.trim()
      const res = await fetch(`${BASE}/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)
      toast({ title: "Éxito", description: "Usuario actualizado" })
      setIsDialogOpen(false)
      await fetchUsersFromApi()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo actualizar el usuario", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setErrors({})
    setFormData({
      nombres: "",
      primer_apellido: "",
      segundo_apellido: "",
      correo: "",
      telefono: "",
      whatsapp: "",
      role: "agente",
      isActive: true,
      password: genTempPassword(),
    })
    setSelectedOfficeIds([])
    setOfficeSearch("")
    setSelectedRoleUid(undefined)
    setSelectedRoleId(undefined)
    setIsDialogOpen(true)
  }

  const handleEditUser = async (user: SystemUser) => {
    // Guardia por jerarquía: si no puede gestionar este usuario, no abre el diálogo
    const canManage = canManageTarget(creatorRole as UserRole, user.role)
    if (!canManage) {
      toast({ title: "Permiso denegado", description: "No puedes editar este usuario.", variant: "destructive" })
      return
    }
    const parts = user.name.trim().split(/\s+/)
    let nombres = "", primer_apellido = "", segundo_apellido = ""
    if (parts.length >= 3) { segundo_apellido = parts.pop() as string; primer_apellido = parts.pop() as string; nombres = parts.join(" ") }
    else if (parts.length === 2) { primer_apellido = parts[1]; nombres = parts[0] }
    else if (parts.length === 1) { nombres = parts[0] }

    setEditingUser(user)
    setErrors({})
    setFormData({
      nombres, primer_apellido, segundo_apellido,
      correo: user.email, telefono: "", whatsapp: "",
      role: user.role, isActive: user.isActive, password: "",
    })
    setSelectedOfficeIds([]); setOfficeSearch("")

    const matchFromLoadedRoles = roles.find((r) => normalizeRoleToUserRole(r.nombre ?? "") === user.role)
    if (matchFromLoadedRoles) {
      const value = matchFromLoadedRoles.uid ?? String(matchFromLoadedRoles.id ?? "")
      setSelectedRoleUid(value)
      setSelectedRoleId(typeof matchFromLoadedRoles.id === "number" ? matchFromLoadedRoles.id : undefined)
    } else {
      setSelectedRoleUid(undefined)
      setSelectedRoleId(undefined)
    }

    setIsDialogOpen(true)

    if (offices.length === 0 && !officesLoading) await fetchOfficesFromApi()
    if (roles.length === 0 && !rolesLoading) await fetchRolesFromApi()

    try {
      const token = getToken()
      const res = await fetch(`${BASE}/users/${encodeURIComponent(user.id)}`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: "no-store",
      })
      if (res.ok) {
        const u = await res.json()
        const rawOffices = u?.offices ?? u?.oficinas ?? []
        const ids: OfficeId[] = Array.isArray(rawOffices)
          ? rawOffices.map((o: any) => (typeof o === "object" ? (o.id ?? o.office_id ?? null) : o)).filter(Boolean)
          : []
        setSelectedOfficeIds((prev) => {
          let curr = prev.slice()
          ids.forEach((id) => { curr = mergeOfficeIds(curr, id, true) })
          return curr
        })

        // Preselección de rol desde detalle
        const roleUidFromDetail: string | null = u?.role?.uid ?? null
        const roleIdFromDetail: number | null = typeof u?.role?.id === "number" ? u.role.id : null

        if (roleUidFromDetail) setSelectedRoleUid(String(roleUidFromDetail))
        if (roleIdFromDetail != null) setSelectedRoleId(roleIdFromDetail)
        else {
          const match = roles.find(r =>
            (r.nombre ?? "").trim().toLowerCase() === (user.roleName ?? "").trim().toLowerCase()
          )
          if (match) {
            setSelectedRoleUid(match.uid ?? String(match.id ?? ""))
            if (match.id != null) setSelectedRoleId(match.id)
          }
        }
      }
    } catch {
      toast({ title: "Atención", description: "No se pudo precargar detalle de oficinas/rol.", variant: "default" })
    }
  }

  const handleSaveUser = () => {
    // Validar que el rol elegido esté permitido para el creador
    const selectedRole = (() => {
      const found = roles.find(r => (r.uid ?? String(r.id)) === selectedRoleUid)
      return normalizeRoleToUserRole(found?.nombre)
    })()
    if (!allowedTargetRoles.includes(selectedRole)) {
      toast({ title: "Permiso denegado", description: "No puedes crear usuarios con ese rol.", variant: "destructive" })
      return
    }
    const e = validateAll()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      const first = e.nombres || e.correo || e.password || e.telefono || e.whatsapp || e.primer_apellido || e.segundo_apellido || e.roleUid || "Revisa los campos."
      toast({ title: "Validación", description: first, variant: "destructive" })
      return
    }
    editingUser ? updateUser(editingUser.id) : createUser()
  }

  const handleDeleteUser = async (id: string) => {
    // Intentamos encontrar el usuario objetivo para validar jerarquía
    const target = users.find(u => u.id === id)
    if (target && !canManageTarget(creatorRole as UserRole, target.role)) {
      toast({ title: "Permiso denegado", description: "No puedes eliminar este usuario.", variant: "destructive" })
      return
    }
    const confirmar = typeof window !== "undefined" ? window.confirm("¿Eliminar este usuario? (soft delete)") : true
    if (!confirmar) return
    setSubmitting(true)
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (res.status === 204) {
        toast({ title: "Éxito", description: "Usuario eliminado" })
        await fetchUsersFromApi()
        return
      }
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)
      toast({ title: "Éxito", description: "Usuario eliminado" })
      await fetchUsersFromApi()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo eliminar el usuario", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  /* ====== oficinas: selección ====== */
  const toggleOffice = (id: OfficeId, checked: boolean) => {
    setSelectedOfficeIds((prev) => mergeOfficeIds(prev, id, checked))
  }
  const toggleAllFiltered = (check: boolean) => {
    setSelectedOfficeIds((prev) => {
      let acc = prev
      for (const o of filteredOffices) acc = mergeOfficeIds(acc, o.id, check)
      return acc
    })
  }
  const clearAllOffices = () => setSelectedOfficeIds([])

  const handleRoleSelect = (uid: string) => {
    setSelectedRoleUid(uid)
    const found = roles.find((r) => (r.uid ?? String(r.id)) === uid)
    setSelectedRoleId(typeof found?.id === "number" ? found.id : undefined)
    if (found?.nombre) setAndValidate({ role: normalizeRoleToUserRole(found.nombre) })
  }

  const handleToggleActive = (value: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: value }))
  }

  const handleOfficeSearchChange = (value: string) => setOfficeSearch(value)

  const handleRemoveOffice = (id: OfficeId) => {
    setSelectedOfficeIds((prev) => mergeOfficeIds(prev, id, false))
  }

  const handleCancelDialog = () => setIsDialogOpen(false)

  /* ====== Métricas ====== */
  const totalUsers = users.length
  const activos = users.filter(u => u.isActive).length
  const inactivos = totalUsers - activos
  const recientes7d = users.filter(u => {
    if (!u.lastLogin || u.lastLogin === "Nunca") return false
    const d = new Date(u.lastLogin)
    if (isNaN(d.getTime())) return false
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return d >= sevenDaysAgo
  }).length

  return (
    <div className="space-y-6">
      <UserManagementHeader
        loading={loading}
        submitting={submitting}
        onRefresh={fetchUsersFromApi}
        onAddUser={handleAddUser}
        canCreateUsers={canCreateUsers}
      />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        submitting={submitting}
        editingUser={editingUser}
        formData={formData}
        errors={errors}
        onFieldChange={setAndValidate}
        onToggleActive={handleToggleActive}
        roles={roles}
        rolesLoading={rolesLoading}
        selectedRoleUid={selectedRoleUid}
        onRoleSelect={handleRoleSelect}
        roleError={errors.roleUid}
        officeSearch={officeSearch}
        onOfficeSearchChange={handleOfficeSearchChange}
        officesLoading={officesLoading}
        onReloadOffices={fetchOfficesFromApi}
        filteredOffices={filteredOffices}
        selectedOfficeIds={selectedOfficeIds}
        selectedOfficePills={selectedOfficePills}
        onToggleOffice={toggleOffice}
        onToggleAllFiltered={toggleAllFiltered}
        onClearOffices={clearAllOffices}
        onRemoveOffice={handleRemoveOffice}
        isOfficeSelected={isOfficeSelected}
        onSubmit={handleSaveUser}
        onCancel={handleCancelDialog}
      />

      <UserMetrics
        totalUsers={totalUsers}
        activos={activos}
        inactivos={inactivos}
        recientes7d={recientes7d}
      />

      <UserTable
        users={users}
        loading={loading}
        creatorRole={creatorRole as UserRole}
        canManageTarget={canManageTarget}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  )
}
