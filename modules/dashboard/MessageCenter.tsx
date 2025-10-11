"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Clock, User } from "lucide-react"

export function MessageCenter() {
  const messages = [
    {
      id: 1,
      from: "María González",
      subject: "Consulta sobre mantenimiento - Propiedad #123",
      time: "Hace 2 horas",
      unread: true,
      type: "maintenance",
    },
    {
      id: 2,
      from: "Carlos Ruiz",
      subject: "Solicitud de renovación de contrato",
      time: "Hace 4 horas",
      unread: true,
      type: "renewal",
    },
    {
      id: 3,
      from: "Ana Martínez",
      subject: "Reporte de incidencia en el inmueble",
      time: "Hace 1 día",
      unread: false,
      type: "incident",
    },
    {
      id: 4,
      from: "Luis Hernández",
      subject: "Confirmación de pago mensual",
      time: "Hace 2 días",
      unread: false,
      type: "payment",
    },
  ]

  const unreadCount = messages.filter((msg) => msg.unread).length

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Centro de Mensajes
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                message.unread ? "bg-muted/30 border-primary/20" : "border-border"
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${message.unread ? "text-foreground" : "text-muted-foreground"}`}>
                    {message.from}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {message.time}
                  </div>
                </div>
                <p className={`text-sm ${message.unread ? "text-foreground" : "text-muted-foreground"} truncate`}>
                  {message.subject}
                </p>
              </div>
              {message.unread && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
