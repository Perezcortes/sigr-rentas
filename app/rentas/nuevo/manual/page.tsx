'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Asumiendo la existencia de estos imports en tu proyecto
import TenantEditForm from '@/modules/rentas/components/TenantEditForm';
import { TenantFormData, formDataToCreateDto } from '@/types/tenant'; 
import { tenantService } from '@/lib/api-tenant';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function NewTenantManualPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      const tenantDto = formDataToCreateDto(formData);
      
      // --- CORRECCIÓN: Convertir user.id a número ---
      // La API espera un 'number' para creado_por_user_id
      const userIdAsNumber = Number(user.id);

      // Crear la renta manual completa
      // Nota: Los datos de propietario y propiedad deben ser DTOs completos
      // para que la API los acepte (se asume que se completarán)
      const rentalData = {
        tipo_origen: 'manual',
        creado_por_user_id: userIdAsNumber, // Se usa el valor numérico
        inquilino: tenantDto,
        propietario: {
          // TODO: Agregar datos del propietario
          tipo_persona: 'PF',
          email: 'propietario@example.com',
        },
        propiedad: {
          // TODO: Agregar datos de la propiedad
          direccion: 'Dirección de ejemplo',
        },
      };

      await tenantService.createTenant(rentalData);

      toast({
        title: 'Éxito',
        description: 'Inquilino creado correctamente',
      });

      router.push('/rentas');
    } catch (error: any) {
      console.error('Error al crear inquilino:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al crear el inquilino',
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