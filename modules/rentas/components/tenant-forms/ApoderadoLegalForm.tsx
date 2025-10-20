// modules/rentas/components/tenant-forms/ApoderadoLegalForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { estadosMexico } from '@/lib/constants';
import { TenantFormData } from '@/types/tenant';

interface ApoderadoLegalFormProps {
  formData: TenantFormData;
  onChange: (field: keyof TenantFormData, value: any) => void;
}

export default function ApoderadoLegalForm({ formData, onChange }: ApoderadoLegalFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Apoderado legal y/o representante</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_nombre">Nombre (s)</Label>
            <Input
              id="pm_apoderado_nombre"
              value={formData.pm_apoderado_nombre || ''}
              onChange={(e) => onChange('pm_apoderado_nombre', e.target.value)}
              placeholder="Nombre completo del apoderado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_apellido_p">Apellido Paterno</Label>
            <Input
              id="pm_apoderado_apellido_p"
              value={formData.pm_apoderado_apellido_p || ''}
              onChange={(e) => onChange('pm_apoderado_apellido_p', e.target.value)}
              placeholder="Apellido paterno"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_apellido_m">Apellido Materno</Label>
            <Input
              id="pm_apoderado_apellido_m"
              value={formData.pm_apoderado_apellido_m || ''}
              onChange={(e) => onChange('pm_apoderado_apellido_m', e.target.value)}
              placeholder="Apellido materno"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_sexo">Sexo</Label>
            <Select value={formData.pm_apoderado_sexo || ''} onValueChange={(value) => onChange('pm_apoderado_sexo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_tel">Telefono</Label>
            <Input
              id="pm_apoderado_tel"
              type="tel"
              value={formData.pm_apoderado_tel || ''}
              onChange={(e) => onChange('pm_apoderado_tel', e.target.value)}
              placeholder="Teléfono de contacto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm_apoderado_ext">Extension</Label>
            <Input
              id="pm_apoderado_ext"
              value={formData.pm_apoderado_ext || ''}
              onChange={(e) => onChange('pm_apoderado_ext', e.target.value)}
              placeholder="Extensión telefónica"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="pm_apoderado_email">Correo electrónico</Label>
            <Input
              id="pm_apoderado_email"
              type="email"
              value={formData.pm_apoderado_email || ''}
              onChange={(e) => onChange('pm_apoderado_email', e.target.value)}
              placeholder="correo@empresa.com"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>¿Sus facultades constan en el acta constitutiva de la empresa?</Label>
            <RadioGroup 
              value={formData.pm_apoderado_facultades ? 'si' : 'no'} 
              onValueChange={(value) => onChange('pm_apoderado_facultades', value === 'si')}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="si" id="facultades_si" />
                  <Label htmlFor="facultades_si">Si</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="facultades_no" />
                  <Label htmlFor="facultades_no">No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {!formData.pm_apoderado_facultades && (
            <>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  Deberá contar con facultades para obligarse a nombre de la sociedad ante terceros o para firmar contratos de arrendamiento y con facultades para otorgar y suscribir títulos de crédito
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_escritura_num">Escritura publica o acta numero</Label>
                <Input
                  id="pm_apo_escritura_num"
                  value={formData.pm_apo_escritura_num || ''}
                  onChange={(e) => onChange('pm_apo_escritura_num', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_notario_num">Notario numero</Label>
                <Input
                  id="pm_apo_notario_num"
                  type="number"
                  value={formData.pm_apo_notario_num || ''}
                  onChange={(e) => onChange('pm_apo_notario_num', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_fecha_escritura">Fecha de escritura o acta donde consten las facultades</Label>
                <Input
                  id="pm_apo_fecha_escritura"
                  type="date"
                  value={formData.pm_apo_fecha_escritura || ''}
                  onChange={(e) => onChange('pm_apo_fecha_escritura', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_reg_num">No. de inscripción en el registro publico</Label>
                <Input
                  id="pm_apo_reg_num"
                  value={formData.pm_apo_reg_num || ''}
                  onChange={(e) => onChange('pm_apo_reg_num', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_ciudad_reg">Ciudad de registro</Label>
                <Input
                  id="pm_apo_ciudad_reg"
                  value={formData.pm_apo_ciudad_reg || ''}
                  onChange={(e) => onChange('pm_apo_ciudad_reg', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_estado_reg">Estado de registro</Label>
                <Select value={formData.pm_apo_estado_reg || ''} onValueChange={(value) => onChange('pm_apo_estado_reg', value)}>
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
                <Label htmlFor="pm_apo_fecha_inscripcion">Fecha de inscripción</Label>
                <Input
                  id="pm_apo_fecha_inscripcion"
                  type="date"
                  value={formData.pm_apo_fecha_inscripcion || ''}
                  onChange={(e) => onChange('pm_apo_fecha_inscripcion', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pm_apo_tipo_rep">Tipo de representación</Label>
                <Select value={formData.pm_apo_tipo_rep || ''} onValueChange={(value) => onChange('pm_apo_tipo_rep', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador único">Administrador único</SelectItem>
                    <SelectItem value="Presidente del consejo">Presidente del consejo</SelectItem>
                    <SelectItem value="Socio administrador">Socio administrador</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.pm_apo_tipo_rep === 'Otro' && (
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="pm_apo_tipo_rep_otro">Llenar en caso de otro</Label>
                  <Input
                    id="pm_apo_tipo_rep_otro"
                    value={formData.pm_apo_tipo_rep || ''}
                    onChange={(e) => onChange('pm_apo_tipo_rep', e.target.value)}
                    placeholder="Especifique el tipo de representación"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}