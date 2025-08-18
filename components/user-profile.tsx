"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { getRoleDisplayName } from "@/lib/auth"
import { User, Mail, Phone, Building2, Shield, Settings, Save } from "lucide-react"

export function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    notifications: true,
    emailAlerts: true,
  })

  const handleSave = () => {
    // Here you would typically save the user profile data
    console.log("Saving profile data:", formData)
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-base">
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>{getRoleDisplayName(user.role)}</span>
                  </Badge>
                  {user.oficina && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Building2 className="h-3 w-3" />
                      <span>{user.oficina}</span>
                    </Badge>
                  )}
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardDescription>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-primary hover:bg-primary/90" : ""}
            >
              <Settings className="mr-2 h-4 w-4" />
              {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Información Personal
            </CardTitle>
            <CardDescription>Datos básicos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  placeholder="Agregar número de teléfono"
                />
              </div>
            </div>

            {isEditing && (
              <>
                <Separator />
                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Configuración de Cuenta
            </CardTitle>
            <CardDescription>Preferencias y notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones del sistema</p>
              </div>
              <Switch
                checked={formData.notifications}
                onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas por Email</Label>
                <p className="text-sm text-muted-foreground">Recibir alertas importantes por correo</p>
              </div>
              <Switch
                checked={formData.emailAlerts}
                onCheckedChange={(checked) => setFormData({ ...formData, emailAlerts: checked })}
                disabled={!isEditing}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Información del Sistema</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de Usuario:</span>
                  <span className="font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rol:</span>
                  <span>{getRoleDisplayName(user.role)}</span>
                </div>
                {user.oficina && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oficina:</span>
                    <span>{user.oficina}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Permisos y Accesos
          </CardTitle>
          <CardDescription>Módulos y funcionalidades disponibles para tu rol</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {user.permissions.includes("all") ? (
              <Badge variant="default" className="justify-center py-2">
                Acceso Total al Sistema
              </Badge>
            ) : (
              user.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="justify-center py-2">
                  {permission.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
