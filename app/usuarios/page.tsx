"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagement } from "@/components/user-management"

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
