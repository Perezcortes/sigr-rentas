"use client"

import { ProtectedRoute } from "@/modules/core/protected-route"
import { DashboardLayout } from "@/modules/core/dashboard-layout"
import RentalManagement from "@/modules/rentas/views/RentalListView"

export default function RentasPage() {
  return (
    <ProtectedRoute requiredPermission="mis_rentas">
      <DashboardLayout>
        <RentalManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}