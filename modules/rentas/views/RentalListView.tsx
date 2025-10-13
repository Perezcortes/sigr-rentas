"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
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
import { Label } from "@/components/ui/label"
import {
  Plus, Search, Eye, Edit, Home, Calendar, DollarSign, FileText, RefreshCw
} from "lucide-react"
import type { Rental, RentalStatus } from "@/modules/rentas/types"
import { RentalProcess } from "@/modules/rentas/views/RentalProcessView"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/modules/auth/auth.service"

/* ─────────────────────────────────────────
   Utils
────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statusLabels: Record<RentalStatus, string> = {
  apartada: "Apartada", en_proceso: "En Proceso", rentada: "Rentada",
  cancelada: "Cancelada", rechazada: "Rechazada", rescindida: "Rescindida",
}
const statusColors: Record<RentalStatus, string> = {
  apartada: "bg-yellow-100 text-yellow-800",
  en_proceso: "bg-blue-100 text-blue-800",
  rentada: "bg-green-100 text-green-800",
  cancelada: "bg-gray-100 text-gray-800",
  rechazada: "bg-red-100 text-red-800",
  rescindida: "bg-orange-100 text-orange-800",
}

/* map row -> Rental (igual que antes) */
function toRental(row: any): Rental {
  const inq = row?.inquilino ?? {}
  const prop = row?.propietario ?? {}
  const obl = row?.obligado_solidario ?? null
  const house = row?.propiedad ?? {}
  const status: RentalStatus = (row?.status as RentalStatus) ?? (row?.estado as RentalStatus) ?? "en_proceso"

  return {
    id: String(row?.id ?? row?.uuid ?? crypto.randomUUID()),
    status,
    createdAt: String(row?.created_at ?? row?.createdAt ?? "").slice(0, 10),
    updatedAt: String(row?.updated_at ?? row?.updatedAt ?? "").slice(0, 10),
    inquilino: {
      type: (inq?.tipo_persona ?? "fisica") === "moral" ? "moral" : "fisica",
      nombre: inq?.nombre_completo ?? null,
      razonSocial: inq?.razon_social ?? null,
      nombreComercial: inq?.nombre_comercial ?? null,
      representante: inq?.representante_legal ?? null,
      telefono: inq?.telefono ?? "",
      correo: inq?.correo ?? "",
    },
    propietario: {
      type: (prop?.tipo_persona ?? "fisica") === "moral" ? "moral" : "fisica",
      nombre: prop?.nombre_completo ?? null,
      razonSocial: prop?.razon_social ?? null,
      nombreComercial: prop?.nombre_comercial ?? null,
      representante: prop?.representante_legal ?? null,
      telefono: prop?.telefono ?? "",
      correo: prop?.correo ?? "",
    },
    obligadoSolidario: obl
      ? {
          type: (obl?.tipo_persona ?? "fisica") === "moral" ? "moral" : "fisica",
          nombre: obl?.nombre_completo ?? null,
          razonSocial: obl?.razon_social ?? null,
          nombreComercial: obl?.nombre_comercial ?? null,
          representante: obl?.representante_legal ?? null,
          telefono: obl?.telefono ?? "",
          correo: obl?.correo ?? "",
        }
      : undefined,
    propiedad: {
      tipo: house?.tipo ?? "",
      cp: house?.codigo_postal ?? house?.cp ?? "",
      estado: String(house?.estado_id ?? house?.estado ?? ""),
      ciudad: String(house?.ciudad_id ?? house?.ciudad ?? ""),
      colonia: house?.colonia ?? "",
      calle: house?.calle ?? "",
      numero: house?.numero ?? "",
      interior: house?.interior ?? "",
      metros: Number(house?.metros_cuadrados ?? house?.metros ?? 0),
      renta: Number(house?.monto_renta ?? house?.renta ?? 0),
      referencia: house?.referencia ?? "",
    },
    documentos: Array.isArray(row?.documentos) ? row.documentos : [],
    activacion: row?.activacion ?? undefined,
  }
}

/* ─────────────────────────────────────────
   Quick Create form (modal)
   (ahora con condicional FÍSICA vs MORAL)
────────────────────────────────────────── */
type QuickForm = {
  tipoPersona: "fisica" | "moral" | ""
  tipoInmueble: string
  correo: string
  // Física
  nombreCompleto: string
  // Moral
  razonSocial: string
  nombreComercial: string
  representanteLegal: string
}

const emptyQuick: QuickForm = {
  tipoPersona: "",
  tipoInmueble: "",
  correo: "",
  nombreCompleto: "",
  razonSocial: "",
  nombreComercial: "",
  representanteLegal: "",
}

export function RentalManagement() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RentalStatus | "all">("all")

  // modal ver proceso (fallback)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)

  // modal quick create
  const [isQuickOpen, setIsQuickOpen] = useState(false)
  const [qf, setQf] = useState<QuickForm>(emptyQuick)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const userPerms: string[] = (user as any)?.permissions ?? (user as any)?.permisos ?? []
  const canCreate = userPerms.includes("crear_rentas")
  const canView = userPerms.includes("ver_rentas")

  // stats
  const stats = useMemo(() => ([
    { title: "Total Rentas", value: rentals.length.toString(), icon: Home, color: "text-blue-600" },
    { title: "En Proceso", value: rentals.filter((r) => r.status === "en_proceso").length.toString(), icon: Calendar, color: "text-yellow-600" },
    { title: "Rentadas", value: rentals.filter((r) => r.status === "rentada").length.toString(), icon: DollarSign, color: "text-green-600" },
    { title: "Pendientes", value: rentals.filter((r) => r.status === "apartada").length.toString(), icon: FileText, color: "text-orange-600" },
  ]), [rentals])

  /* Carga inicial */
  const didFetchRef = useRef(false)
  useEffect(() => {
    if (!canView) return
    if (didFetchRef.current) return
    didFetchRef.current = true

    const ac = new AbortController()
    setLoading(true)
    ;(async () => {
      try {
        const raw = await api("/rentals", { method: "GET", signal: ac.signal as any })
        const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
        setRentals(list.map(toRental))
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          toast({ title: "Error al cargar", description: e?.message ?? "No se pudieron obtener las rentas", variant: "destructive" })
        }
      } finally {
        setLoading(false)
      }
    })()

    return () => ac.abort()
  }, [canView, toast])

  const handleManualRefresh = async () => {
    if (!canView) return
    setLoading(true)
    try {
      const raw = await api("/rentals", { method: "GET" })
      const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
      setRentals(list.map(toRental))
    } catch (e: any) {
      toast({ title: "Error al cargar", description: e?.message ?? "No se pudieron obtener las rentas", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredRentals = rentals.filter((r) => {
    const q = searchTerm.toLowerCase()
    const inq = (r.inquilino.nombre ?? r.inquilino.razonSocial ?? "").toLowerCase()
    const calle = (r.propiedad.calle ?? "").toLowerCase()
    return (inq.includes(q) || calle.includes(q)) && (statusFilter === "all" || r.status === statusFilter)
  })

  /* Ver proceso: abre pestaña y si está bloqueado usa modal con RentalProcess */
  const openProcess = (r: Rental) => {
    try {
      window.open(`/rentas/${encodeURIComponent(r.id)}`, "_blank")
    } catch {
      setSelectedRental(r)
      setIsProcessDialogOpen(true)
    }
  }

  /* Validación según tipo de persona */
  const validateQuick = (): string | null => {
    if (!qf.tipoPersona) return "Selecciona el tipo de persona."
    if (!qf.tipoInmueble) return "Selecciona el tipo de inmueble."
    if (!EMAIL_RE.test((qf.correo ?? "").trim())) return "El correo no es válido."

    if (qf.tipoPersona === "fisica") {
      if (!(qf.nombreCompleto ?? "").trim()) return "El nombre completo es obligatorio."
    } else if (qf.tipoPersona === "moral") {
      if (!(qf.razonSocial ?? "").trim()) return "La razón social es obligatoria."
    }
    return null
  }

  const handleSaveQuick = async () => {
    const err = validateQuick()
    if (err) {
      toast({ title: "Revisa el formulario", description: err, variant: "destructive" })
      return
    }
    if (!canCreate) {
      toast({ title: "Permisos", description: "No tienes permiso para crear rentas.", variant: "destructive" })
      return
    }

    const creadoPor = (user as any)?.id ?? (user as any)?.userId ?? 1

    // nombre_completo: física = nombreCompleto | moral = razón social
    const nombreCompleto = qf.tipoPersona === "fisica"
      ? (qf.nombreCompleto ?? "").trim()
      : (qf.razonSocial ?? "").trim()

    const payload: any = {
      tipo_origen: "manual",
      creado_por_user_id: creadoPor,
      status: "en_proceso",
      inquilino: {
        tipo_persona: qf.tipoPersona,
        nombre_completo: nombreCompleto,
        correo: (qf.correo ?? "").trim(),
        // opcionales de moral (si aplica)
        ...(qf.tipoPersona === "moral"
          ? {
              razon_social: (qf.razonSocial ?? "").trim() || undefined,
              nombre_comercial: (qf.nombreComercial ?? "").trim() || undefined,
              representante_legal: (qf.representanteLegal ?? "").trim() || undefined,
            }
          : {}),
      },
      propietario: {
        tipo_persona: "fisica",
        nombre_completo: "",
        telefono: "",
        correo: "",
      },
      propiedad: {
        tipo: qf.tipoInmueble,
      },
    }

    setSaving(true)
    try {
      await api("/rentals/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      await handleManualRefresh()
      toast({ title: "Renta creada", description: "Se inició el proceso con datos mínimos." })
      setIsQuickOpen(false)
      setQf(emptyQuick)
    } catch (e: any) {
      toast({ title: "Error al crear", description: e?.message ?? "No se pudo crear la renta", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

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

      {/* Panel principal */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Rentas</CardTitle>
              <CardDescription>Administra todos los procesos de renta</CardDescription>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleManualRefresh} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Cargando..." : "Recargar"}
              </Button>

              <Dialog open={isQuickOpen} onOpenChange={setIsQuickOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proceso
                  </Button>
                </DialogTrigger>

                {/* === Modal de creación rápida (sin wizard) === */}
                <DialogContent className="sm:max-w-[820px]">
                  <DialogHeader>
                    <DialogTitle>Crear expediente</DialogTitle>
                    <DialogDescription>Datos del inquilino</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tipo de persona */}
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>Tipo de Persona:</Label>
                        <Select
                          value={qf.tipoPersona}
                          onValueChange={(v: "fisica" | "moral") =>
                            setQf((s) =>
                              v === "fisica"
                                ? {
                                    ...s,
                                    tipoPersona: v,
                                    nombreCompleto: s.nombreCompleto ?? "",
                                    // limpia campos de moral
                                    razonSocial: "",
                                    nombreComercial: "",
                                    representanteLegal: "",
                                  }
                                : {
                                    ...s,
                                    tipoPersona: v,
                                    razonSocial: s.razonSocial ?? "",
                                    nombreComercial: s.nombreComercial ?? "",
                                    representanteLegal: s.representanteLegal ?? "",
                                    // limpia campo de física
                                    nombreCompleto: "",
                                  }
                            )}
                        >
                          <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fisica">Persona física</SelectItem>
                            <SelectItem value="moral">Persona moral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tipo de inmueble */}
                      <div className="space-y-1.5">
                        <Label>Tipo de inmueble</Label>
                        <Select
                          value={qf.tipoInmueble}
                          onValueChange={(v) => setQf((s) => ({ ...s, tipoInmueble: v }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casa">Casa</SelectItem>
                            <SelectItem value="departamento">Departamento</SelectItem>
                            <SelectItem value="oficina">Oficina</SelectItem>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="bodega">Bodega</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Correo */}
                      <div className="space-y-1.5">
                        <Label>Correo <span className="text-destructive">*</span></Label>
                        <Input
                          value={qf.correo ?? ""} // siempre controlado
                          onChange={(e) => setQf((s) => ({ ...s, correo: e.target.value }))}
                          placeholder="correo@dominio.com"
                        />
                      </div>

                      {/* === Campos condicionales === */}
                      {qf.tipoPersona === "fisica" && (
                        <div className="space-y-1.5 md:col-span-2" key="fisica">
                          <Label>Nombre completo <span className="text-destructive">*</span></Label>
                          <Input
                            value={qf.nombreCompleto ?? ""} 
                            onChange={(e) => setQf((s) => ({ ...s, nombreCompleto: e.target.value }))}
                            placeholder="Ej. Ana Patricia Hernández"
                          />
                        </div>
                      )}

                      {qf.tipoPersona === "moral" && (
                        <>
                          <div className="space-y-1.5 md:col-span-2" key="moral-razon">
                            <Label>Razón social <span className="text-destructive">*</span></Label>
                            <Input
                              value={qf.razonSocial ?? ""} 
                              onChange={(e) => setQf((s) => ({ ...s, razonSocial: e.target.value }))}
                              placeholder="Ej. Inversiones XYZ, S.A. de C.V."
                            />
                          </div>

                          <div className="space-y-1.5" key="moral-comercial">
                            <Label>Nombre comercial (opcional)</Label>
                            <Input
                              value={qf.nombreComercial ?? ""} // siempre controlado
                              onChange={(e) => setQf((s) => ({ ...s, nombreComercial: e.target.value }))}
                              placeholder="Opcional"
                            />
                          </div>

                          <div className="space-y-1.5" key="moral-rep">
                            <Label>Representante legal (opcional)</Label>
                            <Input
                              value={qf.representanteLegal ?? ""} // siempre controlado
                              onChange={(e) => setQf((s) => ({ ...s, representanteLegal: e.target.value }))}
                              placeholder="Opcional"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveQuick} disabled={saving}>
                        {saving ? "Guardando…" : "Guardar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* filtros */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

          {/* tabla */}
          <div className="rounded-md border">
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
                {filteredRentals.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {r.inquilino.type === "fisica" ? r.inquilino.nombre : r.inquilino.razonSocial}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {r.inquilino.type === "fisica" ? "Persona Física" : "Persona Moral"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {r.propiedad.tipo} {r.propiedad.calle ? `- ${r.propiedad.calle} ${r.propiedad.numero ?? ""}` : ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {r.propiedad.colonia || "—"}{r.propiedad.ciudad ? `, ${r.propiedad.ciudad}` : ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${(r.propiedad.renta ?? 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{r.propiedad.metros}m²</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[r.status]}>{statusLabels[r.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openProcess(r)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`/rentas/${encodeURIComponent(r.id)}?edit=1`, "_blank")
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredRentals.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {canView ? "Sin resultados" : "No tienes permiso para ver rentas"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Fallback modal para ver proceso si el popup es bloqueado */}
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
