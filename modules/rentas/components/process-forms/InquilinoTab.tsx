// src/modules/rentas/components/process-forms/InquilinoTab.tsx
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

const ESTADOS = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
]

export function InquilinoTab({ value, editable, onChange, onSave }: InquilinoTabProps) {
  const isFisica = value?.type === "fisica"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Inquilino</CardTitle>
        <CardDescription>Información personal o empresarial del inquilino</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Label>Tipo de Persona:</Label>
          <Select value={value?.type || ""} disabled>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fisica">Persona Física</SelectItem>
              <SelectItem value="moral">Persona Moral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isFisica ? (
          <div className="space-y-6">
            {/* DATOS PERSONALES */}
            <div>
              <h3 className="text-sm font-medium mb-4">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombres</Label>
                  <Input
                    value={value?.nombres || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, nombres: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido Paterno</Label>
                  <Input
                    value={value?.apellido_p || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, apellido_p: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido Materno</Label>
                  <Input
                    value={value?.apellido_m || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, apellido_m: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Nacionalidad</Label>
                  <Select value={value?.nacionalidad || "Mexicana"} disabled={!editable} onValueChange={(v) => onChange({ ...value, nacionalidad: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mexicana">Mexicana</SelectItem>
                      <SelectItem value="Otra">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select value={value?.sexo || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, sexo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={value?.fecha_nac || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, fecha_nac: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>RFC</Label>
                  <Input
                    value={value?.rfc || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, rfc: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CURP</Label>
                  <Input
                    value={value?.curp || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, curp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado Civil</Label>
                  <Select value={value?.edo_civil || "soltero"} disabled={!editable} onValueChange={(v) => onChange({ ...value, edo_civil: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero</SelectItem>
                      <SelectItem value="casado">Casado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* CONTACTO */}
            <div>
              <h3 className="text-sm font-medium mb-4">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={value?.email || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono Celular</Label>
                  <Input
                    value={value?.tel_cel || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, tel_cel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono Fijo</Label>
                  <Input
                    value={value?.tel_fijo || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, tel_fijo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* DOMICILIO ACTUAL */}
            <div>
              <h3 className="text-sm font-medium mb-4">Domicilio Actual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calle</Label>
                  <Input
                    value={value?.dom_calle || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, dom_calle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. Exterior</Label>
                  <Input
                    value={value?.dom_num_ext || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, dom_num_ext: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. Interior</Label>
                  <Input
                    value={value?.dom_num_int || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, dom_num_int: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input
                    value={value?.dom_cp || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, dom_cp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Colonia</Label>
                  <Input
                    value={value?.dom_colonia || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, dom_colonia: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Municipio</Label>
                  <Input
                    value={value?.dom_municipio || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, dom_municipio: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Estado</Label>
                  <Select value={value?.dom_estado || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, dom_estado: v })}>
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
              </div>

              <div className="space-y-2 mt-4">
                <Label>Situación Habitacional</Label>
                <Select value={value?.sit_hab || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, sit_hab: v })}>
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

            {value?.sit_hab === "Inquilino" && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-4">Datos del Arrendador Actual</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={value?.arr_act_nombre || ""}
                        readOnly={!editable}
                        onChange={(e) => onChange({ ...value, arr_act_nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido Paterno</Label>
                      <Input
                        value={value?.arr_act_apellido_p || ""}
                        readOnly={!editable}
                        onChange={(e) => onChange({ ...value, arr_act_apellido_p: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido Materno</Label>
                      <Input
                        value={value?.arr_act_apellido_m || ""}
                        readOnly={!editable}
                        onChange={(e) => onChange({ ...value, arr_act_apellido_m: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={value?.arr_act_tel || ""}
                        readOnly={!editable}
                        onChange={(e) => onChange({ ...value, arr_act_tel: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renta Actual</Label>
                      <Input
                        type="number"
                        value={value?.arr_act_renta || ""}
                        readOnly={!editable}
                        onChange={(e) => onChange({ ...value, arr_act_renta: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ocupa Desde (año)</Label>
                      <Input
                        type="number"
                        value={value?.arr_act_ano || ""}
                        readOnly={!editable}
                        onChange={(e) => onChange({ ...value, arr_act_ano: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* EMPLEO E INGRESOS */}
            <div>
              <h3 className="text-sm font-medium mb-4">Empleo e Ingresos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Profesión/Oficio</Label>
                  <Input
                    value={value?.pf_empleo_ingresos?.profesion || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pf_empleo_ingresos: { ...value.pf_empleo_ingresos, profesion: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Empleo</Label>
                  <Select value={value?.pf_empleo_ingresos?.tipo_empleo || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, pf_empleo_ingresos: { ...value.pf_empleo_ingresos, tipo_empleo: v } })}>
                    <SelectTrigger>
                      <SelectValue />
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

              <div className="space-y-2 mt-4">
                <Label>Empresa</Label>
                <Input
                  value={value?.pf_empleo_ingresos?.nom_empresa || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, pf_empleo_ingresos: { ...value.pf_empleo_ingresos, nom_empresa: e.target.value } })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Ingreso Mensual Comprobable</Label>
                  <Input
                    type="number"
                    value={value?.pf_empleo_ingresos?.ing_comprobable || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pf_empleo_ingresos: { ...value.pf_empleo_ingresos, ing_comprobable: parseFloat(e.target.value) } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ingreso Mensual No Comprobable</Label>
                  <Input
                    type="number"
                    value={value?.pf_empleo_ingresos?.ing_no_comprobable || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pf_empleo_ingresos: { ...value.pf_empleo_ingresos, ing_no_comprobable: parseFloat(e.target.value) } })}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label>Número de Dependientes</Label>
                <Input
                  type="number"
                  value={value?.pf_empleo_ingresos?.dependientes || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...value, pf_empleo_ingresos: { ...value.pf_empleo_ingresos, dependientes: parseInt(e.target.value) } })}
                />
              </div>
            </div>

            <Separator />

            {/* USO DE PROPIEDAD */}
            <div>
              <h3 className="text-sm font-medium mb-4">Uso de Propiedad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Inmueble a Rentar</Label>
                  <Select value={value?.uso_propiedad?.tipo_inm || ""} disabled={!editable} onValueChange={(v) => onChange({ ...value, uso_propiedad: { ...value.uso_propiedad, tipo_inm: v } })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="bodega">Bodega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PERSONA MORAL */
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Datos de la Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Razón Social</Label>
                  <Input
                    value={value?.pm_datos?.razon_social || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, razon_social: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dominio/Sitio Web</Label>
                  <Input
                    value={value?.pm_datos?.dominio || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, dominio: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ingreso Mensual Promedio</Label>
                  <Input
                    type="number"
                    value={value?.pm_datos?.ing_mensual || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, ing_mensual: parseFloat(e.target.value) } })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-4">Datos del Apoderado Legal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={value?.pm_datos?.apoderado_nombre || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, apoderado_nombre: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido Paterno</Label>
                  <Input
                    value={value?.pm_datos?.apoderado_apellido_p || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, apoderado_apellido_p: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido Materno</Label>
                  <Input
                    value={value?.pm_datos?.apoderado_apellido_m || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, apoderado_apellido_m: e.target.value } })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={value?.pm_datos?.apoderado_email || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, apoderado_email: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={value?.pm_datos?.apoderado_tel || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, pm_datos: { ...value.pm_datos, apoderado_tel: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-4">Contacto General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={value?.email || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={value?.tel_cel || value?.tel_fijo || ""}
                    readOnly={!editable}
                    onChange={(e) => onChange({ ...value, tel_cel: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {editable && (
          <div className="pt-4 flex items-center gap-2 border-t">
            <Button onClick={onSave}>Guardar cambios</Button>
            <Button variant="outline" onClick={() => window.open(`/rentas/0/inquilino-form`, "_blank")}>
              Abrir formulario completo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}