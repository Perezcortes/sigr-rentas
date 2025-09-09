"use client"

import { useEffect, useState } from "react"
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

/** ==== Config API ==== */
const RAW = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const BASE = RAW.replace(/\/+$/, "")

/** ==== Mapeo de roles <-> role_id (según tu seed típico) ==== */
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

/** ==== Helpers de normalización (alineados a tu JSON) ==== */
function normalizeRoleToUserRole(value: any): UserRole {
  // acepta objetos { nombre } o strings
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
  // nombre completo en español
  const fullName =
    u?.nombre_completo ||
    [u?.nombres, u?.primer_apellido, u?.segundo_apellido].filter(Boolean).join(" ").trim() ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim() ||
    u?.username ||
    (u?.correo ?? u?.email)?.split("@")?.[0] ||
    "Sin nombre"

  // email
  const email = u?.correo ?? u?.email ?? ""

  // rol desde role.nombre o role_id
  let role: UserRole = normalizeRoleToUserRole(u?.role ?? u?.rol)
  if (!role && typeof u?.role_id === "number") {
    role = ROLE_BY_ID[u.role_id] ?? "agente"
  }

  // oficinas: concatena todas por nombre si hay varias
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

  // permisos (si en el futuro vienen como 'permisos' u 'permissions')
  const rawPerms = u?.permisos ?? u?.permissions ?? u?.role?.permisos ?? u?.role?.permissions ?? []
  const permissions: string[] = Array.isArray(rawPerms)
    ? rawPerms
        .map((p: any) => (typeof p === "string" ? p : p?.nombre ?? p?.name ?? null))
        .filter(Boolean)
    : []

  // estado y último acceso
  const isActive =
    typeof u?.is_active === "boolean"
      ? u.is_active
      : typeof u?.activo === "boolean"
      ? u.activo
      : !!u?.isActive

  const lastLoginISO = u?.last_login_at ?? u?.ultimo_acceso ?? u?.lastLogin
  const lastLogin = lastLoginISO ? new Date(lastLoginISO).toLocaleString() : "Nunca"

  // id seguro para keys
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

/** ==== Helpers UI ==== */
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

function parseOfficeIds(text: string): Array<{ id: number }> {
  if (!text) return []
  return Array.from(
    new Set(
      text
        .split(/[,\s]+/)
        .map((t) => Number(t.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
    )
  ).map((id) => ({ id }))
}

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ===== Modal & formulario =====
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

  // Form alineado a Swagger (POST/ PATCH)
  const [formData, setFormData] = useState({
    // Campos en español
    nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    correo: "",
    telefono: "",
    whatsapp: "",
    role: "agente" as UserRole, // para elegir role_id
    isActive: true,
    // Oficinas (IDs separados por coma/espacios, UI-friendly)
    officesText: "",
    // Contraseña: requerida al crear, opcional al editar
    password: genTempPassword(),
    // Permisos opcionales (UI local)
    permissions: [] as string[],
  })

  // ===== Carga desde backend =====
  async function fetchUsersFromApi() {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const res = await fetch(`${BASE}/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || `Error ${res.status}`)
      }
      const raw = await res.json()
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []
      const mapped = list.map(toSystemUser)
      setUsers(mapped)
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar la lista de usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersFromApi()
  }, [])

  // ===== Crear / Actualizar / Eliminar =====
  async function createUser() {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

      const role_id = ROLE_ID_BY_ROLE[formData.role] ?? 4
      const offices = parseOfficeIds(formData.officesText)

      // Payload EXACTO según Swagger POST /users
      const payload: any = {
        nombres: formData.nombres,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        correo: formData.correo,
        password: formData.password, // requerido al crear
        role_id,
        telefono: formData.telefono || undefined,
        whatsapp: formData.whatsapp || undefined,
        offices, // [{ id }]
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

      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || `Error ${res.status}`)
      }

      setSuccess("Usuario creado correctamente")
      setIsDialogOpen(false)
      await fetchUsersFromApi()
    } catch (e: any) {
      setError(e?.message || "No se pudo crear el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  async function updateUser(userId: string) {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

      const role_id = ROLE_ID_BY_ROLE[formData.role] ?? 4
      const offices = parseOfficeIds(formData.officesText)

      // Payload EXACTO según Swagger PATCH /users/{id}
      const payload: any = {
        nombres: formData.nombres,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        correo: formData.correo,
        role_id,
        telefono: formData.telefono || undefined,
        whatsapp: formData.whatsapp || undefined,
        offices,
        is_active: formData.isActive,
      }
      // password es OPCIONAL en PATCH
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
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || `Error ${res.status}`)
      }

      setSuccess("Usuario actualizado")
      setIsDialogOpen(false)
      await fetchUsersFromApi()
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  // ===== CRUD UI =====
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
      officesText: "",
      password: genTempPassword(),
      permissions: [],
    })
    setIsDialogOpen(true)
    setSuccess(null)
    setError(null)
  }

  const handleEditUser = (user: SystemUser) => {
    // Como la lista no trae teléfono/whatsapp/ids de oficinas directamente, el usuario puede completarlos.
    // Intentamos dividir el nombre para precargar.
    const parts = user.name.trim().split(/\s+/)
    let nombres = ""
    let primer_apellido = ""
    let segundo_apellido = ""
    if (parts.length >= 3) {
      segundo_apellido = parts.pop() as string
      primer_apellido = parts.pop() as string
      nombres = parts.join(" ")
    } else if (parts.length === 2) {
      primer_apellido = parts[1]
      nombres = parts[0]
    } else if (parts.length === 1) {
      nombres = parts[0]
    }

    setEditingUser(user)
    setFormData({
      nombres,
      primer_apellido,
      segundo_apellido,
      correo: user.email,
      telefono: "",
      whatsapp: "",
      role: user.role,
      isActive: user.isActive,
      officesText: "", // el admin puede escribir "1,2" si aplica
      password: "", // opcional al editar
      permissions: user.permissions ?? [],
    })
    setIsDialogOpen(true)
    setSuccess(null)
    setError(null)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id)
    } else {
      createUser()
    }
  }

  const handleDeleteUser = async (id: string) => {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const res = await fetch(`${BASE}/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || `Error ${res.status}`)
      }
      setSuccess("Usuario eliminado")
      await fetchUsersFromApi()
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, permissions: [...formData.permissions, permissionId] })
    } else {
      setFormData({ ...formData, permissions: formData.permissions.filter((p) => p !== permissionId) })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los usuarios y sus permisos en el sistema</p>
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
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Modifica los datos y permisos del usuario"
                    : "Completa la información para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Nombres y Apellidos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                      placeholder="Juan Carlos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primer_apellido">Primer apellido</Label>
                    <Input
                      id="primer_apellido"
                      value={formData.primer_apellido}
                      onChange={(e) => setFormData({ ...formData, primer_apellido: e.target.value })}
                      placeholder="Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="segundo_apellido">Segundo apellido</Label>
                    <Input
                      id="segundo_apellido"
                      value={formData.segundo_apellido}
                      onChange={(e) => setFormData({ ...formData, segundo_apellido: e.target.value })}
                      placeholder="García"
                    />
                  </div>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      placeholder="usuario@sigr.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="9512345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="9512345678"
                    />
                  </div>
                </div>

                {/* Rol y Oficinas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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

                  <div className="space-y-2">
                    <Label htmlFor="officesText">Oficinas (IDs separados por coma/espacios)</Label>
                    <Input
                      id="officesText"
                      value={formData.officesText}
                      onChange={(e) => setFormData({ ...formData, officesText: e.target.value })}
                      placeholder="1, 2"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Usuario Activo</Label>
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editingUser ? "Nueva contraseña (opcional)" : "Contraseña temporal"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Dejar vacío para no cambiar" : ""}
                    />
                    {!editingUser && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, password: genTempPassword() })}
                      >
                        Generar
                      </Button>
                    )}
                  </div>
                  {!editingUser && (
                    <p className="text-xs text-muted-foreground">
                      Se enviará como contraseña inicial; el usuario podrá cambiarla después.
                    </p>
                  )}
                </div>

                {/* Permisos opcionales (si tu backend llegara a aceptarlos) */}
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
                  <p className="text-xs text-muted-foreground">
                    *Actualmente el endpoint no recibe permisos; se muestran solo como referencia en la UI.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser} className="bg-primary hover:bg-primary/90" disabled={submitting}>
                  {submitting ? "Guardando..." : editingUser ? "Guardar Cambios" : "Crear Usuario"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "administrador").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "agente").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
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
                    <TableCell>
                      <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                    </TableCell>
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
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
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
