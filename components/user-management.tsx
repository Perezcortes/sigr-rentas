"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Plus, Edit, Trash2, RefreshCw, Building2, Mail, Shield } from "lucide-react"
import type { UserRole } from "@/types/auth"
import { useToast } from "@/components/ui/use-toast"
import Hashids from "hashids"
import { useAuth } from "@/contexts/auth-context"

/* =================== UI helpers =================== */
const INPUT_FOCUS =
  "placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-secondary"
const SELECT_FOCUS = "focus:ring-2 focus:ring-secondary focus:border-secondary"

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

interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleName: string
  oficina: string
  permissions: string[]
  isActive: boolean
  lastLogin: string
}

type OfficeId = string | number
type Office = {
  id: OfficeId
  nombre: string
  clave?: string
  ciudad?: string
  estado?: string
  activo?: boolean
}

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
let ACTIVE_DECODER_DESC = O_SALT || SALT ? `SALT=${O_SALT || SALT} MIN=${MIN}${ALPH ? " ALPH(custom)" : ""}` : "none"

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
      ACTIVE_DECODER_DESC = `SALT=${c.salt} MIN=${c.min}${c.alph ? " ALPH(custom)" : ""}`
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
type ApiRole = {
  uid?: string
  id?: number
  nombre?: string
  descripcion?: string
  is_active?: boolean
}

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

type FormData = {
  nombres: string
  primer_apellido: string
  segundo_apellido: string
  correo: string
  telefono: string
  whatsapp: string
  role: UserRole
  isActive: boolean
  password: string
}
type FormErrors = Partial<Record<keyof FormData, string>> & { roleUid?: string }

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
  const [decoderInfo, setDecoderInfo] = useState(ACTIVE_DECODER_DESC)

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
      setDecoderInfo(ACTIVE_DECODER_DESC)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los usuarios y sus permisos en el sistema</p>
          {/* <p className="mt-2 text-xs text-muted-foreground">Decoder oficinas: {decoderInfo}</p> */}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUsersFromApi} disabled={loading || submitting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Recargar"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAddUser}
                className="bg-primary hover:bg-primary/90"
                disabled={submitting || !canCreateUsers}
                title={!canCreateUsers ? "Tu rol no puede crear usuarios" : undefined}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Modifica los datos y oficinas del usuario" : "Completa la información para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* nombre */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input
                      id="nombres"
                      className={`${INPUT_FOCUS} ${errors.nombres ? "border-red-500" : ""}`}
                      value={formData.nombres}
                      onChange={(e) => setAndValidate({ nombres: e.target.value })}
                      placeholder="Juan Carlos"
                      aria-invalid={!!errors.nombres}
                    />
                    {errors.nombres && <p className="text-xs text-red-600">{errors.nombres}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primer_apellido">Primer apellido</Label>
                    <Input
                      id="primer_apellido"
                      className={`${INPUT_FOCUS} ${errors.primer_apellido ? "border-red-500" : ""}`}
                      value={formData.primer_apellido}
                      onChange={(e) => setAndValidate({ primer_apellido: e.target.value })}
                      placeholder="Pérez"
                      aria-invalid={!!errors.primer_apellido}
                    />
                    {errors.primer_apellido && <p className="text-xs text-red-600">{errors.primer_apellido}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="segundo_apellido">Segundo apellido</Label>
                    <Input
                      id="segundo_apellido"
                      className={`${INPUT_FOCUS} ${errors.segundo_apellido ? "border-red-500" : ""}`}
                      value={formData.segundo_apellido}
                      onChange={(e) => setAndValidate({ segundo_apellido: e.target.value })}
                      placeholder="García"
                      aria-invalid={!!errors.segundo_apellido}
                    />
                    {errors.segundo_apellido && <p className="text-xs text-red-600">{errors.segundo_apellido}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo</Label>
                    <Input
                      id="correo"
                      type="email"
                      className={`${INPUT_FOCUS} ${errors.correo ? "border-red-500" : ""}`}
                      value={formData.correo}
                      onChange={(e) => setAndValidate({ correo: e.target.value })}
                      placeholder="usuario@sigr.com"
                      aria-invalid={!!errors.correo}
                    />
                    {errors.correo && <p className="text-xs text-red-600">{errors.correo}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      inputMode="tel"
                      maxLength={15}
                      className={`${INPUT_FOCUS} ${errors.telefono ? "border-red-500" : ""}`}
                      value={formData.telefono}
                      onChange={(e) => setAndValidate({ telefono: e.target.value })}
                      placeholder="9512345678"
                      aria-invalid={!!errors.telefono}
                    />
                    {errors.telefono && <p className="text-xs text-red-600">{errors.telefono}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      inputMode="tel"
                      maxLength={15}
                      className={`${INPUT_FOCUS} ${errors.whatsapp ? "border-red-500" : ""}`}
                      value={formData.whatsapp}
                      onChange={(e) => setAndValidate({ whatsapp: e.target.value })}
                      placeholder="9512345678"
                      aria-invalid={!!errors.whatsapp}
                    />
                    {errors.whatsapp && <p className="text-xs text-red-600">{errors.whatsapp}</p>}
                  </div>
                </div>

                {/* rol (desde API) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={selectedRoleUid}
                      onValueChange={(uid) => {
                        setSelectedRoleUid(uid)
                        const found = roles.find(r => (r.uid ?? String(r.id)) === uid)
                        setSelectedRoleId(typeof found?.id === "number" ? found.id : undefined)
                        if (found?.nombre) setAndValidate({ role: normalizeRoleToUserRole(found.nombre) })
                      }}
                      disabled={rolesLoading || roles.length === 0}
                    >
                      <SelectTrigger className={`${SELECT_FOCUS} ${errors.roleUid ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={rolesLoading ? "Cargando roles…" : "Selecciona un rol"} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.length === 0 && !rolesLoading && (
                          <div className="px-2 py-2 text-sm text-muted-foreground">Sin roles</div>
                        )}
                        {roles.map((r) => {
                          const value = r.uid ?? String(r.id ?? "")
                          const label = r.nombre ?? "(Sin nombre)"
                          return (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {errors.roleUid && <p className="text-xs text-red-600">{errors.roleUid}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive">Activo</Label>
                    <div className="h-10 flex items-center">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(v) => setFormData({ ...formData, isActive: !!v })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password {editingUser ? "(deja vacío para no cambiar)" : "(temporal)"}</Label>
                    <Input
                      id="password"
                      className={`${INPUT_FOCUS} ${errors.password ? "border-red-500" : ""}`}
                      type="text"
                      value={formData.password}
                      onChange={(e) => setAndValidate({ password: e.target.value })}
                      placeholder={editingUser ? "Opcional" : "Se generó automáticamente"}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password ? (
                      <p className="text-xs text-red-600">{errors.password}</p>
                    ) : (
                      !editingUser && (
                        <ul className="text-xs text-muted-foreground list-disc ml-4">
                          <li>8+ caracteres</li>
                          <li>1 mayúscula</li>
                          <li>1 número</li>
                          <li>1 carácter especial</li>
                        </ul>
                      )
                    )}
                  </div>
                </div>

                {/* oficinas - dropdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Label>Oficinas</Label>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between">
                        <span className="truncate">
                          {selectedOfficeIds.length > 0
                            ? `${selectedOfficeIds.length} oficina${selectedOfficeIds.length > 1 ? "s" : ""} seleccionada${selectedOfficeIds.length > 1 ? "s" : ""}`
                            : "Selecciona oficinas"}
                        </span>
                        <Building2 className="ml-2 h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-[520px] p-0">
                      <div className="sticky top-0 z-10 space-y-2 border-b bg-background p-3">
                        <DropdownMenuLabel className="px-0">Selecciona oficinas</DropdownMenuLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            className={INPUT_FOCUS}
                            placeholder="Buscar por nombre/clave/ciudad/estado…"
                            value={officeSearch}
                            onChange={(e) => setOfficeSearch(e.target.value)}
                          />
                          <Button variant="outline" size="sm" onClick={fetchOfficesFromApi} disabled={officesLoading}>
                            <RefreshCw className={`mr-2 h-3 w-3 ${officesLoading ? "animate-spin" : ""}`} />
                            {officesLoading ? "Cargando…" : "Recargar"}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => toggleAllFiltered(true)} disabled={officesLoading}>
                            Seleccionar filtradas
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => toggleAllFiltered(false)} disabled={officesLoading}>
                            Quitar filtradas
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={clearAllOffices} disabled={officesLoading}>
                            Limpiar todo
                          </Button>
                        </div>
                      </div>

                      <div className="max-h-72 overflow-auto p-2">
                        {officesLoading ? (
                          <p className="px-2 py-3 text-sm text-muted-foreground">Cargando oficinas…</p>
                        ) : filteredOffices.length === 0 ? (
                          <p className="px-2 py-3 text-sm text-muted-foreground">No se encontraron oficinas.</p>
                        ) : (
                          <ul className="space-y-1">
                            {filteredOffices.map((o) => {
                              const checked = isOfficeSelected(selectedOfficeIds, o.id)
                              return (
                                <li key={String(o.id)}>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="cursor-default data-[highlighted]:bg-secondary data-[highlighted]:text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground"
                                  >
                                    <label className="flex w-full items-center gap-2">
                                      <Checkbox checked={checked} onCheckedChange={(v) => toggleOffice(o.id, !!v)} />
                                      <span className="text-sm">
                                        <span className="font-medium">{o.nombre}</span>
                                        {o.clave ? <span className="text-muted-foreground"> · {o.clave}</span> : null}
                                        {(o.ciudad || o.estado) ? (
                                          <span className="text-muted-foreground">
                                            {" "}· {o.ciudad ?? ""}{o.ciudad && o.estado ? ", " : ""}{o.estado ?? ""}
                                          </span>
                                        ) : null}
                                      </span>
                                    </label>
                                  </DropdownMenuItem>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>

                      <DropdownMenuSeparator />
                      <div className="flex flex-wrap gap-2 p-3">
                        {selectedOfficeIds.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Ninguna seleccionada</span>
                        ) : (
                          selectedOfficeIds
                            .map((id) => offices.find((o) => isOfficeSelected([id], o.id)))
                            .filter(Boolean)
                            .map((o) => (
                              <span key={String((o as Office).id)} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                                {(o as Office).nombre}
                                <button
                                  type="button"
                                  className="ml-1 text-muted-foreground hover:text-foreground"
                                  onClick={() => setSelectedOfficeIds((prev) => mergeOfficeIds(prev, (o as Office).id, false))}
                                  aria-label={`Quitar ${(o as Office).nombre}`}
                                >
                                  ×
                                </button>
                              </span>
                            ))
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveUser} disabled={submitting}>
                  {submitting ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total usuarios</CardDescription>
            <CardTitle className="text-2xl">{totalUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Activos</CardDescription>
            <CardTitle className="text-2xl">{activos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inactivos</CardDescription>
            <CardTitle className="text-2xl">{inactivos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accesos últimos 7 días</CardDescription>
            <CardTitle className="text-2xl">{recientes7d}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios
          </CardTitle>
          <CardDescription>Administra usuarios, roles y oficinas asignadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  {/* <TableHead>Rol</TableHead> */}
                  <TableHead>Oficina(s)</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-secondary/20">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {u.email}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {u.roleName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.oficina || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.lastLogin}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Botones condicionados por jerarquía */}
                      {canManageTarget(creatorRole as UserRole, u.role) && (
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(u)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                        </Button>
                      )}
                      {canManageTarget(creatorRole as UserRole, u.role) && (
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay usuarios para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
