// modules/rentas/components/tenant-forms/DatosPersonaMoralForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TenantFormData } from '@/types/tenant';

interface DatosPersonaMoralFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function DatosPersonaMoralForm({ formData, onChange }: DatosPersonaMoralFormProps) {
  return (
    <div className="space-y-6">
      {/* Datos de la Empresa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Datos de la Empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pm_razon_social">Razón Social / Nombre de la Empresa *</Label>
            <Input
              id="pm_razon_social"
              value={formData.pm_razon_social || ''}
              onChange={(e) => onChange('pm_razon_social', e.target.value)}
              placeholder="Nombre completo de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_dominio">Dominio Web</Label>
            <Input
              id="pm_dominio"
              value={formData.pm_dominio || ''}
              onChange={(e) => onChange('pm_dominio', e.target.value)}
              placeholder="www.empresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_ing_mensual">Ingreso Mensual Promedio (MXN)</Label>
            <Input
              id="pm_ing_mensual"
              type="number"
              value={formData.pm_ing_mensual || ''}
              onChange={(e) => onChange('pm_ing_mensual', parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pm_ref_ubi">Referencias de Ubicación</Label>
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

      {/* Acta Constitutiva */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Acta Constitutiva</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pm_notario_nombre">Nombre del Notario</Label>
            <Input
              id="pm_notario_nombre"
              value={formData.pm_notario_nombre || ''}
              onChange={(e) => onChange('pm_notario_nombre', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_notario_apellido_p">Apellido Paterno del Notario</Label>
            <Input
              id="pm_notario_apellido_p"
              value={formData.pm_notario_apellido_p || ''}
              onChange={(e) => onChange('pm_notario_apellido_p', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_notario_apellido_m">Apellido Materno del Notario</Label>
            <Input
              id="pm_notario_apellido_m"
              value={formData.pm_notario_apellido_m || ''}
              onChange={(e) => onChange('pm_notario_apellido_m', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_notario_num">Número de Notario</Label>
            <Input
              id="pm_notario_num"
              type="number"
              value={formData.pm_notario_num || ''}
              onChange={(e) => onChange('pm_notario_num', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_escritura_num">Número de Escritura</Label>
            <Input
              id="pm_escritura_num"
              value={formData.pm_escritura_num || ''}
              onChange={(e) => onChange('pm_escritura_num', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_fecha_const">Fecha de Constitución</Label>
            <Input
              id="pm_fecha_const"
              type="date"
              value={formData.pm_fecha_const || ''}
              onChange={(e) => onChange('pm_fecha_const', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_ciudad_reg">Ciudad de Registro</Label>
            <Input
              id="pm_ciudad_reg"
              value={formData.pm_ciudad_reg || ''}
              onChange={(e) => onChange('pm_ciudad_reg', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_estado_reg">Estado de Registro</Label>
            <Input
              id="pm_estado_reg"
              value={formData.pm_estado_reg || ''}
              onChange={(e) => onChange('pm_estado_reg', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_reg_num">Número de Registro</Label>
            <Input
              id="pm_reg_num"
              value={formData.pm_reg_num || ''}
              onChange={(e) => onChange('pm_reg_num', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Apoderado Legal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Apoderado Legal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_nombre">Nombre del Apoderado</Label>
            <Input
              id="pm_apoderado_nombre"
              value={formData.pm_apoderado_nombre || ''}
              onChange={(e) => onChange('pm_apoderado_nombre', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_apellido_p">Apellido Paterno</Label>
            <Input
              id="pm_apoderado_apellido_p"
              value={formData.pm_apoderado_apellido_p || ''}
              onChange={(e) => onChange('pm_apoderado_apellido_p', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_apellido_m">Apellido Materno</Label>
            <Input
              id="pm_apoderado_apellido_m"
              value={formData.pm_apoderado_apellido_m || ''}
              onChange={(e) => onChange('pm_apoderado_apellido_m', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_sexo">Sexo</Label>
            <Input
              id="pm_apoderado_sexo"
              value={formData.pm_apoderado_sexo || ''}
              onChange={(e) => onChange('pm_apoderado_sexo', e.target.value)}
              placeholder="Masculino/Femenino"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_tel">Teléfono</Label>
            <Input
              id="pm_apoderado_tel"
              type="tel"
              value={formData.pm_apoderado_tel || ''}
              onChange={(e) => onChange('pm_apoderado_tel', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_ext">Extensión</Label>
            <Input
              id="pm_apoderado_ext"
              value={formData.pm_apoderado_ext || ''}
              onChange={(e) => onChange('pm_apoderado_ext', e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pm_apoderado_email">Correo Electrónico</Label>
            <Input
              id="pm_apoderado_email"
              type="email"
              value={formData.pm_apoderado_email || ''}
              onChange={(e) => onChange('pm_apoderado_email', e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pm_apo_tipo_rep">Tipo de Representación</Label>
            <Input
              id="pm_apo_tipo_rep"
              value={formData.pm_apo_tipo_rep || ''}
              onChange={(e) => onChange('pm_apo_tipo_rep', e.target.value)}
              placeholder="Administrador único, Director General, etc."
            />
          </div>

          <div className="md:col-span-2 flex items-center space-x-2">
            <Checkbox
              id="pm_apoderado_facultades"
              checked={formData.pm_apoderado_facultades || false}
              onCheckedChange={(checked) => onChange('pm_apoderado_facultades', checked)}
            />
            <Label htmlFor="pm_apoderado_facultades" className="cursor-pointer">
              ¿Las facultades constan en el acta constitutiva?
            </Label>
          </div>

          {!formData.pm_apoderado_facultades && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pm_apo_escritura_num">Número de Escritura/Acta</Label>
                <Input
                  id="pm_apo_escritura_num"
                  value={formData.pm_apo_escritura_num || ''}
                  onChange={(e) => onChange('pm_apo_escritura_num', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_notario_num">Número de Notario</Label>
                <Input
                  id="pm_apo_notario_num"
                  type="number"
                  value={formData.pm_apo_notario_num || ''}
                  onChange={(e) => onChange('pm_apo_notario_num', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_fecha_escritura">Fecha de Escritura</Label>
                <Input
                  id="pm_apo_fecha_escritura"
                  type="date"
                  value={formData.pm_apo_fecha_escritura || ''}
                  onChange={(e) => onChange('pm_apo_fecha_escritura', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_fecha_inscripcion">Fecha de Inscripción</Label>
                <Input
                  id="pm_apo_fecha_inscripcion"
                  type="date"
                  value={formData.pm_apo_fecha_inscripcion || ''}
                  onChange={(e) => onChange('pm_apo_fecha_inscripcion', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_reg_num">Número de Registro</Label>
                <Input
                  id="pm_apo_reg_num"
                  value={formData.pm_apo_reg_num || ''}
                  onChange={(e) => onChange('pm_apo_reg_num', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_ciudad_reg">Ciudad de Registro</Label>
                <Input
                  id="pm_apo_ciudad_reg"
                  value={formData.pm_apo_ciudad_reg || ''}
                  onChange={(e) => onChange('pm_apo_ciudad_reg', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_estado_reg">Estado de Registro</Label>
                <Input
                  id="pm_apo_estado_reg"
                  value={formData.pm_apo_estado_reg || ''}
                  onChange={(e) => onChange('pm_apo_estado_reg', e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Referencias Comerciales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Referencias Comerciales</h3>
        
        {/* Referencia 1 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia Comercial 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pm_c1_empresa">Empresa</Label>
              <Input
                id="pm_c1_empresa"
                value={formData.pm_c1_empresa || ''}
                onChange={(e) => onChange('pm_c1_empresa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c1_contacto">Contacto</Label>
              <Input
                id="pm_c1_contacto"
                value={formData.pm_c1_contacto || ''}
                onChange={(e) => onChange('pm_c1_contacto', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c1_tel">Teléfono</Label>
              <Input
                id="pm_c1_tel"
                type="tel"
                value={formData.pm_c1_tel || ''}
                onChange={(e) => onChange('pm_c1_tel', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Referencia 2 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia Comercial 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pm_c2_empresa">Empresa</Label>
              <Input
                id="pm_c2_empresa"
                value={formData.pm_c2_empresa || ''}
                onChange={(e) => onChange('pm_c2_empresa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c2_contacto">Contacto</Label>
              <Input
                id="pm_c2_contacto"
                value={formData.pm_c2_contacto || ''}
                onChange={(e) => onChange('pm_c2_contacto', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c2_tel">Teléfono</Label>
              <Input
                id="pm_c2_tel"
                type="tel"
                value={formData.pm_c2_tel || ''}
                onChange={(e) => onChange('pm_c2_tel', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Referencia 3 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Referencia Comercial 3</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pm_c3_empresa">Empresa</Label>
              <Input
                id="pm_c3_empresa"
                value={formData.pm_c3_empresa || ''}
                onChange={(e) => onChange('pm_c3_empresa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c3_contacto">Contacto</Label>
              <Input
                id="pm_c3_contacto"
                value={formData.pm_c3_contacto || ''}
                onChange={(e) => onChange('pm_c3_contacto', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm_c3_tel">Teléfono</Label>
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