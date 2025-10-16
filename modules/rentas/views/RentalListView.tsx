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
import { Search, Plus, Eye, Edit, Home, FileText, DollarSign, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import NewProcessDialog from '../components/NewProcessDialog';

interface Rental {
  id: number;
  status: string;
  tipo_origen: string;
  monto_renta?: number;
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
    area?: number;
  };
  created_at: string;
}

interface Stats {
  total: number;
  en_proceso: number;
  rentadas: number;
  pendientes: number;
}

export default function RentalListView() {
  const router = useRouter();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    en_proceso: 0,
    rentadas: 0,
    pendientes: 0,
  });
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
      calculateStats(response.data);
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

  const calculateStats = (rentals: Rental[]) => {
    const total = rentals.length;
    const en_proceso = rentals.filter((r) => r.status === 'en_proceso').length;
    const rentadas = rentals.filter((r) => r.status === 'aprobada').length;
    const pendientes = rentals.filter((r) => r.status === 'apartada').length;

    setStats({ total, en_proceso, rentadas, pendientes });
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
      apartada: 'secondary',
      en_proceso: 'default',
      aprobada: 'outline',
      rentada: 'outline',
      rechazada: 'destructive',
    };
    const labels: Record<string, string> = {
      apartada: 'Apartada',
      en_proceso: 'En Proceso',
      aprobada: 'Rentada',
      rentada: 'Rentada',
      rechazada: 'Rechazada',
    };
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const filteredRentals = rentals.filter((rental) => {
    const inquilinoName = getInquilinoName(rental).toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      inquilinoName.includes(search) ||
      rental.id.toString().includes(search) ||
      rental.propiedad.direccion?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-4xl font-bold">Mis Rentas</h1>
        <p className="text-gray-600 mt-2">Gestión completa de procesos de renta</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Rentas</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <Home className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">En Proceso</p>
                <p className="text-4xl font-bold">{stats.en_proceso}</p>
              </div>
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Rentadas</p>
                <p className="text-4xl font-bold">{stats.rentadas}</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Pendientes</p>
                <p className="text-4xl font-bold">{stats.pendientes}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Principal de Gestión */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Gestión de Rentas</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Administra todos los procesos de renta</p>
            </div>
            <Button 
              onClick={() => setShowNewProcessDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proceso
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por inquilino o propiedad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabla */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando rentas...</p>
            </div>
          ) : filteredRentals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron rentas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="text-gray-700 font-semibold">Inquilino</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Propiedad</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Renta</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Estado</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Fecha</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow key={rental.id} className="border-gray-100">
                    <TableCell>
                      <div>
                        <p className="font-medium">{getInquilinoName(rental)}</p>
                        <p className="text-xs text-gray-600">
                          {rental.inquilino.tipo_persona === 'PF' ? 'Persona Física' : 'Persona Moral'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{rental.propiedad.direccion || 'N/A'}</p>
                        <p className="text-xs text-gray-600">
                          {rental.propiedad.area ? `${rental.propiedad.area}m²` : ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rental.monto_renta ? (
                        <div>
                          <p className="font-medium">${rental.monto_renta.toLocaleString()}</p>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell>{new Date(rental.created_at).toLocaleDateString('es-MX')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/rentas/${rental.id}`)}
                          className="hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/rentas/${rental.id}/inquilino/editar`)}
                          className="hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
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