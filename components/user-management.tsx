"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Users, Plus, Edit, Trash2, Mail, Building2, Shield, RefreshCw } from "lucide-react"
import type { UserRole } from "@/types/auth"
import { getRoleDisplayName } from "@/lib/auth"
import Hashids from "hashids"

// =============== Config/API ===============
const RAW = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const BASE = RAW.replace(/\/+$/, "")

// =============== Roles ===============
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

// =============== Tipos ===============
interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
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

// =============== Hashids AUTODECODER (Oficinas) ===============
const SALT  = process.env.NEXT_PUBLIC_HASHIDS_SALT ?? ""
const O_SALT = process.env.NEXT_PUBLIC_HASHIDS_OFFICES_SALT ?? SALT
const MIN   = Number(process.env.NEXT_PUBLIC_HASHIDS_MIN_LENGTH ?? 0)
const ALPH  = process.env.NEXT_PUBLIC_HASHIDS_ALPHABET || undefined

type HashidsCandidate = { salt: string; min: number; alph?: string; inst: Hashids }
function makeCandidate(salt: string, min: number, alph?: string): HashidsCandidate {
  return { salt, min, alph, inst: new Hashids(salt, min, alph) }
}

// Generamos una lista de candidatos razonables
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

function isNumericString(s: string) {
  return /^\d+$/.test(s)
}

function decodeWith(h: Hashids | null, hid: string): number | null {
  if (!hid) return null
  if (isNumericString(hid)) return Number(hid) // ya numérica
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

function ensureNumericOfficeIds(ids: OfficeId[]): number[] {
  const out: number[] = []
  for (const v of ids) {
    const n = decodeOfficeId(v)
    if (typeof n === "number" && Number.isFinite(n)) out.push(n)
    else throw new Error(`No se pudo convertir la oficina "${String(v)}" a entero. No se logró decodificar con Hashids.`)
  }
  return out
}

// =============== Normalizadores ===============
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
    typeof u?.is_active === "boolean"
      ? u.is_active
      : typeof u?.activo === "boolean"
      ? u.activo
      : !!u?.isActive

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
    oficina: String(oficinaName),
    permissions,
    isActive,
    lastLogin,
  }
}

// =============== UI Aux ===============
const availablePermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "reportes", label: "Reportes" },
  { id: "admin", label: "Administración" },
  { id: "centro_pagos", label: "Centro de Pagos" },
  { id: "interesados", label: "Interesados" },
  { id: "mis_rentas", label: "Mis Rentas" },
  { id: "renovaciones", label: "Renovaciones" },
  { id: "administraciones", label: "Administraciones" },
  { id: "usuarios", label: "Usuarios" },
]

function genTempPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const symbols = "!@#$%*"
  const all = letters + digits + symbols
  let out = ""
  for (let i = 0; i < 10; i++) out += all[Math.floor(Math.random() * all.length)]
  return out
}

// =============== Componente ===============
export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

  // Oficinas
  const [offices, setOffices] = useState<Office[]>([])
  const [officesLoading, setOfficesLoading] = useState(false)
  const [officeSearch, setOfficeSearch] = useState("")
  const [selectedOfficeIds, setSelectedOfficeIds] = useState<OfficeId[]>([])
  const [decoderInfo, setDecoderInfo] = useState(ACTIVE_DECODER_DESC)

  const filteredOffices = useMemo(() => {
    const q = officeSearch.trim().toLowerCase()
    if (!q) return offices
    return offices.filter((o) =>
      [o.nombre, o.clave, o.ciudad, o.estado].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [officeSearch, offices])

  const [formData, setFormData] = useState({
    nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    correo: "",
    telefono: "",
    whatsapp: "",
    role: "agente" as UserRole,
    isActive: true,
    password: genTempPassword(),
    permissions: [] as string[],
  })

  function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  }

  // === Usuarios ===
  async function fetchUsersFromApi() {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)
      const raw = await res.json()
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []
      setUsers(list.map(toSystemUser))
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar la lista de usuarios")
    } finally {
      setLoading(false)
    }
  }

  // === Oficinas ===
  async function fetchOfficesFromApi() {
    setOfficesLoading(true)
    try {
      const token = getToken()
      const url = `${BASE}/offices?estatus_actividad=true`
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })
      const text = await res.text()
      if (!res.ok) throw new Error(text || `Error ${res.status}`)

      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("La respuesta de /offices no es JSON válido")
      }

      const list: any[] = Array.isArray(data) ? data : data?.data ?? data?.result ?? []

      // Mapeo preliminar
      const mapped: Office[] = list.map((o) => ({
        id: (o?.id ?? o?.office_id) as OfficeId,
        nombre: String(o?.nombre ?? o?.name ?? o?.clave ?? "Oficina"),
        clave: o?.clave ?? undefined,
        ciudad: o?.ciudad ?? o?.city ?? undefined,
        estado: o?.estado ?? o?.state ?? undefined,
        activo: typeof o?.activo === "boolean" ? o.activo : undefined,
      }))

      // Auto–descubre decoder con 1–2 muestras no numéricas
      const samples = mapped.map(x => x.id).filter(id => typeof id === "string" && !isNumericString(String(id))) as string[]
      for (const s of samples.slice(0, 2)) {
        const probe = decodeOfficeId(s)
        if (typeof probe === "number" && probe > 0) break
      }
      setDecoderInfo(ACTIVE_DECODER_DESC)

      setOffices(mapped)
    } catch (e) {
      console.error(e)
      setOffices([])
    } finally {
      setOfficesLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersFromApi()
  }, [])

  useEffect(() => {
    if (isDialogOpen && offices.length === 0 && !officesLoading) {
      fetchOfficesFromApi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen])

  // === Crear usuario ===
  async function createUser() {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const token = getToken()
      const role_id = ROLE_ID_BY_ROLE[formData.role] ?? 4

      // 🔹 Convertir TODOS los ids de oficina a enteros antes de enviar
      const numericOfficeIds = ensureNumericOfficeIds(selectedOfficeIds)
      const officesPayload = numericOfficeIds.map((id) => ({ id }))

      const payload: any = {
        nombres: formData.nombres,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        correo: formData.correo,
        password: formData.password,
        role_id,
        telefono: formData.telefono || undefined,
        whatsapp: formData.whatsapp || undefined,
        offices: officesPayload,
        is_active: formData.isActive,
      }

      const res = await fetch(`${BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)

      setSuccess("Usuario creado correctamente")
      setIsDialogOpen(false)
      await fetchUsersFromApi()
    } catch (e: any) {
      setError(e?.message || "No se pudo crear el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  // === Actualizar usuario ===
  async function updateUser(userId: string) {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const token = getToken()
      const role_id = ROLE_ID_BY_ROLE[formData.role] ?? 4

      const numericOfficeIds = ensureNumericOfficeIds(selectedOfficeIds)
      const officesPayload = numericOfficeIds.map((id) => ({ id }))

      const payload: any = {
        nombres: formData.nombres,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        correo: formData.correo,
        role_id,
        telefono: formData.telefono || undefined,
        whatsapp: formData.whatsapp || undefined,
        offices: officesPayload,
        is_active: formData.isActive,
      }
      if (formData.password && formData.password.trim().length > 0) {
        payload.password = formData.password.trim()
      }

      const res = await fetch(`${BASE}/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)

      setSuccess("Usuario actualizado")
      setIsDialogOpen(false)
      await fetchUsersFromApi()
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
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
      permissions: [],
    })
    setSelectedOfficeIds([])
    setOfficeSearch("")
    setIsDialogOpen(true)
    setSuccess(null)
    setError(null)
  }

  const handleEditUser = (user: SystemUser) => {
    const parts = user.name.trim().split(/\s+/)
    let nombres = "", primer_apellido = "", segundo_apellido = ""
    if (parts.length >= 3) { segundo_apellido = parts.pop() as string; primer_apellido = parts.pop() as string; nombres = parts.join(" ") }
    else if (parts.length === 2) { primer_apellido = parts[1]; nombres = parts[0] }
    else if (parts.length === 1) { nombres = parts[0] }

    setEditingUser(user)
    setFormData({
      nombres, primer_apellido, segundo_apellido,
      correo: user.email,
      telefono: "",
      whatsapp: "",
      role: user.role,
      isActive: user.isActive,
      password: "",
      permissions: user.permissions ?? [],
    })
    setSelectedOfficeIds([]) // si tu /users/{id} trae ids, precárgalos aquí
    setOfficeSearch("")
    setIsDialogOpen(true)
    setSuccess(null)
    setError(null)
  }

  const handleSaveUser = () => {
    if (editingUser) updateUser(editingUser.id)
    else createUser()
  }

  const handleDeleteUser = async (id: string) => {
    const confirmar = typeof window !== "undefined" ? window.confirm("¿Eliminar este usuario? (soft delete)") : true
    if (!confirmar) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (res.status === 204) {
        setSuccess("Usuario eliminado")
        await fetchUsersFromApi()
        return
      }
      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`)
      setSuccess("Usuario eliminado")
      await fetchUsersFromApi()
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) setFormData({ ...formData, permissions: [...formData.permissions, permissionId] })
    else setFormData({ ...formData, permissions: formData.permissions.filter((p) => p !== permissionId) })
  }

  const toggleOffice = (id: OfficeId, checked: boolean) => {
    setSelectedOfficeIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los usuarios y sus permisos en el sistema</p>
          {O_SALT || SALT ? (
            <p className="mt-2 text-xs text-muted-foreground">Decoder oficinas: {decoderInfo}</p>
          ) : (
            <p className="mt-2 text-sm text-amber-600">
              Falta <code>NEXT_PUBLIC_HASHIDS_SALT</code>. No se podrán convertir IDs de oficinas hasheadas.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUsersFromApi} disabled={loading || submitting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Recargar"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90" disabled={submitting}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Modifica los datos y permisos del usuario" : "Completa la información para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input id="nombres" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} placeholder="Juan Carlos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primer_apellido">Primer apellido</Label>
                    <Input id="primer_apellido" value={formData.primer_apellido} onChange={(e) => setFormData({ ...formData, primer_apellido: e.target.value })} placeholder="Pérez" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="segundo_apellido">Segundo apellido</Label>
                    <Input id="segundo_apellido" value={formData.segundo_apellido} onChange={(e) => setFormData({ ...formData, segundo_apellido: e.target.value })} placeholder="García" />
                  </div>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo</Label>
                    <Input id="correo" type="email" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} placeholder="usuario@sigr.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} placeholder="9512345678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="9512345678" />
                  </div>
                </div>

                {/* Rol + Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                        <SelectItem value="coordinador">Coordinador</SelectItem>
                        <SelectItem value="agente">Agente</SelectItem>
                        <SelectItem value="propietario">Propietario</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 mt-7">
                    <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
                    <Label htmlFor="isActive">Usuario Activo</Label>
                  </div>
                </div>

                {/* Oficinas */}
                <div className="space-y-2">
                  <Label>Oficinas</Label>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar por nombre/clave/ciudad/estado…" value={officeSearch} onChange={(e) => setOfficeSearch(e.target.value)} />
                      <Button type="button" variant="outline" size="sm" onClick={fetchOfficesFromApi} disabled={officesLoading}>
                        {officesLoading ? "Cargando…" : "Recargar"}
                      </Button>
                    </div>
                    {officesLoading ? (
                      <p className="text-sm text-muted-foreground">Cargando oficinas…</p>
                    ) : offices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No se encontraron oficinas.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-auto pr-1">
                        {filteredOffices.map((o) => {
                          const checked = selectedOfficeIds.includes(o.id)
                          return (
                            <label key={String(o.id)} className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted cursor-pointer">
                              <Checkbox checked={checked} onCheckedChange={(v) => toggleOffice(o.id, v as boolean)} />
                              <span className="text-sm">
                                <span className="font-medium">{o.nombre}</span>
                                {o.clave ? <span className="text-muted-foreground"> · {o.clave}</span> : null}
                                {(o.ciudad || o.estado) ? (
                                  <span className="text-muted-foreground"> · {o.ciudad ?? ""}{o.ciudad && o.estado ? ", " : ""}{o.estado ?? ""}</span>
                                ) : null}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                    <div className="mt-3 text-xs text-muted-foreground">
                      Seleccionadas: {selectedOfficeIds.length > 0 ? selectedOfficeIds.map(String).join(", ") : "ninguna"}
                    </div>
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password">{editingUser ? "Nueva contraseña (opcional)" : "Contraseña temporal"}</Label>
                  <div className="flex gap-2">
                    <Input id="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingUser ? "Dejar vacío para no cambiar" : ""} />
                    {!editingUser && (
                      <Button type="button" variant="outline" onClick={() => setFormData({ ...formData, password: genTempPassword() })}>
                        Generar
                      </Button>
                    )}
                  </div>
                  {!editingUser && <p className="text-xs text-muted-foreground">Se enviará como contraseña inicial; el usuario podrá cambiarla después.</p>}
                </div>

                {/* Permisos (solo UI) */}
                <div className="space-y-3">
                  <Label>Permisos (opcional, UI)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                        />
                        <Label htmlFor={permission.id} className="text-sm">
                          {permission.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">*Actualmente el endpoint no recibe permisos; se muestran solo como referencia en la UI.</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancelar</Button>
                <Button onClick={handleSaveUser} className="bg-primary hover:bg-primary/90" disabled={submitting}>
                  {submitting ? "Guardando..." : editingUser ? "Guardar Cambios" : "Crear Usuario"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.filter((u) => u.isActive).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.filter((u) => u.role === "administrador").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.filter((u) => u.role === "agente").length}</div></CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Gestiona todos los usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando usuarios…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow key={user.id || user.email || `row-${idx}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{getRoleDisplayName(user.role)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Building2 className="mr-1 h-3 w-3 text-muted-foreground" />
                        {user.oficina}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.permissions?.includes("all") ? (
                          <Badge variant="default">Todos los permisos</Badge>
                        ) : (
                          <span>{user.permissions?.length ?? 0} permisos</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Activo" : "Inactivo"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !error && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No hay usuarios para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
