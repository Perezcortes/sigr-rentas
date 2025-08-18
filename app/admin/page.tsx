"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminTabs } from "@/components/admin-tabs"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredPermission="admin">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administración</h1>
            <p className="text-muted-foreground">Gestión de sucursales y usuarios del sistema</p>
          </div>

          {/* Admin Tabs */}
          <AdminTabs />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
