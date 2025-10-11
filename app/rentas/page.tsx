"use client"

import { ProtectedRoute } from "@/modules/core/protected-route"
import { DashboardLayout } from "@/modules/core/dashboard-layout"
import { RentalManagement } from "@/components/rental-management"

export default function RentasPage() {
  return (
    <ProtectedRoute requiredPermission="mis_rentas">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Rentas</h1>
            <p className="text-muted-foreground">Gestión completa de procesos de renta</p>
          </div>

          {/* Rental Management */}
          <RentalManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
