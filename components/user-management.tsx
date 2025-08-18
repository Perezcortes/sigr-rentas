"use client"

import { useState } from "react"
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
import { Users, Plus, Edit, Trash2, Mail, Building2, Shield } from "lucide-react"
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

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: "1",
      name: "Administrador Sistema",
      email: "admin@rentas.com",
      role: "administrador",
      oficina: "Oficina Central",
      permissions: ["all"],
      isActive: true,
      lastLogin: "2024-01-15 10:30",
    },
    {
      id: "2",
      name: "María González",
      email: "gerente@rentas.com",
      role: "gerente",
      oficina: "Oficina Central",
      permissions: [
        "dashboard",
        "reportes",
        "centro_pagos",
        "interesados",
        "mis_rentas",
        "renovaciones",
        "administraciones",
      ],
      isActive: true,
      lastLogin: "2024-01-15 09:15",
    },
    {
      id: "3",
      name: "Carlos Ruiz",
      email: "agente@rentas.com",
      role: "agente",
      oficina: "Sucursal Norte",
      permissions: ["dashboard", "interesados", "mis_rentas", "renovaciones"],
      isActive: true,
      lastLogin: "2024-01-14 16:45",
    },
    {
      id: "4",
      name: "Ana Martínez",
      email: "coordinador@rentas.com",
      role: "coordinador",
      oficina: "Sucursal Sur",
      permissions: ["dashboard", "interesados", "mis_rentas", "administraciones"],
      isActive: false,
      lastLogin: "2024-01-10 14:20",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "agente" as UserRole,
    oficina: "",
    permissions: [] as string[],
    isActive: true,
  })

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      role: "agente",
      oficina: "",
      permissions: [],
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      oficina: user.oficina,
      permissions: user.permissions,
      isActive: user.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...formData, lastLogin: u.lastLogin } : u)))
    } else {
      const newUser: SystemUser = {
        id: Date.now().toString(),
        ...formData,
        lastLogin: "Nunca",
      }
      setUsers([...users, newUser])
    }
    setIsDialogOpen(false)
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
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
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90">
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
                  <Select
                    value={formData.oficina}
                    onValueChange={(value) => setFormData({ ...formData, oficina: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar oficina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oficina Central">Oficina Central</SelectItem>
                      <SelectItem value="Sucursal Norte">Sucursal Norte</SelectItem>
                      <SelectItem value="Sucursal Sur">Sucursal Sur</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label>Permisos</Label>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUser} className="bg-primary hover:bg-primary/90">
                {editingUser ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              {users.map((user) => (
                <TableRow key={user.id}>
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
                      {user.permissions.includes("all") ? (
                        <Badge variant="default">Todos los permisos</Badge>
                      ) : (
                        <span>{user.permissions.length} permisos</span>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
