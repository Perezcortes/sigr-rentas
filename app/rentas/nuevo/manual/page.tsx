// app/rentas/nuevo/manual/page.tsx 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantEditForm from '@/modules/rentas/components/TenantEditForm';
import { TenantFormData, formDataToManualRental } from '@/types/tenant'; 
import { tenantService } from '@/lib/api-tenant';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function NewTenantManualPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

// LOGS DE DEBUG

const handleSave = async (formData: TenantFormData) => {
  if (!user?.id) {
    toast({
      title: 'Error',
      description: 'Usuario no autenticado',
      variant: 'destructive',
    });
    return;
  }

  setIsLoading(true);
  try {
    console.log('📋 DATOS DEL FORMULARIO COMPLETO:', formData);
    console.log('🔍 DATOS ESPECÍFICOS DE PERSONA MORAL:', {
      pm_razon_social: formData.pm_razon_social,
      email: formData.email,
      rfc: formData.rfc,
      tel_cel: formData.tel_cel,
      pm_notario_nombre: formData.pm_notario_nombre,
      pm_notario_apellido_p: formData.pm_notario_apellido_p,
      pm_notario_apellido_m: formData.pm_notario_apellido_m,
      pm_escritura_num: formData.pm_escritura_num,
      pm_fecha_const: formData.pm_fecha_const,
      pm_notario_num: formData.pm_notario_num,
      pm_ciudad_reg: formData.pm_ciudad_reg,
      pm_estado_reg: formData.pm_estado_reg,
      pm_reg_num: formData.pm_reg_num,
      uso_giro_neg: formData.uso_giro_neg,
    });
    
    // Transformar datos del formulario a estructura del backend
    const rentalData = formDataToManualRental(formData, user.id);
    console.log('🚀 DATOS ENVIADOS AL BACKEND - inquilinoPm:', rentalData.inquilinoPm);
    console.log('📤 DATOS COMPLETOS ENVIADOS:', JSON.stringify(rentalData, null, 2));

    // Crear la renta manual usando el servicio existente
    const result = await tenantService.createManualRental(rentalData);
    //console.log('RESPUESTA DEL BACKEND:', result);

    toast({
      title: '¡Éxito!',
      description: 'Proceso de renta creado correctamente.',
    });

    router.push('/rentas');
    
  } catch (error: any) {
    //console.error('ERROR COMPLETO:', error);
    //console.error('DATOS DEL ERROR:', error?.response?.data);
    //console.error('CONFIG DEL REQUEST:', error?.config?.data);
    
    const errorMessage = error?.response?.data?.message 
      || error?.message 
      || 'Error al crear el proceso de renta';
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleCancel = () => {
    router.push('/rentas');
  };

  return (
    <div className="container mx-auto py-8">
      <TenantEditForm
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}