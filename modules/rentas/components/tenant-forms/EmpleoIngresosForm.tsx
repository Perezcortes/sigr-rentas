// modules/rentas/components/tenant-forms/EmpleoIngresosForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TenantFormData } from '@/types/tenant';

interface EmpleoIngresosFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function EmpleoIngresosForm({ formData, onChange }: EmpleoIngresosFormProps) {
  return (
    <div className="space-y-6">
      {/* Información Laboral */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información Laboral</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pf_profesion">Profesión/Oficio/Puesto</Label>
            <Input
              id="pf_profesion"
              value={formData.pf_profesion || ''}
              onChange={(e) => onChange('pf_profesion', e.target.value)}
              placeholder="Ingeniero, Contador, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_tipo_empleo">Tipo de Empleo</Label>
            <Select value={formData.pf_tipo_empleo || ''} onValueChange={(value) => onChange('pf_tipo_empleo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Empleado">Empleado</SelectItem>
                <SelectItem value="Independiente">Independiente</SelectItem>
                <SelectItem value="Empresario">Empresario</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_nom_empresa">Nombre de la Empresa</Label>
            <Input
              id="pf_nom_empresa"
              value={formData.pf_nom_empresa || ''}
              onChange={(e) => onChange('pf_nom_empresa', e.target.value)}
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_tel_empleo">Teléfono de la Empresa</Label>
            <Input
              id="pf_tel_empleo"
              type="tel"
              value={formData.pf_tel_empleo || ''}
              onChange={(e) => onChange('pf_tel_empleo', e.target.value)}
              placeholder="5551234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_ext_empleo">Extensión</Label>
            <Input
              id="pf_ext_empleo"
              value={formData.pf_ext_empleo || ''}
              onChange={(e) => onChange('pf_ext_empleo', e.target.value)}
              placeholder="1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_fecha_ing_empleo">Fecha de Ingreso al Empleo</Label>
            <Input
              id="pf_fecha_ing_empleo"
              type="date"
              value={formData.pf_fecha_ing_empleo || ''}
              onChange={(e) => onChange('pf_fecha_ing_empleo', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Dirección de la Empresa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Dirección de la Empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pf_calle_empresa">Calle</Label>
            <Input
              id="pf_calle_empresa"
              value={formData.pf_calle_empresa || ''}
              onChange={(e) => onChange('pf_calle_empresa', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_num_ext_empresa">No. Exterior</Label>
            <Input
              id="pf_num_ext_empresa"
              value={formData.pf_num_ext_empresa || ''}
              onChange={(e) => onChange('pf_num_ext_empresa', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_num_int_empresa">No. Interior</Label>
            <Input
              id="pf_num_int_empresa"
              value={formData.pf_num_int_empresa || ''}
              onChange={(e) => onChange('pf_num_int_empresa', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_cp_empresa">Código Postal</Label>
            <Input
              id="pf_cp_empresa"
              value={formData.pf_cp_empresa || ''}
              onChange={(e) => onChange('pf_cp_empresa', e.target.value)}
              maxLength={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_col_empresa">Colonia</Label>
            <Input
              id="pf_col_empresa"
              value={formData.pf_col_empresa || ''}
              onChange={(e) => onChange('pf_col_empresa', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_mun_empresa">Municipio/Delegación</Label>
            <Input
              id="pf_mun_empresa"
              value={formData.pf_mun_empresa || ''}
              onChange={(e) => onChange('pf_mun_empresa', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_edo_empresa">Estado</Label>
            <Input
              id="pf_edo_empresa"
              value={formData.pf_edo_empresa || ''}
              onChange={(e) => onChange('pf_edo_empresa', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Ingresos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Ingresos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pf_ing_comprobable">Ingreso Mensual Comprobable (MXN)</Label>
            <Input
              id="pf_ing_comprobable"
              type="number"
              value={formData.pf_ing_comprobable || ''}
              onChange={(e) => onChange('pf_ing_comprobable', parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_ing_no_comprobable">Ingreso Mensual No Comprobable (MXN)</Label>
            <Input
              id="pf_ing_no_comprobable"
              type="number"
              value={formData.pf_ing_no_comprobable || ''}
              onChange={(e) => onChange('pf_ing_no_comprobable', parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf_dependientes">Número de Dependientes Económicos</Label>
            <Input
              id="pf_dependientes"
              type="number"
              value={formData.pf_dependientes || ''}
              onChange={(e) => onChange('pf_dependientes', parseInt(e.target.value))}
              placeholder="0"
            />
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="pf_ing_fam_aporta"
              checked={formData.pf_ing_fam_aporta || false}
              onCheckedChange={(checked) => onChange('pf_ing_fam_aporta', checked)}
            />
            <Label htmlFor="pf_ing_fam_aporta" className="cursor-pointer">
              ¿Otra persona aporta al ingreso familiar?
            </Label>
          </div>
        </div>
      </div>

      {/* Datos del Aportante */}
      {formData.pf_ing_fam_aporta && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Datos del Aportante</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf_num_aportan">Número de Personas que Aportan</Label>
              <Input
                id="pf_num_aportan"
                type="number"
                value={formData.pf_num_aportan || ''}
                onChange={(e) => onChange('pf_num_aportan', parseInt(e.target.value))}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_aportante_nombre">Nombre del Aportante</Label>
              <Input
                id="pf_aportante_nombre"
                value={formData.pf_aportante_nombre || ''}
                onChange={(e) => onChange('pf_aportante_nombre', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_aportante_apellido_p">Apellido Paterno</Label>
              <Input
                id="pf_aportante_apellido_p"
                value={formData.pf_aportante_apellido_p || ''}
                onChange={(e) => onChange('pf_aportante_apellido_p', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_aportante_apellido_m">Apellido Materno</Label>
              <Input
                id="pf_aportante_apellido_m"
                value={formData.pf_aportante_apellido_m || ''}
                onChange={(e) => onChange('pf_aportante_apellido_m', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_aportante_parentesco">Parentesco</Label>
              <Input
                id="pf_aportante_parentesco"
                value={formData.pf_aportante_parentesco || ''}
                onChange={(e) => onChange('pf_aportante_parentesco', e.target.value)}
                placeholder="Cónyuge, Hijo, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_aportante_telefono">Teléfono</Label>
              <Input
                id="pf_aportante_telefono"
                type="tel"
                value={formData.pf_aportante_telefono || ''}
                onChange={(e) => onChange('pf_aportante_telefono', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_aportante_empresa">Empresa donde Trabaja</Label>
              <Input
                id="pf_aportante_empresa"
                value={formData.pf_aportante_empresa || ''}
                onChange={(e) => onChange('pf_aportante_empresa', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_aportante_ingreso">Ingreso Mensual (MXN)</Label>
              <Input
                id="pf_aportante_ingreso"
                type="number"
                value={formData.pf_aportante_ingreso || ''}
                onChange={(e) => onChange('pf_aportante_ingreso', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}