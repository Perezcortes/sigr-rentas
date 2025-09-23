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
import { User, Building2, FileText, Search, CheckCircle, Calendar, Upload, Download, Eye } from "lucide-react"
import type { Rental } from "@/types/rental"

interface RentalProcessProps {
  rental: Rental
}

export function RentalProcess({ rental }: RentalProcessProps) {
  const [activeTab, setActiveTab] = useState("inquilino")

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
      {/* Status Header */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <h3 className="font-semibold">Estado del Proceso</h3>
          <Badge className="mt-1">En Proceso</Badge>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Creado: {rental.createdAt}</div>
          <div className="text-sm text-muted-foreground">Actualizado: {rental.updatedAt}</div>
        </div>
      </div>

      {/* Process Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 text-xs">
              <tab.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Inquilino Tab */}
        <TabsContent value="inquilino" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Inquilino</CardTitle>
              <CardDescription>Información personal o empresarial del inquilino</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>Tipo de Persona:</Label>
                <Select value={rental.inquilino.type} disabled>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisica">Persona Física</SelectItem>
                    <SelectItem value="moral">Persona Moral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {rental.inquilino.type === "fisica" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input value={rental.inquilino.nombre || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={rental.inquilino.telefono || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo Electrónico</Label>
                    <Input value={rental.inquilino.correo || ""} readOnly />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razón Social</Label>
                    <Input value={rental.inquilino.razonSocial || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre Comercial</Label>
                    <Input value={rental.inquilino.nombreComercial || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Representante Legal</Label>
                    <Input value={rental.inquilino.representante || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={rental.inquilino.telefono || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo Electrónico</Label>
                    <Input value={rental.inquilino.correo || ""} readOnly />
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex space-x-2">
                <Button variant="outline">Enviar Solicitud</Button>
                <Button variant="outline">Abrir Solicitud</Button>
                <Button variant="outline">Ver Solicitud</Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Obligado Solidario Tab */}
        <TabsContent value="obligado" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Obligado Solidario</CardTitle>
              <CardDescription>Información del obligado solidario (opcional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rental.obligadoSolidario ? (
                <>
                  <div className="flex items-center space-x-4">
                    <Label>Tipo de Persona:</Label>
                    <Select value={rental.obligadoSolidario.type} disabled>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fisica">Persona Física</SelectItem>
                        <SelectItem value="moral">Persona Moral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input value={rental.obligadoSolidario.nombre || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input value={rental.obligadoSolidario.telefono || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Correo Electrónico</Label>
                      <Input value={rental.obligadoSolidario.correo || ""} readOnly />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex space-x-2">
                    <Button variant="outline">Enviar Solicitud</Button>
                    <Button variant="outline">Abrir Solicitud</Button>
                    <Button variant="outline">Ver Solicitud</Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar Solicitud
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No se ha agregado obligado solidario</p>
                  <Button>Agregar Obligado Solidario</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Propietario Tab */}
        <TabsContent value="propietario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Propietario</CardTitle>
              <CardDescription>Información del propietario del inmueble</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>Tipo de Persona:</Label>
                <Select value={rental.propietario.type} disabled>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisica">Persona Física</SelectItem>
                    <SelectItem value="moral">Persona Moral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input value={rental.propietario.nombre || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={rental.propietario.telefono || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input value={rental.propietario.correo || ""} readOnly />
                </div>
              </div>

              <Separator />

              <div className="flex space-x-2">
                <Button variant="outline">Enviar Solicitud</Button>
                <Button variant="outline">Abrir Solicitud</Button>
                <Button variant="outline">Ver Solicitud</Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Propiedad Tab */}
        <TabsContent value="propiedad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Propiedad</CardTitle>
              <CardDescription>Datos del inmueble a rentar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Propiedad</Label>
                  <Input value={rental.propiedad.tipo} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input value={rental.propiedad.cp} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={rental.propiedad.estado} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input value={rental.propiedad.ciudad} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Colonia</Label>
                  <Input value={rental.propiedad.colonia} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Calle</Label>
                  <Input value={rental.propiedad.calle} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={rental.propiedad.numero} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Interior</Label>
                  <Input value={rental.propiedad.interior || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Metros Cuadrados</Label>
                  <Input type="number" value={rental.propiedad.metros} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Renta Mensual</Label>
                  <Input type="number" value={rental.propiedad.renta} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Referencias</Label>
                <Textarea value={rental.propiedad.referencia || ""} readOnly />
              </div>

              <Separator />

              <div className="flex space-x-2">
                <Button variant="outline">Seleccionar del Portal</Button>
                <Button variant="outline">Agregar Nueva Propiedad</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos Tab */}
        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Documentos</CardTitle>
              <CardDescription>Documentos requeridos para el proceso de renta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Documentos del Inquilino */}
              <div>
                <h4 className="font-semibold mb-3">Documentos del Inquilino</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Identificación</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Comprobante de Domicilio</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Comprobantes de Ingresos</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentos del Obligado Solidario */}
              {rental.obligadoSolidario && (
                <div>
                  <h4 className="font-semibold mb-3">Documentos del Obligado Solidario</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <Label>Identificación</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Subir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 space-y-2">
                      <Label>Comprobante de Domicilio</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Subir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 space-y-2">
                      <Label>Comprobantes de Ingresos</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Subir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documentos del Propietario */}
              <div>
                <h4 className="font-semibold mb-3">Documentos del Propietario</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Identificación</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Comprobante de Domicilio</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Título de Propiedad</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investigación Tab */}
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
                  La investigación evalúa la solicitud de acuerdo a parámetros establecidos
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Search className="mr-2 h-4 w-4" />
                  Generar Investigación
                </Button>
              </div>

              {rental.investigacion && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Resultado de la Investigación</h4>
                  <div className="flex items-center space-x-4">
                    <div>
                      <Label>Índice de Riesgo</Label>
                      <div className="text-2xl font-bold text-primary">
                        {rental.investigacion.indiceRiesgo || "N/A"}
                      </div>
                    </div>
                    <div>
                      <Badge variant={rental.investigacion.completed ? "default" : "secondary"}>
                        {rental.investigacion.completed ? "Completada" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formalización Tab */}
        <TabsContent value="formalizacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formalización del Contrato</CardTitle>
              <CardDescription>Proceso de formalización y enlace con póliza</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Inicio de Renta</Label>
                  <Input type="date" value={rental.formalizacion?.fechaInicio || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin de Renta</Label>
                  <Input type="date" value={rental.formalizacion?.fechaFin || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Prevista de Firma</Label>
                  <Input type="date" value={rental.formalizacion?.fechaFirma || ""} readOnly />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Enlazar Póliza de Rentas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Oficina</Label>
                    <Select disabled>
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
                    <Select disabled>
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
                    <Select disabled>
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
                <Button className="bg-primary hover:bg-primary/90">Enviar a Póliza de Rentas</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activación Tab */}
        <TabsContent value="activacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activación de la Renta</CardTitle>
              <CardDescription>Confirmación de datos y activación del proceso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos de la Renta */}
              <div>
                <h4 className="font-semibold mb-3">Datos de la Renta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Inicio</Label>
                    <Input type="date" value={rental.activacion?.fechaInicio || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Plazo del Contrato (meses)</Label>
                    <Input type="number" value={rental.activacion?.plazoMeses || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Fin</Label>
                    <Input type="date" value={rental.activacion?.fechaFin || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto de la Renta</Label>
                    <Input type="number" value={rental.activacion?.montoRenta || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto de la Comisión</Label>
                    <Input type="number" value={rental.activacion?.montoComision || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Comisión</Label>
                    <Select value={rental.activacion?.tipoComision || ""} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completa">Comisión Completa</SelectItem>
                        <SelectItem value="compartida">Comisión Compartida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Neto de Comisión</Label>
                    <Input type="number" value={rental.activacion?.montoNetoComision || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Cobro</Label>
                    <Select value={rental.activacion?.formaCobroComision || ""} disabled>
                      <SelectTrigger>
                        <SelectValue />
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

              {/* Datos del Propietario */}
              <div>
                <h4 className="font-semibold mb-3">Confirmación - Propietario</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input value={rental.propietario.nombre || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={rental.propietario.telefono || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo</Label>
                    <Input value={rental.propietario.correo || ""} readOnly />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Datos del Inquilino */}
              <div>
                <h4 className="font-semibold mb-3">Confirmación - Inquilino</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input value={rental.inquilino.nombre || rental.inquilino.razonSocial || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={rental.inquilino.telefono || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo</Label>
                    <Input value={rental.inquilino.correo || ""} readOnly />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex space-x-4">
                <Button className="bg-primary hover:bg-primary/90" size="lg">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activar Renta
                </Button>
                {rental.activacion?.activated && (
                  <Button variant="outline" size="lg">
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
