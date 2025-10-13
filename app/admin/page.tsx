"use client"

import { ProtectedRoute } from "@/modules/core/protected-route"
import { DashboardLayout } from "@/modules/core/dashboard-layout"
import { AdminTabs } from "@/modules/admin/AdminTabs"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredAny={["gestionar_roles", "ver_permisos"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administración</h1>
            <p className="text-muted-foreground">Gestión de sucursales, usuarios y roles</p>
          </div>
          <AdminTabs />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
