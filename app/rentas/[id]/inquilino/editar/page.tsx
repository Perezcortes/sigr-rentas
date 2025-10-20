// app/rentas/[id]/inquilino/editar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import TenantEditForm from '@/modules/rentas/components/TenantEditForm';
import { TenantFormData } from '@/types/tenant';

export default function EditTenantPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const rentalId = params.id as string;
  
  const [formData, setFormData] = useState<TenantFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTenantData();
  }, [rentalId]);

  const fetchTenantData = async () => {
    try {
      const response = await api.get(`/rentals/${rentalId}/inquilino`);
      setFormData(response.data);
    } catch (error: any) {
      console.error('Error al cargar datos del inquilino:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del inquilino',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

// page.tsx
const handleSave = async (data: any) => {
  try {
    setIsSaving(true);
    const response = await api.put(`/rentals/${rentalId}/inquilino`, data);
    //console.log('Respuesta del servidor:', response.data);

    toast({
      title: 'Éxito',
      description: 'Datos actualizados correctamente',
    });

    router.push(`/rentas/${rentalId}`);
  } catch (error: any) {
    //console.error('Error al actualizar inquilino:', error);
    toast({
      title: 'Error',
      description: error?.response?.data?.message || error.message || 'No se pudo actualizar',
      variant: 'destructive',
    });
  } finally {
    setIsSaving(false);
  }
};

  const handleCancel = () => {
    router.push(`/rentas/${rentalId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del inquilino...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-gray-600">No se encontraron datos del inquilino</p>
          <Button onClick={handleCancel} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Editar Inquilino</h1>
          <p className="text-gray-600 mt-1">
            Actualiza la información del inquilino para la renta #{rentalId}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Inquilino</CardTitle>
          <CardDescription>
            Modifica la información según sea necesario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantEditForm
            initialData={formData}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}