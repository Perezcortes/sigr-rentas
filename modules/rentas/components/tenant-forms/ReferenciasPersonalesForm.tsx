// modules/rentas/components/tenant-forms/ReferenciasPersonalesForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TenantFormData } from '@/types/tenant';

interface ReferenciasPersonalesFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function ReferenciasPersonalesForm({ formData, onChange }: ReferenciasPersonalesFormProps) {
  return (
    <div className="space-y-6">
      {/* Referencias Personales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Referencias Personales</h3>
        
        {/* Referencia Personal 1 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia Personal 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pf_per1_nombre">Nombre</Label>
              <Input
                id="pf_per1_nombre"
                value={formData.pf_per1_nombre || ''}
                onChange={(e) => onChange('pf_per1_nombre', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per1_apellido_p">Apellido Paterno</Label>
              <Input
                id="pf_per1_apellido_p"
                value={formData.pf_per1_apellido_p || ''}
                onChange={(e) => onChange('pf_per1_apellido_p', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per1_apellido_m">Apellido Materno</Label>
              <Input
                id="pf_per1_apellido_m"
                value={formData.pf_per1_apellido_m || ''}
                onChange={(e) => onChange('pf_per1_apellido_m', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per1_relacion">Relación</Label>
              <Input
                id="pf_per1_relacion"
                value={formData.pf_per1_relacion || ''}
                onChange={(e) => onChange('pf_per1_relacion', e.target.value)}
                placeholder="Amigo, Compañero de trabajo, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per1_telefono">Teléfono</Label>
              <Input
                id="pf_per1_telefono"
                type="tel"
                value={formData.pf_per1_telefono || ''}
                onChange={(e) => onChange('pf_per1_telefono', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Referencia Personal 2 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia Personal 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pf_per2_nombre">Nombre</Label>
              <Input
                id="pf_per2_nombre"
                value={formData.pf_per2_nombre || ''}
                onChange={(e) => onChange('pf_per2_nombre', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per2_apellido_p">Apellido Paterno</Label>
              <Input
                id="pf_per2_apellido_p"
                value={formData.pf_per2_apellido_p || ''}
                onChange={(e) => onChange('pf_per2_apellido_p', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per2_apellido_m">Apellido Materno</Label>
              <Input
                id="pf_per2_apellido_m"
                value={formData.pf_per2_apellido_m || ''}
                onChange={(e) => onChange('pf_per2_apellido_m', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per2_relacion">Relación</Label>
              <Input
                id="pf_per2_relacion"
                value={formData.pf_per2_relacion || ''}
                onChange={(e) => onChange('pf_per2_relacion', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_per2_telefono">Teléfono</Label>
              <Input
                id="pf_per2_telefono"
                type="tel"
                value={formData.pf_per2_telefono || ''}
                onChange={(e) => onChange('pf_per2_telefono', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Referencias Familiares */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Referencias Familiares</h3>
        
        {/* Referencia Familiar 1 */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-blue-700">Referencia Familiar 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pf_fam1_nombre">Nombre</Label>
              <Input
                id="pf_fam1_nombre"
                value={formData.pf_fam1_nombre || ''}
                onChange={(e) => onChange('pf_fam1_nombre', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam1_apellido_p">Apellido Paterno</Label>
              <Input
                id="pf_fam1_apellido_p"
                value={formData.pf_fam1_apellido_p || ''}
                onChange={(e) => onChange('pf_fam1_apellido_p', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam1_apellido_m">Apellido Materno</Label>
              <Input
                id="pf_fam1_apellido_m"
                value={formData.pf_fam1_apellido_m || ''}
                onChange={(e) => onChange('pf_fam1_apellido_m', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam1_relacion">Relación</Label>
              <Input
                id="pf_fam1_relacion"
                value={formData.pf_fam1_relacion || ''}
                onChange={(e) => onChange('pf_fam1_relacion', e.target.value)}
                placeholder="Hermano, Padre, Primo, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam1_telefono">Teléfono</Label>
              <Input
                id="pf_fam1_telefono"
                type="tel"
                value={formData.pf_fam1_telefono || ''}
                onChange={(e) => onChange('pf_fam1_telefono', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Referencia Familiar 2 */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-blue-700">Referencia Familiar 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pf_fam2_nombre">Nombre</Label>
              <Input
                id="pf_fam2_nombre"
                value={formData.pf_fam2_nombre || ''}
                onChange={(e) => onChange('pf_fam2_nombre', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam2_apellido_p">Apellido Paterno</Label>
              <Input
                id="pf_fam2_apellido_p"
                value={formData.pf_fam2_apellido_p || ''}
                onChange={(e) => onChange('pf_fam2_apellido_p', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam2_apellido_m">Apellido Materno</Label>
              <Input
                id="pf_fam2_apellido_m"
                value={formData.pf_fam2_apellido_m || ''}
                onChange={(e) => onChange('pf_fam2_apellido_m', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam2_relacion">Relación</Label>
              <Input
                id="pf_fam2_relacion"
                value={formData.pf_fam2_relacion || ''}
                onChange={(e) => onChange('pf_fam2_relacion', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf_fam2_telefono">Teléfono</Label>
              <Input
                id="pf_fam2_telefono"
                type="tel"
                value={formData.pf_fam2_telefono || ''}
                onChange={(e) => onChange('pf_fam2_telefono', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}