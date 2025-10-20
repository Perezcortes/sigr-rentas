// modules/rentas/components/tenant-forms/DatosEmpresaForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { estadosMexico } from '@/lib/constants'; 
import { TenantFormData } from '@/types/tenant';

interface DatosEmpresaFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function DatosEmpresaForm({ formData, onChange }: DatosEmpresaFormProps) {
  return (
    <div className="space-y-6">
      {/* Información acerca de la empresa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Información acerca de la empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pm_razon_social" className="required">Nombre de la empresa o razón social *</Label>
            <Input
              id="pm_razon_social"
              value={formData.pm_razon_social || ''}
              onChange={(e) => onChange('pm_razon_social', e.target.value)}
              placeholder="Nombre completo de la empresa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="required">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="ejemplo@empresa.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_dominio">Dominio de internet de la empresa</Label>
            <Input
              id="pm_dominio"
              value={formData.pm_dominio || ''}
              onChange={(e) => onChange('pm_dominio', e.target.value)}
              placeholder="www.empresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc" className="required">RFC *</Label>
            <Input
              id="rfc"
              value={formData.rfc || ''}
              onChange={(e) => onChange('rfc', e.target.value.toUpperCase())}
              placeholder="ABCD123456XYZ"
              maxLength={13}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tel_cel" className="required">Teléfono *</Label>
            <Input
              id="tel_cel"
              type="tel"
              value={formData.tel_cel || ''}
              onChange={(e) => onChange('tel_cel', e.target.value)}
              placeholder="5551234567"
              required
            />
          </div>

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
            <Label htmlFor="dom_num_ext" className="required">Número exterior *</Label>
            <Input
              id="dom_num_ext"
              value={formData.dom_num_ext || ''}
              onChange={(e) => onChange('dom_num_ext', e.target.value)}
              placeholder="123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_num_int">Número interior</Label>
            <Input
              id="dom_num_int"
              value={formData.dom_num_int || ''}
              onChange={(e) => onChange('dom_num_int', e.target.value)}
              placeholder="4B"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom_cp" className="required">CP *</Label>
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
            <Label htmlFor="dom_municipio" className="required">Municipio *</Label>
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
            <Label htmlFor="pm_ing_mensual" className="required">Ingreso mensual promedio *</Label>
            <Input
              id="pm_ing_mensual"
              type="number"
              value={formData.pm_ing_mensual || ''}
              onChange={(e) => onChange('pm_ing_mensual', parseFloat(e.target.value))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pm_ref_ubi">Referencias de la ubicación</Label>
            <Textarea
              id="pm_ref_ubi"
              value={formData.pm_ref_ubi || ''}
              onChange={(e) => onChange('pm_ref_ubi', e.target.value)}
              placeholder="Descripción de referencias para ubicar la empresa"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}