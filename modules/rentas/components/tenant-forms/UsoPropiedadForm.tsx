// modules/rentas/components/tenant-forms/UsoPropiedadForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TenantFormData } from '@/types/tenant';

interface UsoPropiedadFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function UsoPropiedadForm({ formData, onChange }: UsoPropiedadFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Uso de la Propiedad</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="uso_tipo_inm">Tipo de Inmueble</Label>
            <Input
              id="uso_tipo_inm"
              value={formData.uso_tipo_inm || ''}
              onChange={(e) => onChange('uso_tipo_inm', e.target.value)}
              placeholder="Local Comercial, Oficina, Casa, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uso_giro_neg">Giro del Negocio</Label>
            <Input
              id="uso_giro_neg"
              value={formData.uso_giro_neg || ''}
              onChange={(e) => onChange('uso_giro_neg', e.target.value)}
              placeholder="Restaurante, Tienda, Servicios, etc."
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="uso_exp_giro">Experiencia en el Giro</Label>
            <Textarea
              id="uso_exp_giro"
              value={formData.uso_exp_giro || ''}
              onChange={(e) => onChange('uso_exp_giro', e.target.value)}
              placeholder="Describa brevemente su experiencia en este tipo de negocio"
              rows={3}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="uso_propositos">Propósitos del Arrendamiento</Label>
            <Textarea
              id="uso_propositos"
              value={formData.uso_propositos || ''}
              onChange={(e) => onChange('uso_propositos', e.target.value)}
              placeholder="Explique detalladamente el uso que le dará al inmueble"
              rows={4}
            />
          </div>

          <div className="md:col-span-2 flex items-center space-x-2">
            <Checkbox
              id="uso_sustituye_dom"
              checked={formData.uso_sustituye_dom || false}
              onCheckedChange={(checked) => onChange('uso_sustituye_dom', checked)}
            />
            <Label htmlFor="uso_sustituye_dom" className="cursor-pointer">
              ¿Este inmueble sustituirá a otro domicilio?
            </Label>
          </div>
        </div>
      </div>

      {/* Domicilio Anterior */}
      {formData.uso_sustituye_dom && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Domicilio Anterior</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="uso_ant_calle">Calle</Label>
              <Input
                id="uso_ant_calle"
                value={formData.uso_ant_calle || ''}
                onChange={(e) => onChange('uso_ant_calle', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uso_ant_num_ext">No. Exterior</Label>
              <Input
                id="uso_ant_num_ext"
                value={formData.uso_ant_num_ext || ''}
                onChange={(e) => onChange('uso_ant_num_ext', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uso_ant_num_int">No. Interior</Label>
              <Input
                id="uso_ant_num_int"
                value={formData.uso_ant_num_int || ''}
                onChange={(e) => onChange('uso_ant_num_int', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uso_ant_cp">Código Postal</Label>
              <Input
                id="uso_ant_cp"
                value={formData.uso_ant_cp || ''}
                onChange={(e) => onChange('uso_ant_cp', e.target.value)}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uso_ant_colonia">Colonia</Label>
              <Input
                id="uso_ant_colonia"
                value={formData.uso_ant_colonia || ''}
                onChange={(e) => onChange('uso_ant_colonia', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uso_ant_del_mun">Delegación/Municipio</Label>
              <Input
                id="uso_ant_del_mun"
                value={formData.uso_ant_del_mun || ''}
                onChange={(e) => onChange('uso_ant_del_mun', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uso_ant_estado">Estado</Label>
              <Input
                id="uso_ant_estado"
                value={formData.uso_ant_estado || ''}
                onChange={(e) => onChange('uso_ant_estado', e.target.value)}
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="uso_motivo_cambio">Motivo del Cambio de Domicilio</Label>
              <Textarea
                id="uso_motivo_cambio"
                value={formData.uso_motivo_cambio || ''}
                onChange={(e) => onChange('uso_motivo_cambio', e.target.value)}
                placeholder="Explique por qué desea cambiar de domicilio"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}