"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Eye, Edit, Home, Calendar, DollarSign, FileText } from "lucide-react"
import type { Rental, RentalStatus } from "@/types/rental"
import { RentalProcess } from "@/components/rental-process"

export function RentalManagement() {
  const [rentals, setRentals] = useState<Rental[]>([
    {
      id: "1",
      status: "en_proceso",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      inquilino: {
        type: "fisica",
        nombre: "Juan Pérez",
        telefono: "+52 55 1234-5678",
        correo: "juan.perez@email.com",
      },
      obligadoSolidario: {
        type: "fisica",
        nombre: "María Pérez",
        telefono: "+52 55 2345-6789",
        correo: "maria.perez@email.com",
      },
      propietario: {
        type: "fisica",
        nombre: "Carlos González",
        telefono: "+52 55 3456-7890",
        correo: "carlos.gonzalez@email.com",
      },
      propiedad: {
        tipo: "Departamento",
        cp: "03100",
        estado: "CDMX",
        ciudad: "Ciudad de México",
        colonia: "Del Valle",
        calle: "Av. Universidad",
        numero: "123",
        interior: "4B",
        metros: 85,
        renta: 15000,
      },
      documentos: [],
    },
    {
      id: "2",
      status: "rentada",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-14",
      inquilino: {
        type: "moral",
        razonSocial: "Empresa ABC S.A. de C.V.",
        nombreComercial: "ABC Corp",
        representante: "Ana Martínez",
        telefono: "+52 55 4567-8901",
        correo: "ana.martinez@abccorp.com",
      },
      propietario: {
        type: "fisica",
        nombre: "Luis Hernández",
        telefono: "+52 55 5678-9012",
        correo: "luis.hernandez@email.com",
      },
      propiedad: {
        tipo: "Oficina",
        cp: "11000",
        estado: "CDMX",
        ciudad: "Ciudad de México",
        colonia: "Polanco",
        calle: "Av. Masaryk",
        numero: "456",
        metros: 120,
        renta: 35000,
      },
      documentos: [],
      activacion: {
        fechaInicio: "2024-01-15",
        plazoMeses: 12,
        fechaFin: "2025-01-15",
        montoRenta: 35000,
        montoComision: 3500,
        tipoComision: "completa",
        montoNetoComision: 3500,
        formaCobroComision: "transferencia",
        activated: true,
      },
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RentalStatus | "all">("all")
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [isNewRentalDialogOpen, setIsNewRentalDialogOpen] = useState(false)

  const statusLabels: Record<RentalStatus, string> = {
    apartada: "Apartada",
    en_proceso: "En Proceso",
    rentada: "Rentada",
    cancelada: "Cancelada",
    rechazada: "Rechazada",
    rescindida: "Rescindida",
  }

  const statusColors: Record<RentalStatus, string> = {
    apartada: "bg-yellow-100 text-yellow-800",
    en_proceso: "bg-blue-100 text-blue-800",
    rentada: "bg-green-100 text-green-800",
    cancelada: "bg-gray-100 text-gray-800",
    rechazada: "bg-red-100 text-red-800",
    rescindida: "bg-orange-100 text-orange-800",
  }

  const filteredRentals = rentals.filter((rental) => {
    const matchesSearch =
      rental.inquilino.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.inquilino.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.propiedad.calle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || rental.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewRental = (rental: Rental) => {
    setSelectedRental(rental)
    setIsProcessDialogOpen(true)
  }

  const handleNewRental = () => {
    setIsNewRentalDialogOpen(true)
  }

  const stats = [
    {
      title: "Total Rentas",
      value: rentals.length.toString(),
      icon: Home,
      color: "text-blue-600",
    },
    {
      title: "En Proceso",
      value: rentals.filter((r) => r.status === "en_proceso").length.toString(),
      icon: Calendar,
      color: "text-yellow-600",
    },
    {
      title: "Rentadas",
      value: rentals.filter((r) => r.status === "rentada").length.toString(),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Pendientes",
      value: rentals.filter((r) => r.status === "apartada").length.toString(),
      icon: FileText,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions and Filters */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Rentas</CardTitle>
              <CardDescription>Administra todos los procesos de renta</CardDescription>
            </div>
            <Dialog open={isNewRentalDialogOpen} onOpenChange={setIsNewRentalDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewRental} className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Proceso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Proceso de Renta</DialogTitle>
                  <DialogDescription>Selecciona cómo deseas iniciar el proceso de renta</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2 bg-transparent">
                    <div className="font-semibold">Desde Oportunidad</div>
                    <div className="text-sm text-muted-foreground">Crear proceso desde un interesado existente</div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2 bg-transparent">
                    <div className="font-semibold">Proceso Manual</div>
                    <div className="text-sm text-muted-foreground">Crear proceso completamente nuevo</div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por inquilino o propiedad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: RentalStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="apartada">Apartada</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="rentada">Rentada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="rescindida">Rescindida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rentals Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inquilino</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Renta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {rental.inquilino.type === "fisica" ? rental.inquilino.nombre : rental.inquilino.razonSocial}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rental.inquilino.type === "fisica" ? "Persona Física" : "Persona Moral"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {rental.propiedad.tipo} - {rental.propiedad.calle} {rental.propiedad.numero}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rental.propiedad.colonia}, {rental.propiedad.ciudad}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${rental.propiedad.renta.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{rental.propiedad.metros}m²</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[rental.status]}>{statusLabels[rental.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{rental.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewRental(rental)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rental Process Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Proceso de Renta - {selectedRental?.inquilino.nombre || selectedRental?.inquilino.razonSocial}
            </DialogTitle>
          </DialogHeader>
          {selectedRental && <RentalProcess rental={selectedRental} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
