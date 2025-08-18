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
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      iconColor: "text-yellow-600",
    },
    {
      status: "Completados",
      count: 156,
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
      iconColor: "text-green-600",
    },
    {
      status: "Pendientes",
      count: 12,
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      iconColor: "text-orange-600",
    },
    {
      status: "Cancelados",
      count: 8,
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200",
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
              <div className="text-center">
                <div className="font-semibold text-foreground">{item.status}</div>
                <Badge variant="secondary" className={`mt-1 ${item.color}`}>
                  {item.count}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
