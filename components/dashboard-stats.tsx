"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Home, Users, DollarSign, FileText } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "Propiedades Activas",
      value: "124",
      change: "+12%",
      trend: "up",
      icon: Home,
      color: "text-blue-600",
    },
    {
      title: "Interesados del Mes",
      value: "89",
      change: "+23%",
      trend: "up",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Ingresos Mensuales",
      value: "$2,450,000",
      change: "+8%",
      trend: "up",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Contratos Pendientes",
      value: "15",
      change: "-5%",
      trend: "down",
      icon: FileText,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
              )}
              <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
              <span className="ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
