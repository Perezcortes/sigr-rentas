// app/rentas/[id]/preview/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { PersonaMoralPreview } from '@/components/tenant-preview/persona-moral-preview';
import { PersonaFisicaPreview } from '@/components/tenant-preview/persona-fisica-preview';

export default function RentalPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const rentalId = params.id as string;
  
  const [rentalData, setRentalData] = useState<any>(null);
  const [tenantData, setTenantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (rentalId) {
      fetchRentalData();
    }
  }, [rentalId]);

  const fetchRentalData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener datos de la renta
      const rentalResponse = await api.get(`/rentals/${rentalId}`);
      setRentalData(rentalResponse.data);
      
      // Obtener datos específicos del inquilino
      const tenantResponse = await api.get(`/rentals/${rentalId}/inquilino`);
      setTenantData(tenantResponse.data);
      
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del inquilino',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Aquí se puede implementar la descarga en PDF
    toast({
      title: 'Descargando',
      description: 'Preparando documento para descarga...',
    });
  };

  const handleEdit = () => {
    router.push(`/rentas/${rentalId}/inquilino/editar`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del inquilino...</p>
        </div>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No se encontraron datos del inquilino</p>
            <Button 
              onClick={() => router.back()} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Regresar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPersonaMoral = tenantData?.tipo_persona === 'PM';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isPersonaMoral ? 'Información de la Empresa' : 'Información del Inquilino'}
            </h1>
            <p className="text-gray-600 mt-1">
              Renta ID: {rentalId}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Badge de estado */}
      {rentalData && (
        <div className="flex items-center gap-4">
          <Badge 
            variant={
              rentalData.estado === 'activa' ? 'default' :
              rentalData.estado === 'pendiente' ? 'secondary' :
              rentalData.estado === 'cancelada' ? 'destructive' : 'outline'
            }
          >
            {rentalData.estado === 'activa' ? 'Activa' :
             rentalData.estado === 'pendiente' ? 'En Proceso' :
             rentalData.estado === 'cancelada' ? 'Cancelada' : 'Inactiva'}
          </Badge>
          <span className="text-sm text-gray-600">
            Creado el {new Date(rentalData.fechaCreacion).toLocaleDateString('es-MX')}
          </span>
        </div>
      )}

      {/* Información del Tipo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="default">TIPO</Badge>
            Tipo de Inquilino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Persona</label>
              <p className="text-lg font-semibold capitalize">
                {isPersonaMoral ? 'Persona Moral' : 'Persona Física'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Propiedad</label>
              <p className="text-lg font-semibold capitalize">
                {rentalData?.tipoPropiedad || 'No especificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview específico según el tipo */}
      {isPersonaMoral ? (
        <PersonaMoralPreview tenantData={tenantData} />
      ) : (
        <PersonaFisicaPreview tenantData={tenantData} />
      )}

      {/* Información adicional de la renta */}
      {rentalData?.observaciones && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="outline">NOTAS</Badge>
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{rentalData.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Botones de acción al final */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Editar Información
        </Button>
      </div>
    </div>
  );
}