// modules/rentas/components/tenant-forms/DatosPersonalesForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { estadosMexico } from '@/lib/constants';
import { TenantFormData } from '@/types/tenant';

interface DatosPersonalesFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function DatosPersonalesForm({ formData, onChange }: DatosPersonalesFormProps) {
  return (
    <div className="space-y-6">
      {/* Información personal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información personal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pf_nombres" className="required">Nombre(s) *</Label>
            <Input
              id="pf_nombres"
              value={formData.pf_nombres || ''}
              onChange={(e) => onChange('pf_nombres', e.target.value)}
              placeholder="Juan Carlos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_apellido_p" className="required">Apellido Paterno *</Label>
            <Input
              id="pf_apellido_p"
              value={formData.pf_apellido_p || ''}
              onChange={(e) => onChange('pf_apellido_p', e.target.value)}
              placeholder="Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_apellido_m">Apellido Materno</Label>
            <Input
              id="pf_apellido_m"
              value={formData.pf_apellido_m || ''}
              onChange={(e) => onChange('pf_apellido_m', e.target.value)}
              placeholder="López"
            />
          </div>

          <div className="space-y-2">
            <Label>Nacionalidad</Label>
            <RadioGroup 
              value={formData.pf_nacionalidad || 'Mexicana'} 
              onValueChange={(value) => onChange('pf_nacionalidad', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Mexicana" id="nacionalidad_mex" />
                  <Label htmlFor="nacionalidad_mex">Mexicana</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Otra" id="nacionalidad_otra" />
                  <Label htmlFor="nacionalidad_otra">Otra</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {formData.pf_nacionalidad === 'Otra' && (
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="pf_nacionalidad_especifique">Especifique</Label>
              <Input
                id="pf_nacionalidad_especifique"
                value={formData.pf_nacionalidad || ''}
                onChange={(e) => onChange('pf_nacionalidad', e.target.value)}
                placeholder="Especifique la nacionalidad"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Sexo</Label>
            <RadioGroup 
              value={formData.pf_sexo || 'Masculino'} 
              onValueChange={(value) => onChange('pf_sexo', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Masculino" id="sexo_masculino" />
                  <Label htmlFor="sexo_masculino">Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Femenino" id="sexo_femenino" />
                  <Label htmlFor="sexo_femenino">Femenino</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Estado civil</Label>
            <RadioGroup 
              value={formData.pf_edo_civil || 'Soltero'} 
              onValueChange={(value) => onChange('pf_edo_civil', value)}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Soltero" id="civil_soltero" />
                  <Label htmlFor="civil_soltero">Soltero</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Casado" id="civil_casado" />
                  <Label htmlFor="civil_casado">Casado</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="required">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="ejemplo@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_confirmar">Confirmar E-mail</Label>
            <Input
              id="email_confirmar"
              type="email"
              placeholder="ejemplo@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_tipo">Identificación</Label>
            <Select value={formData.id_tipo || ''} onValueChange={(value) => onChange('id_tipo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INE">INE</SelectItem>
                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                <SelectItem value="Cedula">Cédula</SelectItem>
                <SelectItem value="Licencia">Licencia</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_fecha_nac">Fecha de nacimiento</Label>
            <Input
              id="pf_fecha_nac"
              type="date"
              value={formData.pf_fecha_nac || ''}
              onChange={(e) => onChange('pf_fecha_nac', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              value={formData.rfc || ''}
              onChange={(e) => onChange('rfc', e.target.value.toUpperCase())}
              placeholder="ABCD123456XYZ"
              maxLength={13}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_curp">CURP</Label>
            <Input
              id="pf_curp"
              value={formData.pf_curp || ''}
              onChange={(e) => onChange('pf_curp', e.target.value.toUpperCase())}
              placeholder="ABCD123456HDFXYZ12"
              maxLength={18}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tel_cel" className="required">Teléfono celular *</Label>
            <Input
              id="tel_cel"
              type="tel"
              value={formData.tel_cel || ''}
              onChange={(e) => onChange('tel_cel', e.target.value)}
              placeholder="5551234567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tel_fijo">Telefono fijo</Label>
            <Input
              id="tel_fijo"
              type="tel"
              value={formData.tel_fijo || ''}
              onChange={(e) => onChange('tel_fijo', e.target.value)}
              placeholder="5551234567"
            />
          </div>
        </div>
      </div>

      {/* Datos del conyuge (solo si es casado) */}
      {formData.pf_edo_civil === 'Casado' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Datos del conyuge</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf_datos_conyuge_nombre">Nombre(s)</Label>
              <Input
                id="pf_datos_conyuge_nombre"
                value={formData.pf_datos_conyuge || ''}
                onChange={(e) => onChange('pf_datos_conyuge', e.target.value)}
                placeholder="Nombre del cónyuge"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_datos_conyuge_apellido_p">Apellido Paterno</Label>
              <Input
                id="pf_datos_conyuge_apellido_p"
                value={formData.pf_apellido_p || ''}
                onChange={(e) => onChange('pf_apellido_p', e.target.value)}
                placeholder="Apellido paterno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_datos_conyuge_apellido_m">Apellido Materno</Label>
              <Input
                id="pf_datos_conyuge_apellido_m"
                value={formData.pf_apellido_m || ''}
                onChange={(e) => onChange('pf_apellido_m', e.target.value)}
                placeholder="Apellido materno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_datos_conyuge_telefono">Telefono</Label>
              <Input
                id="pf_datos_conyuge_telefono"
                type="tel"
                value={formData.tel_fijo || ''}
                onChange={(e) => onChange('tel_fijo', e.target.value)}
                placeholder="Teléfono del cónyuge"
              />
            </div>
          </div>
        </div>
      )}

      {/* Domicilio donde vive actualmente */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Domicilio donde vive actualmente</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="dom_calle" className="required">Calle *</Label>
            <Input
              id="dom_calle"
              value={formData.dom_calle || ''}
              onChange={(e) => onChange('dom_calle', e.target.value)}
              placeholder="Nombre de la calle"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_num_ext" className="required">Numero exterior *</Label>
            <Input
              id="dom_num_ext"
              value={formData.dom_num_ext || ''}
              onChange={(e) => onChange('dom_num_ext', e.target.value)}
              placeholder="123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_num_int">Numero interior</Label>
            <Input
              id="dom_num_int"
              value={formData.dom_num_int || ''}
              onChange={(e) => onChange('dom_num_int', e.target.value)}
              placeholder="4B"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_cp" className="required">Codigo postal *</Label>
            <Input
              id="dom_cp"
              value={formData.dom_cp || ''}
              onChange={(e) => onChange('dom_cp', e.target.value)}
              placeholder="12345"
              maxLength={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_colonia" className="required">Colonia *</Label>
            <Input
              id="dom_colonia"
              value={formData.dom_colonia || ''}
              onChange={(e) => onChange('dom_colonia', e.target.value)}
              placeholder="Nombre de la colonia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_municipio" className="required">Delegación / Municipio *</Label>
            <Input
              id="dom_municipio"
              value={formData.dom_municipio || ''}
              onChange={(e) => onChange('dom_municipio', e.target.value)}
              placeholder="Municipio"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_estado" className="required">Estado *</Label>
            <Select value={formData.dom_estado || ''} onValueChange={(value) => onChange('dom_estado', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosMexico.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sit_hab">Situación habitacional</Label>
            <Select value={formData.sit_hab || ''} onValueChange={(value) => onChange('sit_hab', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inquilino">Inquilino</SelectItem>
                <SelectItem value="Pension-Hotel">Pensión-Hotel</SelectItem>
                <SelectItem value="Con padres o familiares">Con padres o familiares</SelectItem>
                <SelectItem value="Propietario pagando">Propietario pagando</SelectItem>
                <SelectItem value="Propietario liberado">Propietario liberado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Datos del arrendador actual (solo si es inquilino) */}
      {formData.sit_hab === 'Inquilino' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Datos del arrendador actual</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arr_act_nombre">Nombre(s)</Label>
              <Input
                id="arr_act_nombre"
                value={formData.arr_act_nombre || ''}
                onChange={(e) => onChange('arr_act_nombre', e.target.value)}
                placeholder="Nombre del arrendador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arr_act_apellido_p">Apellido Paterno</Label>
              <Input
                id="arr_act_apellido_p"
                value={formData.arr_act_apellido_p || ''}
                onChange={(e) => onChange('arr_act_apellido_p', e.target.value)}
                placeholder="Apellido paterno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arr_act_apellido_m">Apellido Materno</Label>
              <Input
                id="arr_act_apellido_m"
                value={formData.arr_act_apellido_m || ''}
                onChange={(e) => onChange('arr_act_apellido_m', e.target.value)}
                placeholder="Apellido materno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arr_act_tel">Telefono</Label>
              <Input
                id="arr_act_tel"
                type="tel"
                value={formData.arr_act_tel || ''}
                onChange={(e) => onChange('arr_act_tel', e.target.value)}
                placeholder="Teléfono del arrendador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arr_act_renta">Renta que paga actualmente</Label>
              <Input
                id="arr_act_renta"
                type="number"
                value={formData.arr_act_renta || ''}
                onChange={(e) => onChange('arr_act_renta', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arr_act_ano">Ocupa el lugar desde (año)</Label>
              <Input
                id="arr_act_ano"
                type="number"
                value={formData.arr_act_ano || ''}
                onChange={(e) => onChange('arr_act_ano', parseInt(e.target.value))}
                placeholder="2020"
                min="1900"
                max="2030"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}