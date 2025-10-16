'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Printer } from 'lucide-react';
import { TenantEntity, TipoPersona } from '@/types/tenant';

interface InquilinoPreviewDialogProps {
  tenant: TenantEntity;
  rentalId: string | number;
}

function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  return (
    <div className="py-2 border-b last:border-b-0">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">
        {value === null || value === undefined ? '—' : String(value)}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-900">{children}</h3>;
}

export function InquilinoPreviewDialog({ tenant, rentalId }: InquilinoPreviewDialogProps) {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // TODO: Implementar descarga de PDF usando librería como html2pdf o jsPDF
    alert('Descarga de PDF - próximamente');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Eye className="w-4 h-4 mr-2" />
        Preview
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa - Inquilino #{rentalId}</DialogTitle>
          </DialogHeader>

          {/* Botones de Acción */}
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="space-y-6 print:space-y-4">
            {/* DATOS COMUNES */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Datos Comunes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InfoRow label="Correo Electrónico" value={tenant.email} />
                    <InfoRow label="RFC" value={tenant.rfc} />
                    <InfoRow label="Teléfono Celular" value={tenant.tel_cel} />
                    <InfoRow label="Teléfono Fijo" value={tenant.tel_fijo} />
                  </div>
                  <div>
                    <InfoRow label="Tipo de Persona" value={tenant.tipo_persona === 'PF' ? 'Física' : 'Moral'} />
                    <InfoRow label="Situación Habitacional" value={tenant.sit_hab} />
                    <InfoRow label="Documento ID" value={tenant.id_tipo} />
                  </div>
                </div>

                <SectionTitle>Domicilio</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InfoRow label="Calle" value={tenant.dom_calle} />
                    <InfoRow label="Número Exterior" value={tenant.dom_num_ext} />
                    <InfoRow label="Número Interior" value={tenant.dom_num_int} />
                    <InfoRow label="Código Postal" value={tenant.dom_cp} />
                  </div>
                  <div>
                    <InfoRow label="Colonia" value={tenant.dom_colonia} />
                    <InfoRow label="Municipio" value={tenant.dom_municipio} />
                    <InfoRow label="Estado" value={tenant.dom_estado} />
                  </div>
                </div>

                <SectionTitle>Arrendatario Anterior</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InfoRow label="Nombre" value={tenant.arr_act_nombre} />
                    <InfoRow label="Primer Apellido" value={tenant.arr_act_apellido_p} />
                    <InfoRow label="Segundo Apellido" value={tenant.arr_act_apellido_m} />
                  </div>
                  <div>
                    <InfoRow label="Teléfono" value={tenant.arr_act_tel} />
                    <InfoRow label="Renta Anterior" value={`$${tenant.arr_act_renta}`} />
                    <InfoRow label="Año" value={tenant.arr_act_ano} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PERSONA FÍSICA */}
            {tenant.tipo_persona === 'PF' && tenant.pf && (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">Datos Personales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InfoRow label="Nombres" value={tenant.pf.nombres} />
                        <InfoRow label="Primer Apellido" value={tenant.pf.apellido_p} />
                        <InfoRow label="Segundo Apellido" value={tenant.pf.apellido_m} />
                        <InfoRow label="CURP" value={tenant.pf.curp} />
                      </div>
                      <div>
                        <InfoRow label="Nacionalidad" value={tenant.pf.nacionalidad} />
                        <InfoRow label="Sexo" value={tenant.pf.sexo} />
                        <InfoRow label="Estado Civil" value={tenant.pf.edo_civil} />
                        <InfoRow
                          label="Fecha de Nacimiento"
                          value={
                            tenant.pf.fecha_nac
                              ? new Date(tenant.pf.fecha_nac).toLocaleDateString()
                              : undefined
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">Empleo e Ingresos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InfoRow label="Profesión" value={tenant.pf.profesion} />
                        <InfoRow label="Tipo de Empleo" value={tenant.pf.tipo_empleo} />
                        <InfoRow label="Nombre Empresa" value={tenant.pf.nom_empresa} />
                        <InfoRow label="Teléfono Empresa" value={tenant.pf.tel_empleo} />
                        <InfoRow label="Extensión" value={tenant.pf.ext_empleo} />
                      </div>
                      <div>
                        <InfoRow label="Ingreso Comprobable" value={`$${tenant.pf.ing_comprobable}`} />
                        <InfoRow label="Ingreso No Comprobable" value={`$${tenant.pf.ing_no_comprobable}`} />
                        <InfoRow label="Dependientes" value={tenant.pf.dependientes} />
                        <InfoRow
                          label="Fecha Ingreso"
                          value={
                            tenant.pf.fecha_ing_empleo
                              ? new Date(tenant.pf.fecha_ing_empleo).toLocaleDateString()
                              : undefined
                          }
                        />
                      </div>
                    </div>

                    {tenant.pf.ing_fam_aporta && (
                      <>
                        <SectionTitle>Información del Aportante</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <InfoRow label="Nombre" value={tenant.pf.aportante_nombre} />
                            <InfoRow label="Primer Apellido" value={tenant.pf.aportante_apellido_p} />
                            <InfoRow label="Segundo Apellido" value={tenant.pf.aportante_apellido_m} />
                          </div>
                          <div>
                            <InfoRow label="Parentesco" value={tenant.pf.aportante_parentesco} />
                            <InfoRow label="Teléfono" value={tenant.pf.aportante_telefono} />
                            <InfoRow label="Empresa" value={tenant.pf.aportante_empresa} />
                            <InfoRow label="Ingreso" value={`$${tenant.pf.aportante_ingreso}`} />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* REFERENCIAS */}
                {(tenant.pf.ref_per1_nombre ||
                  tenant.pf.ref_per2_nombre ||
                  tenant.pf.ref_fam1_nombre ||
                  tenant.pf.ref_fam2_nombre) && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-bold mb-4">Referencias</h2>

                      {(tenant.pf.ref_per1_nombre || tenant.pf.ref_per2_nombre) && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-800 mb-3">Referencias Personales</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tenant.pf.ref_per1_nombre && (
                              <div>
                                <InfoRow label="Nombre" value={tenant.pf.ref_per1_nombre} />
                                <InfoRow label="Apellido P" value={tenant.pf.ref_per1_apellido_p} />
                                <InfoRow label="Apellido M" value={tenant.pf.ref_per1_apellido_m} />
                                <InfoRow label="Relación" value={tenant.pf.ref_per1_relacion} />
                                <InfoRow label="Teléfono" value={tenant.pf.ref_per1_telefono} />
                              </div>
                            )}
                            {tenant.pf.ref_per2_nombre && (
                              <div>
                                <InfoRow label="Nombre" value={tenant.pf.ref_per2_nombre} />
                                <InfoRow label="Apellido P" value={tenant.pf.ref_per2_apellido_p} />
                                <InfoRow label="Apellido M" value={tenant.pf.ref_per2_apellido_m} />
                                <InfoRow label="Relación" value={tenant.pf.ref_per2_relacion} />
                                <InfoRow label="Teléfono" value={tenant.pf.ref_per2_telefono} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(tenant.pf.ref_fam1_nombre || tenant.pf.ref_fam2_nombre) && (
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-3">Referencias Familiares</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tenant.pf.ref_fam1_nombre && (
                              <div>
                                <InfoRow label="Nombre" value={tenant.pf.ref_fam1_nombre} />
                                <InfoRow label="Apellido P" value={tenant.pf.ref_fam1_apellido_p} />
                                <InfoRow label="Apellido M" value={tenant.pf.ref_fam1_apellido_m} />
                                <InfoRow label="Relación" value={tenant.pf.ref_fam1_relacion} />
                                <InfoRow label="Teléfono" value={tenant.pf.ref_fam1_telefono} />
                              </div>
                            )}
                            {tenant.pf.ref_fam2_nombre && (
                              <div>
                                <InfoRow label="Nombre" value={tenant.pf.ref_fam2_nombre} />
                                <InfoRow label="Apellido P" value={tenant.pf.ref_fam2_apellido_p} />
                                <InfoRow label="Apellido M" value={tenant.pf.ref_fam2_apellido_m} />
                                <InfoRow label="Relación" value={tenant.pf.ref_fam2_relacion} />
                                <InfoRow label="Teléfono" value={tenant.pf.ref_fam2_telefono} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* PERSONA MORAL */}
            {tenant.tipo_persona === 'PM' && tenant.pm && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Datos de la Empresa</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InfoRow label="Razón Social" value={tenant.pm.razon_social} />
                      <InfoRow label="Dominio" value={tenant.pm.dominio} />
                      <InfoRow label="Ingreso Mensual" value={`$${tenant.pm.ing_mensual}`} />
                    </div>
                    <div>
                      <InfoRow label="Referencia de Ubicación" value={tenant.pm.ref_ubi} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* USO DE PROPIEDAD */}
            {tenant.uso_propiedad && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Uso de Propiedad</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InfoRow label="Tipo de Inmueble" value={tenant.uso_propiedad.tipo_inm} />
                      <InfoRow label="Giro de Negocio" value={tenant.uso_propiedad.giro_neg} />
                      <InfoRow label="Experiencia del Giro" value={tenant.uso_propiedad.exp_giro} />
                    </div>
                    <div>
                      <InfoRow label="Propósitos" value={tenant.uso_propiedad.propositos} />
                      <InfoRow label="Motivo del Cambio" value={tenant.uso_propiedad.motivo_cambio} />
                    </div>
                  </div>

                  <SectionTitle>Domicilio Anterior</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InfoRow label="Calle" value={tenant.uso_propiedad.ant_calle} />
                      <InfoRow label="Número Exterior" value={tenant.uso_propiedad.ant_num_ext} />
                      <InfoRow label="Número Interior" value={tenant.uso_propiedad.ant_num_int} />
                    </div>
                    <div>
                      <InfoRow label="Código Postal" value={tenant.uso_propiedad.ant_cp} />
                      <InfoRow label="Colonia" value={tenant.uso_propiedad.ant_colonia} />
                      <InfoRow label="Estado" value={tenant.uso_propiedad.ant_estado} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}