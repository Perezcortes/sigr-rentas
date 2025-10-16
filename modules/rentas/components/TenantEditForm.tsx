// modules/rentas/components/TenantEditForm.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TenantFormData, TipoPersona } from '@/types/tenant';
import { Save, ArrowLeft } from 'lucide-react';

import DatosComunesForm from './tenant-forms/DatosComunesForm';
import DatosPersonaFisicaForm from './tenant-forms/DatosPersonaFisicaForm';
import EmpleoIngresosForm from './tenant-forms/EmpleoIngresosForm';
import ReferenciasPersonalesForm from './tenant-forms/ReferenciasPersonalesForm';
import DatosPersonaMoralForm from './tenant-forms/DatosPersonaMoralForm';
import UsoPropiedadForm from './tenant-forms/UsoPropiedadForm';

interface TenantEditFormProps {
  initialData?: TenantFormData;
  onSave: (data: TenantFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TenantEditForm({ 
  initialData, 
  onSave, 
  onCancel, 
  isLoading = false 
}: TenantEditFormProps) {
  const [formData, setFormData] = useState<TenantFormData>(
    initialData || {
      tipo_persona: TipoPersona.FISICA,
    }
  );

  const [activeTab, setActiveTab] = useState('tipo');

  const handleFieldChange = (field: keyof TenantFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTipoPersonaChange = (tipo: TipoPersona) => {
    setFormData((prev) => ({
      ...prev,
      tipo_persona: tipo,
    }));
    setActiveTab('comunes');
  };

  const handleSubmit = async () => {
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {initialData ? 'Editar Datos del Inquilino' : 'Nuevo Inquilino'}
          </h2>
          <p className="text-gray-600 mt-1">
            Complete la información del inquilino según corresponda
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>

      {/* Formulario con Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="tipo">Tipo</TabsTrigger>
              <TabsTrigger value="comunes">Comunes</TabsTrigger>
              <TabsTrigger value="personales" disabled={!formData.tipo_persona}>
                {formData.tipo_persona === TipoPersona.FISICA ? 'PF' : 'PM'}
              </TabsTrigger>
              {formData.tipo_persona === TipoPersona.FISICA && (
                <>
                  <TabsTrigger value="empleo">Empleo</TabsTrigger>
                  <TabsTrigger value="referencias">Referencias</TabsTrigger>
                </>
              )}
              <TabsTrigger value="uso_propiedad">Uso Propiedad</TabsTrigger>
            </TabsList>

            {/* Tab: Tipo de Persona */}
            <TabsContent value="tipo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Persona</CardTitle>
                  <CardDescription>
                    Seleccione el tipo de inquilino
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.tipo_persona}
                    onValueChange={(value) => handleTipoPersonaChange(value as TipoPersona)}
                  >
                    <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={TipoPersona.FISICA} id="pf" />
                      <Label htmlFor="pf" className="cursor-pointer flex-1">
                        <div className="font-semibold">Persona Física (PF)</div>
                        <div className="text-sm text-gray-600">
                          Inquilino individual o persona natural
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={TipoPersona.MORAL} id="pm" />
                      <Label htmlFor="pm" className="cursor-pointer flex-1">
                        <div className="font-semibold">Persona Moral (PM)</div>
                        <div className="text-sm text-gray-600">
                          Empresa, corporación u organización
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Datos Comunes */}
            <TabsContent value="comunes" className="space-y-6">
              <DatosComunesForm formData={formData} onChange={handleFieldChange} />
            </TabsContent>

            {/* Tab: Datos Personales (PF o PM) */}
            <TabsContent value="personales" className="space-y-6">
              {formData.tipo_persona === TipoPersona.FISICA ? (
                <DatosPersonaFisicaForm formData={formData} onChange={handleFieldChange} />
              ) : (
                <DatosPersonaMoralForm formData={formData} onChange={handleFieldChange} />
              )}
            </TabsContent>

            {/* Tab: Empleo e Ingresos (solo PF) */}
            {formData.tipo_persona === TipoPersona.FISICA && (
              <TabsContent value="empleo" className="space-y-6">
                <EmpleoIngresosForm formData={formData} onChange={handleFieldChange} />
              </TabsContent>
            )}

            {/* Tab: Referencias (solo PF) */}
            {formData.tipo_persona === TipoPersona.FISICA && (
              <TabsContent value="referencias" className="space-y-6">
                <ReferenciasPersonalesForm formData={formData} onChange={handleFieldChange} />
              </TabsContent>
            )}

            {/* Tab: Uso de Propiedad */}
            <TabsContent value="uso_propiedad" className="space-y-6">
              <UsoPropiedadForm formData={formData} onChange={handleFieldChange} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}