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

// Interfaces basadas en el backend actualizado
interface InquilinoPf {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
}

interface InquilinoPm {
  id: string;
  nombreEmpresa: string;
  email: string;
}

interface Propiedad {
  id: string;
  tipoPropiedad: string;
  domCalle: string;
  domNumExt: string;
  domColonia: string;
  domMunicipio: string;
  domEstado: string;
  precioRenta: number;
}

interface Rental {
  id: string;
  tipoInquilino: 'fisica' | 'moral';
  tipoPropiedad: string;
  estado: 'activa' | 'inactiva' | 'cancelada' | 'pendiente';
  observaciones?: string;
  usuarioCreacion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  // Relaciones transformadas (arrays)
  inquilinos_pf: InquilinoPf[];
  inquilinos_pm: InquilinoPm[];
  propiedades: Propiedad[];
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
    const en_proceso = rentals.filter((r) => r.estado === 'pendiente').length;
    const rentadas = rentals.filter((r) => r.estado === 'activa').length;
    const pendientes = rentals.filter((r) => r.estado === 'pendiente').length;

    setStats({ total, en_proceso, rentadas, pendientes });
  };

  const getInquilinoInfo = (rental: Rental) => {
    if (rental.tipoInquilino === 'fisica' && rental.inquilinos_pf.length > 0) {
      const inquilino = rental.inquilinos_pf[0];
      return {
        nombre: `${inquilino.nombres} ${inquilino.apellidoPaterno} ${inquilino.apellidoMaterno}`.trim(),
        tipo: 'Persona Física'
      };
    } else if (rental.tipoInquilino === 'moral' && rental.inquilinos_pm.length > 0) {
      const inquilino = rental.inquilinos_pm[0];
      return {
        nombre: inquilino.nombreEmpresa,
        tipo: 'Persona Moral'
      };
    }
    return { nombre: 'N/A', tipo: 'No especificado' };
  };

  const getPropiedadInfo = (rental: Rental) => {
    if (rental.propiedades.length > 0) {
      const propiedad = rental.propiedades[0];
      return {
        direccion: `${propiedad.domCalle} ${propiedad.domNumExt}, ${propiedad.domColonia}`,
        municipio: `${propiedad.domMunicipio}, ${propiedad.domEstado}`,
        tipo: propiedad.tipoPropiedad,
        precio: propiedad.precioRenta
      };
    }
    return { 
      direccion: 'N/A', 
      municipio: 'N/A', 
      tipo: 'No especificado',
      precio: 0
    };
  };

  const getStatusBadge = (estado: string) => {
    const variants = {
      pendiente: 'secondary',
      activa: 'outline',
      cancelada: 'destructive',
      inactiva: 'outline'
    } as const;

    const labels = {
      pendiente: 'En Proceso',
      activa: 'Rentada',
      cancelada: 'Cancelada',
      inactiva: 'Inactiva'
    };

    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'outline'}>
        {labels[estado as keyof typeof labels] || estado}
      </Badge>
    );
  };

  const filteredRentals = rentals.filter((rental) => {
    const inquilinoInfo = getInquilinoInfo(rental);
    const propiedadInfo = getPropiedadInfo(rental);
    const search = searchTerm.toLowerCase();
    
    return (
      inquilinoInfo.nombre.toLowerCase().includes(search) ||
      propiedadInfo.direccion.toLowerCase().includes(search) ||
      rental.id.toLowerCase().includes(search)
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
                <p className="text-sm text-gray-600 mb-2">Activas</p>
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
                {filteredRentals.map((rental) => {
                  const inquilinoInfo = getInquilinoInfo(rental);
                  const propiedadInfo = getPropiedadInfo(rental);
                  
                  return (
                    <TableRow key={rental.id} className="border-gray-100">
                      <TableCell>
                        <div>
                          <p className="font-medium">{inquilinoInfo.nombre}</p>
                          <p className="text-xs text-gray-600">{inquilinoInfo.tipo}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {propiedadInfo.tipo} - {propiedadInfo.direccion}
                          </p>
                          <p className="text-xs text-gray-600">{propiedadInfo.municipio}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {propiedadInfo.precio > 0 ? (
                          <div>
                            <p className="font-medium">${propiedadInfo.precio.toLocaleString()}</p>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(rental.estado)}</TableCell>
                      <TableCell>{new Date(rental.fechaCreacion).toLocaleDateString('es-MX')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/rentas/${rental.id}/preview`)}
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
                  );
                })}
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