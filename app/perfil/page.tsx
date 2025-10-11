"use client"

import { ProtectedRoute } from "@/modules/core/protected-route"
import { DashboardLayout } from "@/modules/core/dashboard-layout"
import { UserProfile } from "@/components/user-profile"

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información personal y configuración de cuenta</p>
          </div>

          {/* User Profile */}
          <UserProfile />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
