// modules/rentas/components/tenant-forms/DatosPersonaFisicaForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TenantFormData } from '@/types/tenant';

interface DatosPersonaFisicaFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function DatosPersonaFisicaForm({ formData, onChange }: DatosPersonaFisicaFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Datos Personales</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pf_nombres">Nombre(s) *</Label>
          <Input
            id="pf_nombres"
            value={formData.pf_nombres || ''}
            onChange={(e) => onChange('pf_nombres', e.target.value)}
            placeholder="Juan Carlos"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pf_apellido_p">Apellido Paterno *</Label>
          <Input
            id="pf_apellido_p"
            value={formData.pf_apellido_p || ''}
            onChange={(e) => onChange('pf_apellido_p', e.target.value)}
            placeholder="Pérez"
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
          <Label htmlFor="pf_nacionalidad">Nacionalidad</Label>
          <Input
            id="pf_nacionalidad"
            value={formData.pf_nacionalidad || ''}
            onChange={(e) => onChange('pf_nacionalidad', e.target.value)}
            placeholder="Mexicana"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pf_sexo">Sexo</Label>
          <Select value={formData.pf_sexo || ''} onValueChange={(value) => onChange('pf_sexo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Femenino">Femenino</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pf_edo_civil">Estado Civil</Label>
          <Select value={formData.pf_edo_civil || ''} onValueChange={(value) => onChange('pf_edo_civil', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Soltero">Soltero(a)</SelectItem>
              <SelectItem value="Casado">Casado(a)</SelectItem>
              <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
              <SelectItem value="Viudo">Viudo(a)</SelectItem>
              <SelectItem value="Union Libre">Unión Libre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pf_fecha_nac">Fecha de Nacimiento</Label>
          <Input
            id="pf_fecha_nac"
            type="date"
            value={formData.pf_fecha_nac || ''}
            onChange={(e) => onChange('pf_fecha_nac', e.target.value)}
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

        {(formData.pf_edo_civil === 'Casado' || formData.pf_edo_civil === 'Union Libre') && (
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pf_datos_conyuge">Datos del Cónyuge</Label>
            <Input
              id="pf_datos_conyuge"
              value={formData.pf_datos_conyuge || ''}
              onChange={(e) => onChange('pf_datos_conyuge', e.target.value)}
              placeholder="Nombre completo del cónyuge"
            />
          </div>
        )}
      </div>
    </div>
  );
}