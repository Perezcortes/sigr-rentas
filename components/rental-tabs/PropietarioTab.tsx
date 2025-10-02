"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface PropietarioTabProps {
  value: any
  editable: boolean
  onChange: (next: any) => void
  onSave: () => void
}

export default function PropietarioTab({ value, editable, onChange, onSave }: PropietarioTabProps) {
  const baseInput = "rounded-md h-9 md:h-10 placeholder:text-gray-400 bg-white/90 border border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:border-blue-400"
  const baseSelectTrigger = "rounded-md h-9 md:h-10 bg-white/90 border border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:border-blue-400"

  const next = (patch: any) => onChange({ ...(value || {}), ...patch })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Propietario</CardTitle>
        <CardDescription>Información personal y del inmueble</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información personal del propietario */}
        <div className="text-sm font-medium">Información personal</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Nombre(s)</Label>
            <Input className={baseInput} value={value.dnombres || ""} readOnly={!editable} onChange={(e) => next({ dnombres: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Apellido Paterno</Label>
            <Input className={baseInput} value={value.dapellidoP || ""} readOnly={!editable} onChange={(e) => next({ dapellidoP: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Apellido Materno</Label>
            <Input className={baseInput} value={value.dapellidoM || ""} readOnly={!editable} onChange={(e) => next({ dapellidoM: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-1">
            <Label>CURP</Label>
            <Input className={baseInput} value={value.curp || ""} readOnly={!editable} onChange={(e) => next({ curp: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <Input className={baseInput} value={value.demail || ""} readOnly={!editable} onChange={(e) => next({ demail: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input className={baseInput} value={value.dtelefono || ""} readOnly={!editable} onChange={(e) => next({ dtelefono: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Estado civil</Label>
            <Select value={value?.edoCivil || ""} disabled={!editable} onValueChange={(v) => next({ edoCivil: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Casado">Casado</SelectItem>
                <SelectItem value="Divorciado">Divorciado</SelectItem>
                <SelectItem value="Soltero">Soltero</SelectItem>
                <SelectItem value="Unión libre">Unión libre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Régimen (si es casado)</Label>
            <Select value={value?.regimen || ""} disabled={!editable || value?.edoCivil !== "Casado"} onValueChange={(v) => next({ regimen: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sociedad conyugal">Sociedad conyugal</SelectItem>
                <SelectItem value="Separación de bienes">Separación de bienes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sexo</Label>
            <Select value={value?.sexoPropPF || ""} disabled={!editable} onValueChange={(v) => next({ sexoPropPF: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Nacionalidad</Label>
            <Select value={value?.nacionalidad || "Mexicana"} disabled={!editable} onValueChange={(v) => next({ nacionalidad: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mexicana">Mexicana</SelectItem>
                <SelectItem value="Extranjera">Extranjera</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Identificación</Label>
            <Select value={value?.dident || ""} disabled={!editable} onValueChange={(v) => next({ dident: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INE">INE</SelectItem>
                <SelectItem value="PASSPORT">Pasaporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>RFC</Label>
            <Input className={baseInput} value={value.drfc || ""} readOnly={!editable} onChange={(e) => next({ drfc: e.target.value })} />
          </div>
        </div>

        <Separator />
        <div className="text-sm font-medium">Domicilio del propietario</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Calle</Label>
            <Input className={baseInput} value={value.dcalle || ""} readOnly={!editable} onChange={(e) => next({ dcalle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>No. exterior</Label>
            <Input className={baseInput} value={value.dnumExt || ""} readOnly={!editable} onChange={(e) => next({ dnumExt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>No. interior</Label>
            <Input className={baseInput} value={value.dnumInt || ""} readOnly={!editable} onChange={(e) => next({ dnumInt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>CP</Label>
            <Input className={baseInput} value={value.dcp || ""} readOnly={!editable} onChange={(e) => next({ dcp: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Colonia</Label>
            <Input className={baseInput} value={value.dcolonia || ""} readOnly={!editable} onChange={(e) => next({ dcolonia: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Delegación / Municipio</Label>
            <Input className={baseInput} value={value.dciudad || ""} readOnly={!editable} onChange={(e) => next({ dciudad: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Estado</Label>
            <Select value={value?.destado || ""} disabled={!editable} onValueChange={(v) => next({ destado: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"].map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />
        <div className="text-sm font-medium">Forma de pago de renta</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Forma de pago</Label>
            <Select value={value?.formaPago || ""} disabled={!editable} onValueChange={(v) => next({ formaPago: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Otro método</Label>
            <Input className={baseInput} value={value.otroMetodo || ""} readOnly={!editable || value.formaPago !== "Otro"} onChange={(e) => next({ otroMetodo: e.target.value })} />
          </div>
        </div>

        {value?.formaPago === "Transferencia" && (
          <div className="space-y-4">
            <Separator />
            <div className="text-sm font-medium">Datos bancarios</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Titular de la cuenta</Label>
                <Input className={baseInput} value={value.titular || ""} readOnly={!editable} onChange={(e) => next({ titular: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Número de cuenta</Label>
                <Input className={baseInput} value={value.noCuenta || ""} readOnly={!editable} onChange={(e) => next({ noCuenta: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Banco</Label>
                <Input className={baseInput} value={value.banco || ""} readOnly={!editable} onChange={(e) => next({ banco: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CLABE</Label>
                <Input className={baseInput} value={value.clabe || ""} readOnly={!editable} onChange={(e) => next({ clabe: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        <Separator />
        <div className="text-sm font-medium">Datos del inmueble a arrendar</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Tipo de inmueble</Label>
            <Select value={value?.tipoInmueble || ""} disabled={!editable} onValueChange={(v) => next({ tipoInmueble: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {["Casa","Departamento","Local comercial","Oficina","Bodega","Nave industrial","Consultorio","Terreno"].map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Uso de suelo</Label>
            <Select value={value?.usoSuelo || ""} disabled={!editable} onValueChange={(v) => next({ usoSuelo: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Habitacional">Habitacional</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mascotas</Label>
            <Select value={value?.mascotas || ""} disabled={!editable} onValueChange={(v) => next({ mascotas: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sí">Sí</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Especifique</Label>
            <Input className={baseInput} value={value?.tipo || ""} readOnly={!editable || value?.mascotas !== "Sí"} onChange={(e) => next({ tipo: e.target.value })} placeholder="Perro menor de 30kg..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Precio de renta</Label>
            <Input className={baseInput} value={value.renta || ""} readOnly={!editable} onChange={(e) => next({ renta: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>IVA</Label>
            <Select value={value?.iva || ""} disabled={!editable} onValueChange={(v) => next({ iva: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IVA incluido">IVA incluido</SelectItem>
                <SelectItem value="Más IVA">Más IVA</SelectItem>
                <SelectItem value="SIN IVA">SIN IVA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Frecuencia de pago</Label>
            <Select value={value?.frecPago || ""} disabled={!editable} onValueChange={(v) => next({ frecPago: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {["Mensual","Semanal","Quincenal","Semestral","Anual","Otra"].map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Otra frecuencia</Label>
            <Input className={baseInput} value={value?.frecPagoOtra || ""} readOnly={!editable || value?.frecPago !== "Otra"} onChange={(e) => next({ frecPagoOtra: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Condiciones de pago</Label>
            <Input className={baseInput} value={value.condicionPago || ""} readOnly={!editable} onChange={(e) => next({ condicionPago: e.target.value })} placeholder="Los primeros 5 días del mes..." />
          </div>
          <div className="space-y-2">
            <Label>Depósito en garantía</Label>
            <Input className={baseInput} value={value.depositoGarantia || ""} readOnly={!editable} onChange={(e) => next({ depositoGarantia: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>¿Se paga mantenimiento?</Label>
            <Select value={value?.tieneMantenimiento || ""} disabled={!editable} onValueChange={(v) => next({ tieneMantenimiento: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sí">Sí</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {value?.tieneMantenimiento === "Sí" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>¿Quién paga?</Label>
                <Select value={value?.usuarioPagaMant || ""} disabled={!editable} onValueChange={(v) => next({ usuarioPagaMant: v })}>
                  <SelectTrigger className={baseSelectTrigger}>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arrendatario">Arrendatario</SelectItem>
                    <SelectItem value="Arrendador">Arrendador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>¿Incluido en la renta?</Label>
                <Select value={value?.cuotaIncluida || ""} disabled={!editable} onValueChange={(v) => next({ cuotaIncluida: v })}>
                  <SelectTrigger className={baseSelectTrigger}>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sí">Sí</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Costo mensual</Label>
            <Input className={baseInput} value={value?.precioMantenimiento || ""} readOnly={!editable} onChange={(e) => next({ precioMantenimiento: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2 md:w-1/2">
              <Label>Instrucciones de pago</Label>
              <Input className={baseInput} value={value?.instruccionesPago || ""} readOnly={!editable} onChange={(e) => next({ instruccionesPago: e.target.value })} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>¿Se requiere seguro?</Label>
            <Select value={value?.tieneSeguro || ""} disabled={!editable} onValueChange={(v) => next({ tieneSeguro: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sí">Sí</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {value?.tieneSeguro === "Sí" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Cobertura</Label>
              <Input className={baseInput} value={value?.cobertura || ""} readOnly={!editable} onChange={(e) => next({ cobertura: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Monto que cubre</Label>
              <Input className={baseInput} value={value?.precioSeguro || ""} readOnly={!editable} onChange={(e) => next({ precioSeguro: e.target.value })} />
            </div>
          </div>
        )}

        <Separator />
        <div className="text-sm font-medium">Dirección del inmueble a arrendar</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Calle</Label>
            <Input className={baseInput} value={value?.calle || ""} readOnly={!editable} onChange={(e) => next({ calle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>No. exterior</Label>
            <Input className={baseInput} value={value?.numExt || ""} readOnly={!editable} onChange={(e) => next({ numExt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>No. interior</Label>
            <Input className={baseInput} value={value?.numInt || ""} readOnly={!editable} onChange={(e) => next({ numInt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Código postal</Label>
            <Input className={baseInput} value={value?.cp || ""} readOnly={!editable} onChange={(e) => next({ cp: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Colonia</Label>
            <Input className={baseInput} value={value?.colonia || ""} readOnly={!editable} onChange={(e) => next({ colonia: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Delegación / Municipio</Label>
            <Input className={baseInput} value={value?.ciudad || ""} readOnly={!editable} onChange={(e) => next({ ciudad: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={value?.Estado || ""} disabled={!editable} onValueChange={(v) => next({ Estado: v })}>
              <SelectTrigger className={baseSelectTrigger}>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"].map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Referencias de ubicación</Label>
            <Input className={baseInput} value={value?.referenciasUbicacion || ""} readOnly={!editable} onChange={(e) => next({ referenciasUbicacion: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Inventario del inmueble</Label>
            <Input className={baseInput} value={value?.inventario || ""} readOnly={!editable} onChange={(e) => next({ inventario: e.target.value })} />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          {editable && <Button onClick={onSave}>Guardar cambios</Button>}
          <Button
            variant="outline"
            onClick={() => {
              const id = (value && (value.id || value.rentaId)) || 0
              window.open(`/rentas/${id}/propietario-form`, "_blank")
            }}
          >
            Abrir formulario completo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Also export named for compatibility with existing imports
export { PropietarioTab }
