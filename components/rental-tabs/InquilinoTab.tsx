"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface InquilinoTabProps {
  value: any
  editable: boolean
  onChange: (next: any) => void
  onSave: () => void
}

export function InquilinoTab({ value, editable, onChange, onSave }: InquilinoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Inquilino</CardTitle>
        <CardDescription>Información personal o empresarial del inquilino</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Label>Tipo de Persona:</Label>
          <Select value={value.type} disabled>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fisica">Persona Física</SelectItem>
              <SelectItem value="moral">Persona Moral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.type === "fisica" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input
                  value={value.nombres || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, nombres: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input
                  value={value.apellidoP || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, apellidoP: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input
                  value={value.apellidoM || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, apellidoM: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nacionalidad</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="nacionalidad"
                      disabled={!editable}
                      checked={(value.nacionalidad || "mexicana") === "mexicana"}
                      onChange={() => onChange({ ...value, nacionalidad: "mexicana" })}
                    />
                    Mexicana
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="nacionalidad"
                      disabled={!editable}
                      checked={value.nacionalidad === "otra"}
                      onChange={() => onChange({ ...value, nacionalidad: "otra" })}
                    />
                    Otra
                  </label>
                </div>
              </div>
              {(value.nacionalidad === "otra") && (
                <div className="space-y-2">
                  <Label>Especifique</Label>
                  <Input
                    value={value.especifiqueN || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, especifiqueN: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sexo</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="sexo"
                      disabled={!editable}
                      checked={value.sexo === "M"}
                      onChange={() => onChange({ ...value, sexo: "M" })}
                    />
                    Masculino
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="sexo"
                      disabled={!editable}
                      checked={value.sexo === "F"}
                      onChange={() => onChange({ ...value, sexo: "F" })}
                    />
                    Femenino
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado civil</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="edoCivil"
                      disabled={!editable}
                      checked={(value.edoCivil || "soltero") === "soltero"}
                      onChange={() => onChange({ ...value, edoCivil: "soltero" })}
                    />
                    Soltero
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="edoCivil"
                      disabled={!editable}
                      checked={value.edoCivil === "casado"}
                      onChange={() => onChange({ ...value, edoCivil: "casado" })}
                    />
                    Casado
                  </label>
                </div>
              </div>
            </div>

            {value.edoCivil === "casado" && (
              <div className="space-y-4">
                <Separator />
                <div className="text-sm font-medium">Datos del cónyuge</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre(s)</Label>
                    <Input
                      value={value.nombrec || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, nombrec: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Paterno</Label>
                    <Input
                      value={value.apellidoPc || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, apellidoPc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Materno</Label>
                    <Input
                      value={value.apellidoMc || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, apellidoMc: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={value.telefonoc || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, telefonoc: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={value.email || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar e-mail</Label>
                <Input
                  value={value.emailconfirm || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, emailconfirm: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Identificación</Label>
                <Select
                  value={value.iden || ""}
                  disabled={!editable}
                  onValueChange={(v) => onChange({ ...value, iden: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INE">INE</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="Cédula">Cédula</SelectItem>
                    <SelectItem value="Licencia">Licencia</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={value.fechaNac || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, fechaNac: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RFC</Label>
                <Input
                  value={value.rfc || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, rfc: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CURP</Label>
                <Input
                  value={value.curp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, curp: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono celular</Label>
                <Input
                  value={value.celular || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, celular: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono fijo</Label>
                <Input
                  value={value.telefonoP || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, telefonoP: e.target.value })}
                />
              </div>
            </div>

            <Separator />
            <div className="text-sm font-medium">Domicilio actual</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Calle</Label>
                <Input
                  value={value.calle || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, calle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>No. exterior</Label>
                <Input
                  value={value.numExt || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, numExt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>No. interior</Label>
                <Input
                  value={value.numInt || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, numInt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código postal</Label>
                <Input
                  value={value.cp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, cp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Colonia</Label>
                <Input
                  value={value.colonia || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, colonia: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Delegación / Municipio</Label>
                <Input
                  value={value.mun || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, mun: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Estado</Label>
                <Select
                  value={value.estado || ""}
                  disabled={!editable}
                  onValueChange={(v) => onChange({ ...value, estado: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"
                    ].map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Situación habitacional</Label>
                <Select
                  value={value.situacion || ""}
                  disabled={!editable}
                  onValueChange={(v) => onChange({ ...value, situacion: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inquilino">Inquilino</SelectItem>
                    <SelectItem value="Pensión - Hotel">Pensión - Hotel</SelectItem>
                    <SelectItem value="Con padres o familiares">Con padres o familiares</SelectItem>
                    <SelectItem value="Propietario pagando">Propietario pagando</SelectItem>
                    <SelectItem value="Propietario liberado">Propietario liberado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {value.situacion === "Inquilino" && (
              <div className="space-y-4">
                <Separator />
                <div className="text-sm font-medium">Datos del arrendador actual</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre(s)</Label>
                    <Input
                      value={value.nombrea || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, nombrea: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Paterno</Label>
                    <Input
                      value={value.apellidoPa || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, apellidoPa: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Materno</Label>
                    <Input
                      value={value.apellidoMa || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, apellidoMa: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={value.telefonoa || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, telefonoa: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Renta actual</Label>
                    <Input
                      value={value.renta || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, renta: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ocupa desde (año)</Label>
                    <Input
                      value={value.anioRenta || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, anioRenta: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <Separator />
            <div className="text-sm font-medium">Datos de empleo e ingresos</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Profesión, oficio o puesto</Label>
                <Input
                  value={value.profesion || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, profesion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de empleo</Label>
                <Select
                  value={value.tipoEmp || ""}
                  disabled={!editable}
                  onValueChange={(v) => onChange({ ...value, tipoEmp: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dueño de negocio">Dueño de negocio</SelectItem>
                    <SelectItem value="Empresario">Empresario</SelectItem>
                    <SelectItem value="Independiente">Independiente</SelectItem>
                    <SelectItem value="Empleado">Empleado</SelectItem>
                    <SelectItem value="Comisionista">Comisionista</SelectItem>
                    <SelectItem value="Jubilado">Jubilado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={value.tel || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, tel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>No. de extensión</Label>
                <Input
                  value={value.ext || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, ext: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label>Fecha de ingreso</Label>
                <Input
                  type="date"
                  value={value.fechaIng || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, fechaIng: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Empresa donde trabaja</Label>
              <Input
                value={value.empresa || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, empresa: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Calle (empleo)</Label>
                <Input
                  value={value.calleEmp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, calleEmp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>No. exterior (empleo)</Label>
                <Input
                  value={value.numExtEmp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, numExtEmp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>No. interior (empleo)</Label>
                <Input
                  value={value.numIntEmp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, numIntEmp: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CP (empleo)</Label>
                <Input
                  value={value.cpEmp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, cpEmp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Colonia (empleo)</Label>
                <Input
                  value={value.coloniaEmp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, coloniaEmp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Municipio (empleo)</Label>
                <Input
                  value={value.munEmp || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, munEmp: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado (empleo)</Label>
              <Select
                value={value.estadoEmp || ""}
                disabled={!editable}
                onValueChange={(v) => onChange({ ...value, estadoEmp: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />
            <div className="text-sm font-medium">Jefe inmediato</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input
                  value={value.nombrej || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, nombrej: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input
                  value={value.apellidoPj || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, apellidoPj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input
                  value={value.apellidoMj || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, apellidoMj: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Teléfono de oficina</Label>
                <Input
                  value={value.telefonoj || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, telefonoj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Número de extensión</Label>
                <Input
                  value={value.extj || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, extj: e.target.value })}
                />
              </div>
            </div>

            <Separator />
            <div className="text-sm font-medium">Ingresos</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ingreso mensual comprobable</Label>
                <Input
                  value={value.ingresos || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, ingresos: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ingreso mensual no comprobable</Label>
                <Input
                  value={value.ingresoFam || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, ingresoFam: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de personas que dependen de usted</Label>
                <Input
                  value={value.numPerDep || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, numPerDep: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>¿Otra persona aporta al ingreso familiar?</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="otroIngreso"
                      disabled={!editable}
                      checked={(value.otroIngreso || "0") === "0"}
                      onChange={() => onChange({ ...value, otroIngreso: "0" })}
                    />
                    No
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="otroIngreso"
                      disabled={!editable}
                      checked={value.otroIngreso === "1"}
                      onChange={() => onChange({ ...value, otroIngreso: "1" })}
                    />
                    Sí
                  </label>
                </div>
              </div>
            </div>

            {value.otroIngreso === "1" && (
              <div className="space-y-4">
                <Separator />
                <div className="text-sm text-muted-foreground">Decidiste que otra persona aporta al ingreso familiar, completa la información.</div>
                <div className="space-y-2">
                  <Label>Número de personas que aportan</Label>
                  <Input
                    value={value.numPerIngre || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, numPerIngre: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre(s)</Label>
                    <Input
                      value={value.nombreaOI || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, nombreaOI: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Paterno</Label>
                    <Input
                      value={value.apellidoPaOI || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, apellidoPaOI: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Materno</Label>
                    <Input
                      value={value.apellidoMaOI || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, apellidoMaOI: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Parentesco</Label>
                    <Input
                      value={value.parentesco || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, parentesco: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={value.telefonoA || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, telefonoA: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa donde trabaja</Label>
                    <Input
                      value={value.empresaA || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, empresaA: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ingreso mensual comprobable</Label>
                    <Input
                      value={value.ingresoA || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, ingresoA: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <Separator />
            <div className="text-sm font-medium">Uso de propiedad</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de inmueble que desea rentar</Label>
                <Select
                  value={value.tipoInmueble || ""}
                  disabled={!editable}
                  onValueChange={(v) => onChange({ ...value, tipoInmueble: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="consultorio">Consultorio</SelectItem>
                    <SelectItem value="bodega">Bodega</SelectItem>
                    <SelectItem value="Nave Industrial">Nave industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>¿Cuál es el giro de su negocio?</Label>
                <Input
                  value={value.giroNegocio || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, giroNegocio: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Describa brevemente su experiencia en el giro</Label>
              <Input
                value={value.experienciaGiro || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, experienciaGiro: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Propósitos del arrendamiento</Label>
              <Input
                value={value.uso_propositoPF || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, uso_propositoPF: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>¿Este inmueble sustituirá otro domicilio?</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="uso_sustituirDomicilioPF"
                    disabled={!editable}
                    checked={(value.uso_sustituirDomicilioPF || "No") === "No"}
                    onChange={() => onChange({ ...value, uso_sustituirDomicilioPF: "No" })}
                  />
                  No
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="uso_sustituirDomicilioPF"
                    disabled={!editable}
                    checked={value.uso_sustituirDomicilioPF === "Sí" || value.uso_sustituirDomicilioPF === "Si"}
                    onChange={() => onChange({ ...value, uso_sustituirDomicilioPF: "Sí" })}
                  />
                  Sí
                </label>
              </div>
            </div>

            {((value.uso_sustituirDomicilioPF === "Sí") || (value.uso_sustituirDomicilioPF === "Si")) && (
              <div className="space-y-4">
                <Separator />
                <div className="text-sm font-medium">Información del domicilio anterior</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Calle</Label>
                    <Input
                      value={value.uso_callePF || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, uso_callePF: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número exterior</Label>
                    <Input
                      value={value.uso_numExtPf || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, uso_numExtPf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número interior</Label>
                    <Input
                      value={value.uso_numIntPF || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, uso_numIntPF: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Código postal</Label>
                    <Input
                      value={value.uso_codigoPosPF || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, uso_codigoPosPF: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonia</Label>
                    <Input
                      value={value.uso_coloniaPF || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, uso_coloniaPF: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delegación / Municipio</Label>
                    <Input
                      value={value.uso_municipioPF || ""}
                      readOnly={!editable}
                      onChange={(e) => onChange({ ...value, uso_municipioPF: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={value.uso_estadoPF || ""}
                    disabled={!editable}
                    onValueChange={(v) => onChange({ ...value, uso_estadoPF: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"].map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Motivo del cambio de domicilio</Label>
                  <Input
                    value={value.uso_motivoPF || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, uso_motivoPF: e.target.value })}
                  />
                </div>
              </div>
            )}

            <Separator />
            <div className="text-sm font-medium">Referencias</div>
            <div className="space-y-2 text-sm text-muted-foreground">Referencia personal 1</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.nombrer1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, nombrer1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.apellidoPr1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoPr1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.apellidoMr1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoMr1: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.relacionr1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, relacionr1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.telefonor1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, telefonor1: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">Referencia personal 2</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.nombrer2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, nombrer2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.apellidoPr2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoPr2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.apellidoMr2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoMr2: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.relacionr2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, relacionr2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.telefonor2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, telefonor2: e.target.value })} />
              </div>
            </div>

            <Separator />
            <div className="space-y-2 text-sm font-medium">Referencias familiares</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.nombref1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, nombref1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.apellidoPf1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoPf1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.apellidoMf1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoMf1: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.relacionf1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, relacionf1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.telefonof1 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, telefonof1: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.nombref2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, nombref2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.apellidoPf2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoPf2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.apellidoMf2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellidoMf2: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.relacionf2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, relacionf2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.telefonof2 || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, telefonof2: e.target.value })} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Razón Social</Label>
              <Input
                value={value.razonSocial || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, razonSocial: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre Comercial</Label>
              <Input
                value={value.nombreComercial || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, nombreComercial: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Representante Legal</Label>
              <Input
                value={value.representante || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, representante: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={value.telefono || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Correo</Label>
              <Input
                value={value.correo || ""}
                readOnly={!editable}
                onChange={(e) => onChange({ ...value, correo: e.target.value })}
              />
            </div>
          </div>
        )}

        {editable && (
          <div className="pt-2">
            <Button onClick={onSave}>Guardar cambios</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
