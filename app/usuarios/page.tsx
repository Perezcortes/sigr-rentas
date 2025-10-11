"use client"

import { ProtectedRoute } from "@/modules/core/protected-route"
import { DashboardLayout } from "@/modules/core/dashboard-layout"
import { UserManagement } from "@/modules/admin/users/UserManagementView"

export default function UsuariosPage() {
  return (
    <ProtectedRoute requiredPermission="usuarios">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
            <p className="text-muted-foreground">Gestión completa de usuarios del sistema</p>
          </div>

          {/* User Management */}
          <UserManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
