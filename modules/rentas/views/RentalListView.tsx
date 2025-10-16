// modules/rentas/views/RentalListView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Eye, Edit, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import NewProcessDialog from '../components/NewProcessDialog';

interface Rental {
  id: number;
  status: string;
  tipo_origen: string;
  inquilino: {
    id: number;
    tipo_persona: string;
    email?: string;
    pf?: {
      nombres?: string;
      apellido_p?: string;
      apellido_m?: string;
    };
    pm?: {
      razon_social?: string;
    };
  };
  propiedad: {
    id: number;
    direccion?: string;
  };
  created_at: string;
}

export default function RentalListView() {
  const router = useRouter();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewProcessDialog, setShowNewProcessDialog] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await api.get('/rentals');
      setRentals(response.data);
    } catch (error: any) {
      console.error('Error al cargar rentas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las rentas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInquilinoName = (rental: Rental) => {
    if (rental.inquilino.tipo_persona === 'PF' && rental.inquilino.pf) {
      const { nombres, apellido_p, apellido_m } = rental.inquilino.pf;
      return `${nombres || ''} ${apellido_p || ''} ${apellido_m || ''}`.trim();
    }
    if (rental.inquilino.tipo_persona === 'PM' && rental.inquilino.pm) {
      return rental.inquilino.pm.razon_social || 'N/A';
    }
    return 'N/A';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      apartada: 'default',
      en_proceso: 'secondary',
      aprobada: 'default',
      rechazada: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const filteredRentals = rentals.filter((rental) => {
    const inquilinoName = getInquilinoName(rental).toLowerCase();
    const search = searchTerm.toLowerCase();
    return inquilinoName.includes(search) || rental.id.toString().includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rentas</h1>
          <p className="text-gray-600 mt-1">Gestión de solicitudes y procesos de renta</p>
        </div>
        <Button onClick={() => setShowNewProcessDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proceso
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por inquilino o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Rentas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Rentas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando rentas...</p>
            </div>
          ) : filteredRentals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron rentas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">#{rental.id}</TableCell>
                    <TableCell>{getInquilinoName(rental)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {rental.inquilino.tipo_persona === 'PF' ? 'Persona Física' : 'Persona Moral'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell className="capitalize">{rental.tipo_origen}</TableCell>
                    <TableCell>{new Date(rental.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/rentas/${rental.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/rentas/${rental.id}/inquilino/editar`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nuevo Proceso */}
      <NewProcessDialog
        open={showNewProcessDialog}
        onOpenChange={setShowNewProcessDialog}
      />
    </div>
  );
}