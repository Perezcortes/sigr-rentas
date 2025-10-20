// components/tenant-preview/persona-moral-preview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PersonaMoralPreviewProps {
  tenantData: any;
}

export function PersonaMoralPreview({ tenantData }: PersonaMoralPreviewProps) {
  const formatCurrency = (value: string | number) => {
    if (!value) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  return (
    <div className="space-y-6">
      {/* Sección 1: Datos de la Empresa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline">1</Badge>
            Datos de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Razón Social</label>
              <p className="text-base">{tenantData.pm_razon_social || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">RFC</label>
              <p className="text-base font-mono">{tenantData.rfc || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base">{tenantData.email || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
              <p className="text-base">{tenantData.tel_cel || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dominio Web</label>
              <p className="text-base">{tenantData.pm_dominio || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ingreso Mensual</label>
              <p className="text-base font-semibold">
                {formatCurrency(tenantData.pm_ing_mensual)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Domicilio de la Empresa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline">2</Badge>
            Domicilio de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Calle</label>
              <p className="text-base">{tenantData.dom_calle || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número Exterior</label>
              <p className="text-base">{tenantData.dom_num_ext || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número Interior</label>
              <p className="text-base">{tenantData.dom_num_int || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Código Postal</label>
              <p className="text-base">{tenantData.dom_cp || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Colonia</label>
              <p className="text-base">{tenantData.dom_colonia || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Municipio</label>
              <p className="text-base">{tenantData.dom_municipio || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <p className="text-base">{tenantData.dom_estado || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 3: Acta Constitutiva */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline">3</Badge>
            Acta Constitutiva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notario</label>
              <p className="text-base">
                {[
                  tenantData.pm_notario_nombre,
                  tenantData.pm_notario_apellido_p,
                  tenantData.pm_notario_apellido_m
                ].filter(Boolean).join(' ') || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número de Notaría</label>
              <p className="text-base">{tenantData.pm_notario_num || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número de Escritura</label>
              <p className="text-base">{tenantData.pm_escritura_num || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Constitución</label>
              <p className="text-base">{formatDate(tenantData.pm_fecha_const)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ciudad de Registro</label>
              <p className="text-base">{tenantData.pm_ciudad_reg || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado de Registro</label>
              <p className="text-base">{tenantData.pm_estado_reg || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número de Registro</label>
              <p className="text-base">{tenantData.pm_reg_num || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 4: Uso de Propiedad */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline">4</Badge>
            Uso de Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Giro Comercial</label>
              <p className="text-base">{tenantData.uso_giro_neg || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}