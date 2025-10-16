// modules/rentas/components/NewProcessDialog.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Users } from 'lucide-react';

interface NewProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewProcessDialog({ open, onOpenChange }: NewProcessDialogProps) {
  const router = useRouter();

  const handleDesdeOportunidad = () => {
    // TODO: Implementar lógica para seleccionar una oportunidad existente
    onOpenChange(false);
    // router.push('/rentas/nuevo/desde-oportunidad');
  };

  const handleProcesoManual = () => {
    onOpenChange(false);
    router.push('/rentas/nuevo/manual');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nuevo Proceso de Renta</DialogTitle>
          <DialogDescription>
            Selecciona cómo deseas iniciar el proceso de renta
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          {/* Opción: Desde Oportunidad */}
          <button
            onClick={handleDesdeOportunidad}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Desde Oportunidad</h3>
            <p className="text-sm text-gray-600 text-center">
              Crear proceso desde un interesado existente
            </p>
          </button>

          {/* Opción: Proceso Manual */}
          <button
            onClick={handleProcesoManual}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Proceso Manual</h3>
            <p className="text-sm text-gray-600 text-center">
              Crear proceso completamente nuevo
            </p>
          </button>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}