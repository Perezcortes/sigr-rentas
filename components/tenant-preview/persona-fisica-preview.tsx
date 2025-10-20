// components/tenant-preview/persona-fisica-preview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PersonaFisicaPreviewProps {
  tenantData: any;
}

export function PersonaFisicaPreview({ tenantData }: PersonaFisicaPreviewProps) {
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

  const getFullName = () => {
    return [
      tenantData.pf_nombres,
      tenantData.pf_apellido_p,
      tenantData.pf_apellido_m
    ].filter(Boolean).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Sección 1: Datos Personales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline">1</Badge>
            Datos Personales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
              <p className="text-lg font-semibold">{getFullName() || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nacionalidad</label>
              <p className="text-base capitalize">{tenantData.pf_nacionalidad || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sexo</label>
              <p className="text-base capitalize">{tenantData.pf_sexo || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
              <p className="text-base capitalize">{tenantData.pf_edo_civil || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
              <p className="text-base">{formatDate(tenantData.pf_fecha_nac)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">CURP</label>
              <p className="text-base font-mono">{tenantData.pf_curp || 'No especificado'}</p>
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
              <label className="text-sm font-medium text-muted-foreground">Teléfono Celular</label>
              <p className="text-base">{tenantData.tel_cel || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teléfono Fijo</label>
              <p className="text-base">{tenantData.tel_fijo || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Domicilio Actual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline">2</Badge>
            Domicilio Actual
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Situación Habitacional</label>
              <p className="text-base capitalize">{tenantData.sit_hab || 'No especificada'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 3: Empleo e Ingresos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline">3</Badge>
            Empleo e Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Profesión</label>
              <p className="text-base">{tenantData.pf_profesion || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Empleo</label>
              <p className="text-base capitalize">{tenantData.pf_tipo_empleo || 'No especificado'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Empresa</label>
              <p className="text-base">{tenantData.pf_nom_empresa || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</label>
              <p className="text-base">{formatDate(tenantData.pf_fecha_ing_empleo)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ingreso Comprobable</label>
              <p className="text-base font-semibold">
                {formatCurrency(tenantData.pf_ing_comprobable)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ingreso No Comprobable</label>
              <p className="text-base font-semibold">
                {formatCurrency(tenantData.pf_ing_no_comprobable)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 4: Arrendador Actual (si aplica) */}
      {(tenantData.arr_act_nombre || tenantData.arr_act_telefono) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="outline">4</Badge>
              Arrendador Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                <p className="text-base">
                  {[
                    tenantData.arr_act_nombre,
                    tenantData.arr_act_apellido_p,
                    tenantData.arr_act_apellido_m
                  ].filter(Boolean).join(' ') || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                <p className="text-base">{tenantData.arr_act_tel || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Renta Actual</label>
                <p className="text-base">{formatCurrency(tenantData.arr_act_renta)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ocupa Desde</label>
                <p className="text-base">{tenantData.arr_act_ano || 'No especificado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}