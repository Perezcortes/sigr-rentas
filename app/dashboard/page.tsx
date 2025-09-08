"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardStats } from "@/components/dashboard-stats"
import { RentalsChart } from "@/components/rentals-chart"
import { ProspectsChart } from "@/components/prospects-chart"
import { MessageCenter } from "@/components/message-center"
import { QuickAccess } from "@/components/quick-access"

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
