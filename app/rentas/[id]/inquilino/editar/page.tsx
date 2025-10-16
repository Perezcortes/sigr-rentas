// app/rentas/[id]/inquilino/editar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TenantEditForm from '@/modules/rentas/components/TenantEditForm';
import { TenantFormData, formDataToCreateDto, tenantEntityToFormData } from '@/types/tenant';
import { tenantService } from '@/lib/api-tenant';
import { useToast } from '@/components/ui/use-toast';

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [initialData, setInitialData] = useState<TenantFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const rentalId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!rentalId) return;

      try {
        const tenant = await tenantService.getTenantByRentalId(rentalId);
        const formData = tenantEntityToFormData(tenant);
        setInitialData(formData);
      } catch (error: any) {
        console.error('Error al cargar datos del inquilino:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del inquilino',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchTenantData();
  }, [rentalId, toast]);

  const handleSave = async (formData: TenantFormData) => {
    if (!rentalId) return;

    setIsLoading(true);
    try {
      const tenantDto = formDataToCreateDto(formData);
      await tenantService.updateTenant(rentalId, tenantDto);

      toast({
        title: 'Éxito',
        description: 'Datos del inquilino actualizados correctamente',
      });

      router.push(`/rentas/${rentalId}`);
    } catch (error: any) {
      console.error('Error al actualizar inquilino:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al actualizar los datos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/rentas/${rentalId}`);
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-600">No se encontraron datos del inquilino</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <TenantEditForm
        initialData={initialData}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}