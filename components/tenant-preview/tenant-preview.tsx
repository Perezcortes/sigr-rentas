// components/tenant-preview/tenant-preview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PersonaMoralPreview } from './persona-moral-preview';
import { PersonaFisicaPreview } from './persona-fisica-preview';

interface TenantPreviewProps {
  tenantData: any;
  rentalData?: any;
}

export function TenantPreview({ tenantData, rentalData }: TenantPreviewProps) {
  const isPersonaMoral = tenantData?.tipo_persona === 'PM';

  return (
    <div className="space-y-6">
      {/* Header con información básica */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {isPersonaMoral ? 'Información de la Empresa' : 'Información Personal'}
            </CardTitle>
            <Badge variant={isPersonaMoral ? "secondary" : "default"}>
              {isPersonaMoral ? 'PERSONA MORAL' : 'PERSONA FÍSICA'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Renderizar según el tipo de persona */}
      {isPersonaMoral ? (
        <PersonaMoralPreview tenantData={tenantData} />
      ) : (
        <PersonaFisicaPreview tenantData={tenantData} />
      )}
    </div>
  );
}