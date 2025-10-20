// src/modules/rentas/components/process-forms/InquilinoFullForm.tsx

"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface InquilinoFullFormProps {
  value: any
  editable: boolean
  onChange: (next: any) => void
  onSave: () => void
  errors?: Record<string, string | undefined>
}

const ESTADOS = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
]

export function InquilinoFullForm({ value, editable, onChange, onSave, errors = {} }: InquilinoFullFormProps) {
  const baseInput = "rounded-md h-9 md:h-10 placeholder:text-gray-400 bg-white/90 border border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:border-blue-400"
  const baseSelectTrigger = "rounded-md h-9 md:h-10 bg-white/90 border border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:border-blue-400"
  
  const isFisica = value.tipo_persona === "PF";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario Completo del Inquilino</CardTitle>
        <CardDescription>Todas las secciones desplegadas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Label>Tipo de Persona:</Label>
          <Select value={value.tipo_persona} disabled>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PF">Persona Física</SelectItem>
              <SelectItem value="PM">Persona Moral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isFisica ? (
          <div className="space-y-6">
            <h3 className="text-sm font-medium mb-4">Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input className={baseInput}
                  value={value.nombres || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, nombres: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input className={baseInput}
                  value={value.apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input className={baseInput} value={value.apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apellido_m: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nacionalidad</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="nacionalidad" disabled={!editable} checked={value.nacionalidad === "Mexicana"} onChange={() => onChange({ ...value, nacionalidad: "Mexicana" })} />
                    Mexicana
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="nacionalidad" disabled={!editable} checked={value.nacionalidad === "Otra"} onChange={() => onChange({ ...value, nacionalidad: "Otra" })} />
                    Otra
                  </label>
                </div>
              </div>
              {value.nacionalidad === "Otra" && (
                <div className="space-y-2">
                  <Label>Especifique</Label>
                  <Input className={baseInput} value={value.especifiqueN || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, especifiqueN: e.target.value })} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sexo</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="sexo" disabled={!editable} checked={value.sexo === "Masculino"} onChange={() => onChange({ ...value, sexo: "Masculino" })} />
                    Masculino
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="sexo" disabled={!editable} checked={value.sexo === "Femenino"} onChange={() => onChange({ ...value, sexo: "Femenino" })} />
                    Femenino
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado civil</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="edo_civil" disabled={!editable} checked={value.edo_civil === "Soltero"} onChange={() => onChange({ ...value, edo_civil: "Soltero" })} />
                    Soltero
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="edo_civil" disabled={!editable} checked={value.edo_civil === "Casado"} onChange={() => onChange({ ...value, edo_civil: "Casado" })} />
                    Casado
                  </label>
                </div>
              </div>
            </div>

            {value.edo_civil === "Casado" && (
              <div className="space-y-4">
                <Separator />
                <div className="text-sm font-medium">Datos del cónyuge</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre(s)</Label>
                    <Input value={value.datos_conyuge || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, datos_conyuge: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input className={baseInput} value={value.email || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Confirmar e-mail</Label>
                <Input value={value.email || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, email: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Identificación</Label>
                <Select value={value.id_tipo || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, id_tipo: v })}>
                  <SelectTrigger className={baseSelectTrigger}>
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
                <Input className={baseInput} type="date" value={value.fecha_nac || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, fecha_nac: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RFC</Label>
                <Input className={baseInput} value={value.rfc || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, rfc: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CURP</Label>
                <Input className={baseInput} value={value.curp || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, curp: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono celular</Label>
                <Input className={baseInput} value={value.tel_cel || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, tel_cel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono fijo</Label>
                <Input value={value.tel_fijo || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, tel_fijo: e.target.value })} />
              </div>
            </div>

            <Separator />
            <div className="text-sm font-medium">Domicilio actual</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Calle</Label>
                <Input className={baseInput} value={value.dom_calle || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dom_calle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>No. exterior</Label>
                <Input className={baseInput} value={value.dom_num_ext || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dom_num_ext: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>No. interior</Label>
                <Input value={value.dom_num_int || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dom_num_int: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Código postal</Label>
                <Input className={baseInput} value={value.dom_cp || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dom_cp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Colonia</Label>
                <Input className={baseInput} value={value.dom_colonia || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dom_colonia: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Delegación / Municipio</Label>
                <Input className={baseInput} value={value.dom_municipio || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dom_municipio: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Estado</Label>
                <Select value={value.dom_estado || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, dom_estado: v })}>
                  <SelectTrigger className={baseSelectTrigger}>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            <div className="text-sm font-medium">Datos del arrendador actual</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input className={baseInput} value={value.arr_act_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, arr_act_nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input className={baseInput} value={value.arr_act_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, arr_act_apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input className={baseInput} value={value.arr_act_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, arr_act_apellido_m: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input className={baseInput} value={value.arr_act_tel || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, arr_act_tel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Renta que paga actualmente</Label>
                <Input className={baseInput} value={value.arr_act_renta || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, arr_act_renta: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ocupa el lugar desde (año)</Label>
                <Input className={baseInput} type="number" value={value.arr_act_ano || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, arr_act_ano: e.target.value })} />
              </div>
            </div>
            
            <Separator />
            <div className="text-sm font-medium">Datos de empleo e ingresos</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Profesión, oficio o puesto</Label>
                <Input value={value.profesion || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, profesion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de empleo</Label>
                <Select value={value.tipo_empleo || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, tipo_empleo: v })}>
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
                <Input value={value.tel_empleo || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, tel_empleo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>No. de extensión</Label>
                <Input value={value.ext_empleo || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ext_empleo: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label>Fecha de ingreso</Label>
                <Input type="date" value={value.fecha_ing_empleo || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, fecha_ing_empleo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Empresa donde trabaja</Label>
              <Input value={value.nom_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, nom_empresa: e.target.value })} />
            </div>

            {/* Domicilio empleo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Calle (empleo)</Label>
                <Input value={value.calle_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, calle_empresa: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>No. exterior (empleo)</Label>
                <Input value={value.num_ext_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, num_ext_empresa: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>No. interior (empleo)</Label>
                <Input value={value.num_int_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, num_int_empresa: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CP (empleo)</Label>
                <Input value={value.cp_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, cp_empresa: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Colonia (empleo)</Label>
                <Input value={value.col_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, col_empresa: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Municipio (empleo)</Label>
                <Input value={value.mun_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, mun_empresa: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado (empleo)</Label>
              <Select value={value.edo_empresa || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, edo_empresa: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jefe inmediato */}
            <Separator />
            <div className="text-sm font-medium">Jefe inmediato</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.jefe_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, jefe_nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.jefe_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, jefe_apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.jefe_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, jefe_apellido_m: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Teléfono de oficina</Label>
                <Input value={value.tel_oficina || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, tel_oficina: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Número de extensión</Label>
                <Input value={value.ext_oficina || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ext_oficina: e.target.value })} />
              </div>
            </div>

            {/* Ingresos */}
            <Separator />
            <div className="text-sm font-medium">Ingresos</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ingreso mensual comprobable</Label>
                <Input value={value.ing_comprobable || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ing_comprobable: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ingreso mensual no comprobable</Label>
                <Input value={value.ing_no_comprobable || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ing_no_comprobable: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de personas que dependen de usted</Label>
                <Input value={value.dependientes || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dependientes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>¿Otra persona aporta al ingreso familiar?</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="ing_fam_aporta" disabled={!editable} checked={value.ing_fam_aporta === false} onChange={() => onChange({ ...value, ing_fam_aporta: false })} />
                    No
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="ing_fam_aporta" disabled={!editable} checked={value.ing_fam_aporta === true} onChange={() => onChange({ ...value, ing_fam_aporta: true })} />
                    Sí
                  </label>
                </div>
              </div>
            </div>

            {value.ing_fam_aporta === true && (
              <div className="space-y-4">
                <Separator />
                <div className="text-sm text-muted-foreground">Otra persona aporta al ingreso familiar</div>
                <div className="space-y-2">
                  <Label>Número de personas que aportan</Label>
                  <Input value={value.num_aportan || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, num_aportan: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre(s)</Label>
                    <Input value={value.aportante_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, aportante_nombre: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Paterno</Label>
                    <Input value={value.aportante_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, aportante_apellido_p: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido Materno</Label>
                    <Input value={value.aportante_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, aportante_apellido_m: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Parentesco</Label>
                    <Input value={value.aportante_parentesco || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, aportante_parentesco: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={value.aportante_telefono || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, aportante_telefono: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa donde trabaja</Label>
                    <Input value={value.aportante_empresa || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, aportante_empresa: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ingreso mensual comprobable</Label>
                    <Input value={value.aportante_ingreso || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, aportante_ingreso: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Referencias */}
            <Separator />
            <div className="text-sm font-medium">Referencias personales</div>
            <div className="space-y-2 text-sm text-muted-foreground">Referencia personal 1</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.ref_per1_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per1_nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.ref_per1_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per1_apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.ref_per1_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per1_apellido_m: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.ref_per1_relacion || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per1_relacion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.ref_per1_telefono || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per1_telefono: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">Referencia personal 2</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.ref_per2_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per2_nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.ref_per2_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per2_apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.ref_per2_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per2_apellido_m: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.ref_per2_relacion || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per2_relacion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.ref_per2_telefono || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_per2_telefono: e.target.value })} />
              </div>
            </div>

            <Separator />
            <div className="space-y-2 text-sm font-medium">Referencias familiares</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.ref_fam1_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam1_nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.ref_fam1_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam1_apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.ref_fam1_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam1_apellido_m: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.ref_fam1_relacion || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam1_relacion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.ref_fam1_telefono || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam1_telefono: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.ref_fam2_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam2_nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.ref_fam2_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam2_apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.ref_fam2_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam2_apellido_m: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relación</Label>
                <Input value={value.ref_fam2_relacion || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam2_relacion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.ref_fam2_telefono || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ref_fam2_telefono: e.target.value })} />
              </div>
            </div>
            
            {editable && (
              <div className="pt-2">
                <Button onClick={onSave}>Guardar cambios</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-sm font-medium mb-4">Datos de la Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razón Social</Label>
                <Input value={value.razon_social || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, razon_social: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nombre Comercial</Label>
                <Input value={value.nombre_comercial || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, nombre_comercial: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Dominio/Sitio Web</Label>
                <Input value={value.dominio || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, dominio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ingreso Mensual Promedio</Label>
                <Input type="number" value={value.ing_mensual || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ing_mensual: e.target.value })} />
              </div>
            </div>
            
            <Separator />
            <h3 className="text-sm font-medium mb-4">Datos del Apoderado Legal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input value={value.apoderado_nombre || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apoderado_nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input value={value.apoderado_apellido_p || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apoderado_apellido_p: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input value={value.apoderado_apellido_m || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apoderado_apellido_m: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input value={value.apoderado_email || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apoderado_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={value.apoderado_tel || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, apoderado_tel: e.target.value })} />
              </div>
            </div>
            
            <Separator />
            <div className="text-sm font-medium">Uso de propiedad</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de inmueble que desea rentar</Label>
                <Select value={value.tipo_inm || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, tipo_inm: v })}>
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
                <Input value={value.giro_neg || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, giro_neg: e.target.value })} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Describa brevemente su experiencia en el giro</Label>
              <Input value={value.exp_giro || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, exp_giro: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Propósitos del arrendamiento</Label>
              <Input value={value.propositos || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, propositos: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>¿Este inmueble sustituirá otro domicilio?</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="sustituye_dom" disabled={!editable} checked={value.sustituye_dom === false} onChange={() => onChange({ ...value, sustituye_dom: false })} />
                  No
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="sustituye_dom" disabled={!editable} checked={value.sustituye_dom === true} onChange={() => onChange({ ...value, sustituye_dom: true })} />
                  Sí
                </label>
              </div>
            </div>
            {value.sustituye_dom === true && (
              <div className="space-y-4">
                <Separator />
                <div className="text-sm font-medium">Información del domicilio anterior</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Calle</Label>
                    <Input value={value.ant_calle || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ant_calle: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Número exterior</Label>
                    <Input value={value.ant_num_ext || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ant_num_ext: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Número interior</Label>
                    <Input value={value.ant_num_int || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ant_num_int: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            
            {editable && (
              <div className="pt-2">
                <Button onClick={onSave}>Guardar cambios</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}