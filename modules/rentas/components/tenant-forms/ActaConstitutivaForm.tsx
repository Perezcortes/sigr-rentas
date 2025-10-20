// modules/rentas/components/tenant-forms/ActaConstitutivaForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { estadosMexico } from '@/lib/constants';
import { TenantFormData } from '@/types/tenant';

interface ActaConstitutivaFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function ActaConstitutivaForm({ formData, onChange }: ActaConstitutivaFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Datos del acta constitutiva</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pm_notario_nombre" className="required">Nombres(s) del notario *</Label>
            <Input
              id="pm_notario_nombre"
              value={formData.pm_notario_nombre || ''}
              onChange={(e) => onChange('pm_notario_nombre', e.target.value)}
              placeholder="Nombre completo del notario"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_notario_apellido_p" className="required">Apellido Paterno *</Label>
            <Input
              id="pm_notario_apellido_p"
              value={formData.pm_notario_apellido_p || ''}
              onChange={(e) => onChange('pm_notario_apellido_p', e.target.value)}
              placeholder="Apellido paterno"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_notario_apellido_m" className="required">Apellido Materno *</Label>
            <Input
              id="pm_notario_apellido_m"
              value={formData.pm_notario_apellido_m || ''}
              onChange={(e) => onChange('pm_notario_apellido_m', e.target.value)}
              placeholder="Apellido materno"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_escritura_num" className="required">No. De escritura *</Label>
            <Input
              id="pm_escritura_num"
              value={formData.pm_escritura_num || ''}
              onChange={(e) => onChange('pm_escritura_num', e.target.value)}
              placeholder="Número de escritura pública"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_fecha_const" className="required">Fecha de constitución *</Label>
            <Input
              id="pm_fecha_const"
              type="date"
              value={formData.pm_fecha_const || ''}
              onChange={(e) => onChange('pm_fecha_const', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_notario_num" className="required">Notario numero *</Label>
            <Input
              id="pm_notario_num"
              type="number"
              value={formData.pm_notario_num || ''}
              onChange={(e) => onChange('pm_notario_num', parseInt(e.target.value) || 0)}
              placeholder="123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_ciudad_reg" className="required">Ciudad de registro *</Label>
            <Input
              id="pm_ciudad_reg"
              value={formData.pm_ciudad_reg || ''}
              onChange={(e) => onChange('pm_ciudad_reg', e.target.value)}
              placeholder="Ciudad donde se registró"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_estado_reg" className="required">Estado de registro *</Label>
            <Select value={formData.pm_estado_reg || ''} onValueChange={(value) => onChange('pm_estado_reg', value)}>
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
            <Label htmlFor="pm_reg_num" className="required">Numero de registro o inscripción de la persona moral *</Label>
            <Input
              id="pm_reg_num"
              value={formData.pm_reg_num || ''}
              onChange={(e) => onChange('pm_reg_num', e.target.value)}
              placeholder="Número de registro público"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="uso_giro_neg" className="required">Giro comercial *</Label>
            <Input
              id="uso_giro_neg"
              value={formData.uso_giro_neg || ''}
              onChange={(e) => onChange('uso_giro_neg', e.target.value)}
              placeholder="Actividad principal de la empresa"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}