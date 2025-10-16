// modules/rentas/components/tenant-forms/DatosComunesForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TenantFormData } from '@/types/tenant';

interface DatosComunesFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function DatosComunesForm({ formData, onChange }: DatosComunesFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="ejemplo@email.com"
          />
        </div>

        {/* RFC */}
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

        {/* Teléfono Celular */}
        <div className="space-y-2">
          <Label htmlFor="tel_cel">Teléfono Celular</Label>
          <Input
            id="tel_cel"
            type="tel"
            value={formData.tel_cel || ''}
            onChange={(e) => onChange('tel_cel', e.target.value)}
            placeholder="5551234567"
          />
        </div>

        {/* Teléfono Fijo */}
        <div className="space-y-2">
          <Label htmlFor="tel_fijo">Teléfono Fijo (Opcional)</Label>
          <Input
            id="tel_fijo"
            type="tel"
            value={formData.tel_fijo || ''}
            onChange={(e) => onChange('tel_fijo', e.target.value)}
            placeholder="5551234567"
          />
        </div>

        {/* Tipo de Identificación */}
        <div className="space-y-2">
          <Label htmlFor="id_tipo">Tipo de Identificación</Label>
          <Select value={formData.id_tipo || ''} onValueChange={(value) => onChange('id_tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INE">INE</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              <SelectItem value="Licencia">Licencia de Conducir</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Domicilio Actual */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Domicilio Actual</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="dom_calle">Calle</Label>
            <Input
              id="dom_calle"
              value={formData.dom_calle || ''}
              onChange={(e) => onChange('dom_calle', e.target.value)}
              placeholder="Nombre de la calle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_num_ext">No. Exterior</Label>
            <Input
              id="dom_num_ext"
              value={formData.dom_num_ext || ''}
              onChange={(e) => onChange('dom_num_ext', e.target.value)}
              placeholder="123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_num_int">No. Interior</Label>
            <Input
              id="dom_num_int"
              value={formData.dom_num_int || ''}
              onChange={(e) => onChange('dom_num_int', e.target.value)}
              placeholder="4B (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_cp">Código Postal</Label>
            <Input
              id="dom_cp"
              value={formData.dom_cp || ''}
              onChange={(e) => onChange('dom_cp', e.target.value)}
              placeholder="12345"
              maxLength={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_colonia">Colonia</Label>
            <Input
              id="dom_colonia"
              value={formData.dom_colonia || ''}
              onChange={(e) => onChange('dom_colonia', e.target.value)}
              placeholder="Nombre de la colonia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_municipio">Delegación/Municipio</Label>
            <Input
              id="dom_municipio"
              value={formData.dom_municipio || ''}
              onChange={(e) => onChange('dom_municipio', e.target.value)}
              placeholder="Municipio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_estado">Estado</Label>
            <Input
              id="dom_estado"
              value={formData.dom_estado || ''}
              onChange={(e) => onChange('dom_estado', e.target.value)}
              placeholder="Estado"
            />
          </div>
        </div>
      </div>

      {/* Situación Habitacional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Situación Habitacional</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sit_hab">Situación Habitacional</Label>
            <Select value={formData.sit_hab || ''} onValueChange={(value) => onChange('sit_hab', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Propietario">Propietario</SelectItem>
                <SelectItem value="Inquilino">Inquilino</SelectItem>
                <SelectItem value="Familiar">Vive con Familiar</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.sit_hab === 'Inquilino' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="arr_act_nombre">Nombre del Arrendador</Label>
                <Input
                  id="arr_act_nombre"
                  value={formData.arr_act_nombre || ''}
                  onChange={(e) => onChange('arr_act_nombre', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arr_act_apellido_p">Apellido Paterno</Label>
                <Input
                  id="arr_act_apellido_p"
                  value={formData.arr_act_apellido_p || ''}
                  onChange={(e) => onChange('arr_act_apellido_p', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arr_act_apellido_m">Apellido Materno</Label>
                <Input
                  id="arr_act_apellido_m"
                  value={formData.arr_act_apellido_m || ''}
                  onChange={(e) => onChange('arr_act_apellido_m', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arr_act_tel">Teléfono del Arrendador</Label>
                <Input
                  id="arr_act_tel"
                  type="tel"
                  value={formData.arr_act_tel || ''}
                  onChange={(e) => onChange('arr_act_tel', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arr_act_renta">Renta Actual (MXN)</Label>
                <Input
                  id="arr_act_renta"
                  type="number"
                  value={formData.arr_act_renta || ''}
                  onChange={(e) => onChange('arr_act_renta', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arr_act_ano">Año desde que renta</Label>
                <Input
                  id="arr_act_ano"
                  type="number"
                  value={formData.arr_act_ano || ''}
                  onChange={(e) => onChange('arr_act_ano', parseInt(e.target.value))}
                  placeholder="2020"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}