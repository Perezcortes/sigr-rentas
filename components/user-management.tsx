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

/** ==== Helpers de normalización para mapear la respuesta del backend ==== */
function normalizeRoleToUserRole(value: any): UserRole {
  const v = String(
    typeof value === "object" && value?.name ? value.name : value ?? ""
  )
    .trim()
    .toLowerCase()

  const map: Record<string, UserRole> = {
    administrador: "administrador",
    "administrador del sistema": "administrador",
    admin: "administrador",
    gerente: "gerente",
    coordinator: "coordinador",
    coordinador: "coordinador",
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
    u?.full_name ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim() ||
    u?.username ||
    u?.email?.split("@")?.[0] ||
    "Sin nombre"

  const role: UserRole = normalizeRoleToUserRole(u?.role)

  const oficinaName =
    (typeof u?.office === "object" ? u?.office?.name : u?.office) || "—"

  const permissions: string[] = Array.isArray(u?.permissions)
    ? u.permissions
        .map((p: any) => (typeof p === "string" ? p : p?.name))
        .filter(Boolean)
    : []

  const isActive = typeof u?.is_active === "boolean" ? u.is_active : !!u?.isActive

  const lastLoginISO = u?.last_login_at || u?.lastLogin
  const lastLogin =
    lastLoginISO ? new Date(lastLoginISO).toLocaleString() : "Nunca"

  // FIX: asegurar un ID estable y no vacío para keys
  const safeId =
    (u?.id && String(u.id)) ||
    (u?.email && `email:${String(u.email)}`) ||
    (u?.username && `user:${String(u.username)}`) ||
    ([u?.first_name, u?.last_name].filter(Boolean).join("-") || "no-id")

  return {
    id: safeId,
    name: String(fullName),
    email: String(u?.email ?? ""),
    role,
    oficina: String(oficinaName),
    permissions,
    isActive,
    lastLogin,
  }
}

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

/** ==== util: partir nombre completo en first/last ==== */
function splitName(full: string) {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.slice(-1).join(" ") }
}

/** ==== util: contraseña temporal ==== */
function genTempPassword() {
  // 10 chars: mayúscula, minúscula, dígito, símbolo sencillo
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const symbols = "!@#$%*"
  const all = letters + digits + symbols
  let out = ""
  for (let i = 0; i < 10; i++) {
    out += all[Math.floor(Math.random() * all.length)]
  }
  return out
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "agente" as UserRole,
    oficina: "",
    permissions: [] as string[],
    isActive: true,
    tempPassword: genTempPassword(), // para creación
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

  // ===== Crear / Actualizar en backend =====
  async function createUser() {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const { firstName, lastName } = splitName(formData.name)
      const roleName = formData.role // ejemplo: "gerente"
      const username = formData.email?.split("@")?.[0] ?? formData.email

      // payload tolerante a distintos DTOs (camelCase / snake_case)
      const payload: any = {
        email: formData.email,
        username,
        password: formData.tempPassword, // temporal
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        // rol: si tu API exige roleId, cámbialo aquí; por ahora mandamos por nombre también
        role: roleName,
        roleName,
        isActive: formData.isActive,
        is_active: formData.isActive,
        // oficina: si tu API exige officeId, cámbialo aquí; por ahora mandamos el texto
        office: formData.oficina,
        officeName: formData.oficina,
      }

      // si marcaste permisos manuales (tu backend podría ignorarlos si se derivan del rol)
      if (formData.permissions?.length) {
        payload.permissions = formData.permissions
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
      const { firstName, lastName } = splitName(formData.name)
      const roleName = formData.role

      const payload: any = {
        email: formData.email,
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        role: roleName,
        roleName,
        isActive: formData.isActive,
        is_active: formData.isActive,
        office: formData.oficina,
        officeName: formData.oficina,
      }
      if (formData.permissions?.length) payload.permissions = formData.permissions

      const res = await fetch(`${BASE}/users/${encodeURIComponent(userId)}`, {
        method: "PUT",
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
      name: "",
      email: "",
      role: "agente",
      oficina: "",
      permissions: [],
      isActive: true,
      tempPassword: genTempPassword(),
    })
    setIsDialogOpen(true)
    setSuccess(null)
    setError(null)
  }

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      oficina: user.oficina,
      permissions: user.permissions ?? [],
      isActive: user.isActive,
      tempPassword: "", // no mostramos password al editar
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
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Modifica los datos y permisos del usuario"
                    : "Completa la información para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="usuario@rentas.com"
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempPassword">Contraseña temporal</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tempPassword"
                          value={formData.tempPassword}
                          onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({ ...formData, tempPassword: genTempPassword() })}
                        >
                          Generar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Se enviará como contraseña inicial; el usuario podrá cambiarla después.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="oficina">Oficina</Label>
                    <Input
                      id="oficina"
                      value={formData.oficina}
                      onChange={(e) => setFormData({ ...formData, oficina: e.target.value })}
                      placeholder="Oficina Central"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Usuario Activo</Label>
                </div>

                <div className="space-y-3">
                  <Label>Permisos (opcional)</Label>
                  <div className="grid grid-cols-2 gap-3">
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
