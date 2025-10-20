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
// Componentes de formularios específicos
import UsoPropiedadForm from './tenant-forms/UsoPropiedadForm';
import DatosEmpresaForm from './tenant-forms/DatosEmpresaForm';
import ActaConstitutivaForm from './tenant-forms/ActaConstitutivaForm';
import ApoderadoLegalForm from './tenant-forms/ApoderadoLegalForm';
import ReferenciasComercialesForm from './tenant-forms/ReferenciasComercialesForm';
import DatosPersonalesForm from './tenant-forms/DatosPersonalesForm';
import EmpleoIngresosForm from './tenant-forms/EmpleoIngresosForm';
import ReferenciasPersonalesForm from './tenant-forms/ReferenciasPersonalesForm';

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
    
    // Navegar al primer tab según el tipo de persona
    if (tipo === TipoPersona.FISICA) {
      setActiveTab('personales');
    } else {
      setActiveTab('empresa');
    }
  };

  const handleSubmit = async () => {
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // Configuración de tabs según tipo de persona
  const getTabsConfig = () => {
    if (formData.tipo_persona === TipoPersona.FISICA) {
      return [
        { value: 'personales', label: 'Datos Personales' },
        { value: 'empleo', label: 'Empleo e Ingresos' },
        { value: 'uso_propiedad', label: 'Uso de Propiedad' },
        { value: 'referencias', label: 'Referencias' },
      ];
    } else {
      return [
        { value: 'empresa', label: 'Datos Empresa' },
        { value: 'acta', label: 'Acta Constitutiva' },
        { value: 'apoderado', label: 'Apoderado Legal' },
        { value: 'uso_propiedad', label: 'Uso de Propiedad' },
        { value: 'referencias', label: 'Referencias' },
      ];
    }
  };

  const tabsConfig = getTabsConfig();

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
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabsConfig.length + 1}, 1fr)` }}>
              <TabsTrigger value="tipo">Tipo</TabsTrigger>
              {tabsConfig.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
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

            {/* TABS PARA PERSONA FÍSICA */}
            {formData.tipo_persona === TipoPersona.FISICA && (
              <>
                <TabsContent value="personales" className="space-y-6">
                  <DatosPersonalesForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="empleo" className="space-y-6">
                  <EmpleoIngresosForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="uso_propiedad" className="space-y-6">
                  <UsoPropiedadForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="referencias" className="space-y-6">
                  <ReferenciasPersonalesForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>
              </>
            )}

            {/* TABS PARA PERSONA MORAL */}
            {formData.tipo_persona === TipoPersona.MORAL && (
              <>
                <TabsContent value="empresa" className="space-y-6">
                  <DatosEmpresaForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="acta" className="space-y-6">
                  <ActaConstitutivaForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="apoderado" className="space-y-6">
                  <ApoderadoLegalForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="uso_propiedad" className="space-y-6">
                  <UsoPropiedadForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="referencias" className="space-y-6">
                  <ReferenciasComercialesForm formData={formData} onChange={handleFieldChange} />
                </TabsContent>
              </>
            )}
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