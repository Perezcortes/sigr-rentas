"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function QuickAccess() {
  const statusItems = [
    {
      status: "En Proceso",
      count: 23,
      icon: Clock,
      color: "bg-primary text-white border-primary",
      iconColor: "text-primary",
    },
    {
      status: "Completados",
      count: 156,
      icon: CheckCircle,
      color: "bg-secondary text-white border-secondary",
      iconColor: "text-secondary",
    },
    {
      status: "Pendientes",
      count: 12,
      icon: AlertCircle,
      color: "bg-[#4F4F4F] text-white border-[#4F4F4F]",
      iconColor: "text-[#4F4F4F]",
    },
    {
      status: "Cancelados",
      count: 8,
      icon: XCircle,
      color: "bg-red-600 text-white border-red-600",
      iconColor: "text-red-600",
    },
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-primary" />
          Acceso Directo a Expedientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusItems.map((item) => (
            <Button
              key={item.status}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted/50 bg-transparent"
            >
              <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              <span
                className={`inline-flex items-center px-2 py-1 rounded-md leading-none text-[14px] font-bold ${item.color}`}
              >
                {item.status}
              </span>
              <Badge variant="outline" className="mt-1 bg-transparent border-0">
  {item.count}
</Badge>

            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
