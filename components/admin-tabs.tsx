"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BranchManagement } from "@/components/branch-management"
import { UserManagement } from "@/components/user-management"
import { RoleManagement } from "@/components/role-management"
import { Building2, Users, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission as hasPermLib } from "@/lib/auth"
import { useMemo } from "react"

export function AdminTabs() {
  const { user } = useAuth()
  const canViewRoles = useMemo(
    () => hasPermLib(user, "gestionar_roles") || hasPermLib(user, "ver_permisos"),
    [user]
  )

  const defaultValue = canViewRoles ? "roles" : "branches"

  return (
    <Tabs defaultValue={defaultValue} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-2xl">
        <TabsTrigger value="branches" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Sucursales
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuarios
        </TabsTrigger>
        {canViewRoles && (
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="branches" className="space-y-6">
        <BranchManagement />
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <UserManagement />
      </TabsContent>

      {canViewRoles && (
        <TabsContent value="roles" className="space-y-6">
          <RoleManagement />
        </TabsContent>
      )}
    </Tabs>
  )
}
