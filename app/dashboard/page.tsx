"use client"

import { ProtectedRoute } from "@/modules/core/protected-route"
import { DashboardLayout } from "@/modules/core/dashboard-layout"
import { DashboardStats } from "@/modules/dashboard/DashboardStats"
import { RentalsChart } from "@/modules/dashboard/RentalsChart"
import { ProspectsChart } from "@/modules/dashboard/ProspectsChart"
import { MessageCenter } from "@/modules/dashboard/MessageCenter"
import { QuickAccess } from "@/modules/dashboard/QuickAccess"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen de indicadores principales de la oficina</p>
          </div>

          {/* Main Stats */}
          <DashboardStats />

          {/* Quick Access to Files by Status */}
          <QuickAccess />

          {/* Charts and Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RentalsChart />
            <ProspectsChart />
          </div>

          {/* Message Center Widget */}
          <MessageCenter />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
