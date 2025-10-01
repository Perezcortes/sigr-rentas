"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User, Building2, FileText, Search, CheckCircle, Calendar,
  Upload, Download, Eye
} from "lucide-react"
import type { Rental } from "@/types/rental"
import { api } from "@/lib/auth"
import { InquilinoTab } from "@/components/rental-tabs/InquilinoTab"
import { ObligadoTab } from "@/components/rental-tabs/ObligadoTab"
import { PropietarioTab } from "@/components/rental-tabs/PropietarioTab"
import { PropiedadTab } from "@/components/rental-tabs/PropiedadTab"

interface RentalProcessProps {
  rental: Rental
  /** habilita edición y botones Guardar */
  editable?: boolean
}

export function RentalProcess({ rental, editable = false }: RentalProcessProps) {
  const [activeTab, setActiveTab] = useState("inquilino")

  // ===== Estados locales a partir del snapshot recibido =====
  const [inquilino, setInquilino] = useState({ ...rental.inquilino })
  const [propietario, setPropietario] = useState({ ...rental.propietario })
  const [obligado, setObligado] = useState(rental.obligadoSolidario ? { ...rental.obligadoSolidario } as any : null)
  const [propiedad, setPropiedad] = useState({
    ...rental.propiedad,
    referencia: (rental as any)?.propiedad?.referencia ?? "",
  } as any)
  const [formalizacion, setFormalizacion] = useState<any>((rental as any).formalizacion ?? {})
  const [activacion, setActivacion] = useState<any>((rental as any).activacion ?? {})
  const [documentos, setDocumentos] = useState<any[]>(Array.isArray((rental as any).documentos) ? (rental as any).documentos : [])

  // ===== Helpers UI -> payload backend (snake_case) =====
  function mapInquilinoToBackend(data: any) {
    const isMoral = data?.type === "moral"
    return {
      inquilino: {
        tipo_persona: isMoral ? "moral" : "fisica",
        nombre_completo: isMoral ? undefined : (data?.nombre ?? ""),
        razon_social: isMoral ? (data?.razonSocial ?? "") : undefined,
        nombre_comercial: isMoral ? (data?.nombreComercial ?? "") : undefined,
        representante_legal: isMoral ? (data?.representante ?? "") : undefined,
        telefono: data?.telefono ?? "",
        correo: data?.correo ?? "",
      }
    }
  }

  function mapPropietarioToBackend(data: any) {
    const isMoral = data?.type === "moral"
    return {
      propietario: {
        tipo_persona: isMoral ? "moral" : "fisica",
        nombre_completo: isMoral ? undefined : (data?.nombre ?? ""),
        razon_social: isMoral ? (data?.razonSocial ?? "") : undefined,
        nombre_comercial: isMoral ? (data?.nombreComercial ?? "") : undefined,
        representante_legal: isMoral ? (data?.representante ?? "") : undefined,
        telefono: data?.telefono ?? "",
        correo: data?.correo ?? "",
      }
    }
  }

  function mapObligadoToBackend(data: any) {
    if (!data) return { obligado_solidario: null }
    const isMoral = data?.type === "moral"
    return {
      obligado_solidario: {
        tipo_persona: isMoral ? "moral" : "fisica",
        nombre_completo: isMoral ? undefined : (data?.nombre ?? ""),
        razon_social: isMoral ? (data?.razonSocial ?? "") : undefined,
        nombre_comercial: isMoral ? (data?.nombreComercial ?? "") : undefined,
        representante_legal: isMoral ? (data?.representante ?? "") : undefined,
        telefono: data?.telefono ?? "",
        correo: data?.correo ?? "",
      }
    }
  }

  function asNumberOrRaw(v: any) {
    const n = Number(v)
    return Number.isFinite(n) ? n : v
  }

  function mapPropiedadToBackend(data: any) {
    // UI: { tipo, cp, estado, ciudad, colonia, calle, numero, interior, metros, renta, referencia }
    return {
      propiedad: {
        tipo: data?.tipo ?? "",
        codigo_postal: data?.cp ?? "",
        estado_id: asNumberOrRaw(data?.estado),
        ciudad_id: asNumberOrRaw(data?.ciudad),
        colonia: data?.colonia ?? "",
        calle: data?.calle ?? "",
        numero: data?.numero ?? "",
        interior: data?.interior ?? "",
        referencia: data?.referencia ?? "",
        metros_cuadrados: data?.metros != null ? String(data?.metros) : undefined,
        monto_renta: data?.renta != null ? String(data?.renta) : undefined,
      }
    }
  }

  function toBackendPayload(section: string, data: any) {
    switch (section) {
      case "inquilino": return mapInquilinoToBackend(data)
      case "propietario": return mapPropietarioToBackend(data)
      case "obligadoSolidario": return mapObligadoToBackend(data)
      case "propiedad": return mapPropiedadToBackend(data)
      case "documentos": return { documentos: Array.isArray(data) ? data : [] }
      case "investigacion": return { investigacion: data }
      case "formalizacion": return { formalizacion: data }
      case "activacion": return { activacion: data }
      default: return { [section]: data }
    }
  }

  // ===== Guardado por sección usando PATCH /rentals/:id =====
  async function saveSection(section: string, uiData: any) {
    const id = rental.id
    const payload = toBackendPayload(section, uiData)

    try {
      const res = await api(`/rentals/${encodeURIComponent(String(id))}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      })

      alert("Cambios guardados")
      return res
    } catch (e: any) {
      console.error("PATCH /rentals/:id error →", e)
      alert("Error al guardar (PATCH): " + (e?.message ?? ""))
      throw e
    }
  }

  const tabs = [
    { id: "inquilino", label: "Inquilino", icon: User },
    { id: "obligado", label: "Obligado Solidario", icon: User },
    { id: "propietario", label: "Propietario", icon: User },
    { id: "propiedad", label: "Propiedad", icon: Building2 },
    { id: "documentos", label: "Documentos", icon: FileText },
    { id: "investigacion", label: "Investigación", icon: Search },
    { id: "formalizacion", label: "Formalización", icon: CheckCircle },
    { id: "activacion", label: "Activación", icon: Calendar },
  ]

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Estado */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <h3 className="font-semibold">Estado del Proceso</h3>
          <Badge className="mt-1">{rental.status ?? "en_proceso"}</Badge>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Creado: {rental.createdAt}</div>
          <div className="text-sm text-muted-foreground">Actualizado: {rental.updatedAt}</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 text-xs">
              <tab.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* INQUILINO */}
        <TabsContent value="inquilino" className="space-y-4">
          <InquilinoTab
            value={inquilino}
            editable={editable}
            onChange={setInquilino}
            onSave={() => saveSection("inquilino", inquilino)}
          />
        </TabsContent>

        {/* OBLIGADO */}
        <TabsContent value="obligado" className="space-y-4">
          <ObligadoTab
            value={obligado}
            editable={editable}
            onChange={setObligado}
            onSave={() => saveSection("obligadoSolidario", obligado)}
            onRemove={() => setObligado(null)}
          />
        </TabsContent>

        {/* PROPIETARIO */}
        <TabsContent value="propietario" className="space-y-4">
          <PropietarioTab
            value={propietario}
            editable={editable}
            onChange={setPropietario}
            onSave={() => saveSection("propietario", propietario)}
          />
        </TabsContent>

        {/* PROPIEDAD */}
        <TabsContent value="propiedad" className="space-y-4">
          <PropiedadTab
            value={propiedad}
            editable={editable}
            onChange={setPropiedad}
            onSave={() => saveSection("propiedad", propiedad)}
          />
        </TabsContent>

        {/* DOCUMENTOS */}
        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Documentos</CardTitle>
              <CardDescription>Documentos requeridos para el proceso de renta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Identificación", "Comprobante de domicilio", "Comprobantes de ingresos"].map((label, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <Label>{label}</Label>
                    <div className="flex gap-2">
                      {editable && (
                        <Button variant="outline" size="sm" onClick={() => alert("TODO: subir archivo")}>
                          <Upload className="mr-2 h-4 w-4" />
                          Subir
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => alert("TODO: ver archivo")}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert("TODO: descargar archivo")}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {editable && (
                <div>
                  <Button variant="default" onClick={() => saveSection("documentos", documentos)}>
                    Guardar cambios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVESTIGACIÓN */}
        <TabsContent value="investigacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investigación y Evaluación</CardTitle>
              <CardDescription>Evaluación de la solicitud y análisis de riesgo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  La investigación evalúa la solicitud de acuerdo a parámetros establecidos.
                </p>
                {editable && (
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => alert("TODO: generar investigación")}>
                    <Search className="mr-2 h-4 w-4" />
                    Generar Investigación
                  </Button>
                )}
              </div>

              {(rental as any).investigacion && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Resultado de la Investigación</h4>
                  <div className="flex items-center gap-6">
                    <div>
                      <Label>Índice de Riesgo</Label>
                      <div className="text-2xl font-bold text-primary">
                        {(rental as any).investigacion?.indiceRiesgo ?? "N/A"}
                      </div>
                    </div>
                    <div>
                      <Badge variant={(rental as any).investigacion?.completed ? "default" : "secondary"}>
                        {(rental as any).investigacion?.completed ? "Completada" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {editable && (
                <div className="pt-2">
                  <Button onClick={() => saveSection("investigacion", { ...(rental as any).investigacion, updatedAt: new Date().toISOString() })}>
                    Guardar cambios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORMALIZACIÓN */}
        <TabsContent value="formalizacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formalización del Contrato</CardTitle>
              <CardDescription>Proceso de formalización y enlace con póliza</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Inicio</Label>
                  <Input
                    type="date"
                    value={formalizacion.fechaInicio || ""}
                    readOnly={!editable}
                    onChange={(e) => setFormalizacion({ ...formalizacion, fechaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <Input
                    type="date"
                    value={formalizacion.fechaFin || ""}
                    readOnly={!editable}
                    onChange={(e) => setFormalizacion({ ...formalizacion, fechaFin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Firma</Label>
                  <Input
                    type="date"
                    value={formalizacion.fechaFirma || ""}
                    readOnly={!editable}
                    onChange={(e) => setFormalizacion({ ...formalizacion, fechaFirma: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Enlazar Póliza de Rentas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Oficina</Label>
                    <Select disabled={!editable} value={formalizacion.oficina ?? ""} onValueChange={(v) => setFormalizacion({ ...formalizacion, oficina: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar oficina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="central">Oficina Central</SelectItem>
                        <SelectItem value="norte">Sucursal Norte</SelectItem>
                        <SelectItem value="sur">Sucursal Sur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Abogado</Label>
                    <Select disabled={!editable} value={formalizacion.abogado ?? ""} onValueChange={(v) => setFormalizacion({ ...formalizacion, abogado: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar abogado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abogado1">Lic. Juan Pérez</SelectItem>
                        <SelectItem value="abogado2">Lic. María González</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Producto</Label>
                    <Select disabled={!editable} value={formalizacion.producto ?? ""} onValueChange={(v) => setFormalizacion({ ...formalizacion, producto: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basico">Póliza Básica</SelectItem>
                        <SelectItem value="premium">Póliza Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editable && (
                  <div className="flex gap-2">
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => alert("TODO: enviar a póliza de rentas")}>
                      Enviar a Póliza de Rentas
                    </Button>
                    <Button variant="outline" onClick={() => saveSection("formalizacion", formalizacion)}>Guardar cambios</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTIVACIÓN */}
        <TabsContent value="activacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activación de la Renta</CardTitle>
              <CardDescription>Confirmación de datos y activación del proceso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Datos de la Renta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Inicio</Label>
                    <Input
                      type="date"
                      value={activacion.fechaInicio || ""}
                      readOnly={!editable}
                      onChange={(e) => setActivacion({ ...activacion, fechaInicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plazo (meses)</Label>
                    <Input
                      type="number"
                      value={activacion.plazoMeses ?? ""}
                      readOnly={!editable}
                      onChange={(e) => setActivacion({ ...activacion, plazoMeses: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Fin</Label>
                    <Input
                      type="date"
                      value={activacion.fechaFin || ""}
                      readOnly={!editable}
                      onChange={(e) => setActivacion({ ...activacion, fechaFin: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Renta</Label>
                    <Input
                      type="number"
                      value={activacion.montoRenta ?? ""}
                      readOnly={!editable}
                      onChange={(e) => setActivacion({ ...activacion, montoRenta: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Comisión</Label>
                    <Input
                      type="number"
                      value={activacion.montoComision ?? ""}
                      readOnly={!editable}
                      onChange={(e) => setActivacion({ ...activacion, montoComision: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Comisión</Label>
                    <Select
                      disabled={!editable}
                      value={activacion.tipoComision ?? ""}
                      onValueChange={(v) => setActivacion({ ...activacion, tipoComision: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completa">Comisión Completa</SelectItem>
                        <SelectItem value="compartida">Comisión Compartida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Neto Comisión</Label>
                    <Input
                      type="number"
                      value={activacion.montoNetoComision ?? ""}
                      readOnly={!editable}
                      onChange={(e) => setActivacion({ ...activacion, montoNetoComision: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Cobro</Label>
                    <Select
                      disabled={!editable}
                      value={activacion.formaCobroComision ?? ""}
                      onValueChange={(v) => setActivacion({ ...activacion, formaCobroComision: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                {editable && (
                  <>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => alert("TODO: activar renta en backend")}>
                      Activar Renta
                    </Button>
                    <Button variant="outline" onClick={() => saveSection("activacion", activacion)}>
                      Guardar cambios
                    </Button>
                  </>
                )}
                {(activacion as any)?.activated && (
                  <Button variant="secondary">
                    <Building2 className="mr-2 h-4 w-4" />
                    Generar Administración
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
