// modules/rentas/components/tenant-forms/ReferenciasComercialesForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TenantFormData } from '@/types/tenant';

interface ReferenciasComercialesFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function ReferenciasComercialesForm({ formData, onChange }: ReferenciasComercialesFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Referencias</h3>
        
        {/* Referencia comercial 1 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia comercial 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pm_c1_empresa">Nombre de la empresa</Label>
              <Input
                id="pm_c1_empresa"
                value={formData.pm_c1_empresa || ''}
                onChange={(e) => onChange('pm_c1_empresa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c1_contacto">Nombre del contacto</Label>
              <Input
                id="pm_c1_contacto"
                value={formData.pm_c1_contacto || ''}
                onChange={(e) => onChange('pm_c1_contacto', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c1_tel">Telefono</Label>
              <Input
                id="pm_c1_tel"
                type="tel"
                value={formData.pm_c1_tel || ''}
                onChange={(e) => onChange('pm_c1_tel', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Referencia comercial 2 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia comercial 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pm_c2_empresa">Nombre de la empresa</Label>
              <Input
                id="pm_c2_empresa"
                value={formData.pm_c2_empresa || ''}
                onChange={(e) => onChange('pm_c2_empresa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c2_contacto">Nombre del contacto</Label>
              <Input
                id="pm_c2_contacto"
                value={formData.pm_c2_contacto || ''}
                onChange={(e) => onChange('pm_c2_contacto', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c2_tel">Telefono</Label>
              <Input
                id="pm_c2_tel"
                type="tel"
                value={formData.pm_c2_tel || ''}
                onChange={(e) => onChange('pm_c2_tel', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Referencia comercial 3 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia comercial 3</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pm_c3_empresa">Nombre de la empresa</Label>
              <Input
                id="pm_c3_empresa"
                value={formData.pm_c3_empresa || ''}
                onChange={(e) => onChange('pm_c3_empresa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c3_contacto">Nombre del contacto</Label>
              <Input
                id="pm_c3_contacto"
                value={formData.pm_c3_contacto || ''}
                onChange={(e) => onChange('pm_c3_contacto', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c3_tel">Telefono</Label>
              <Input
                id="pm_c3_tel"
                type="tel"
                value={formData.pm_c3_tel || ''}
                onChange={(e) => onChange('pm_c3_tel', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}