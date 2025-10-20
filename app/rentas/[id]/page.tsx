"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { RentalProcess } from "@/modules/rentas/views/RentalProcessView"
import type { Rental, RentalStatus, PersonType, Person } from "@/modules/rentas/types"
import { api } from "@/modules/auth/auth.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ============================================
// FUNCIÓN DE MAPEO COMPLETA
// ============================================
function toRental(row: any): Rental {
  const inq = row?.inquilino ?? {}
  const prop = row?.propietario ?? {}
  const obl = row?.obligado_solidario ?? null
  const house = row?.propiedad ?? {}

  const status: RentalStatus =
    (row?.status as RentalStatus) ??
    (row?.estado as RentalStatus) ??
    "en_proceso"

  // Helper para mapear Persona Física o Moral
  function mapPersonData(person: any, isFisica: boolean): Person {
    if (isFisica) {
      // Persona Física - mapear desde person.pf o campos directos
      const pf = person?.pf ?? {}
      return {
        type: "fisica" as PersonType,
        
        // Básicos
        nombre: person?.nombre_completo ?? null,
        telefono: person?.telefono ?? person?.tel_cel ?? null,
        correo: person?.correo ?? person?.email ?? null,
        razonSocial: null,
        nombreComercial: null,
        representante: null,
        
        // Datos personales PF
        nombres: pf?.nombres ?? null,
        apellido_p: pf?.apellido_p ?? null,
        apellido_m: pf?.apellido_m ?? null,
        nacionalidad: pf?.nacionalidad ?? "Mexicana",
        sexo: pf?.sexo ?? null,
        fecha_nac: pf?.fecha_nac ?? null,
        rfc: person?.rfc ?? null,
        curp: pf?.curp ?? null,
        edo_civil: pf?.edo_civil ?? "soltero",
        datos_conyuge: pf?.datos_conyuge ?? null,
        
        // Contacto
        email: person?.email ?? person?.correo ?? null,
        tel_cel: person?.tel_cel ?? person?.telefono ?? null,
        tel_fijo: person?.tel_fijo ?? null,
        
        // Domicilio
        dom_calle: person?.dom_calle ?? null,
        dom_num_ext: person?.dom_num_ext ?? null,
        dom_num_int: person?.dom_num_int ?? null,
        dom_cp: person?.dom_cp ?? null,
        dom_colonia: person?.dom_colonia ?? null,
        dom_municipio: person?.dom_municipio ?? null,
        dom_estado: person?.dom_estado ?? null,
        sit_hab: person?.sit_hab ?? null,
        
        // Arrendador actual (si es inquilino)
        arr_act_nombre: person?.arr_act_nombre ?? null,
        arr_act_apellido_p: person?.arr_act_apellido_p ?? null,
        arr_act_apellido_m: person?.arr_act_apellido_m ?? null,
        arr_act_tel: person?.arr_act_tel ?? null,
        arr_act_renta: person?.arr_act_renta ? Number(person.arr_act_renta) : null,
        arr_act_ano: person?.arr_act_ano ? Number(person.arr_act_ano) : null,
        
        // Empleo e Ingresos
        pf_empleo_ingresos: {
          profesion: pf?.profesion ?? null,
          tipo_empleo: pf?.tipo_empleo ?? null,
          nom_empresa: pf?.nom_empresa ?? null,
          tel_empleo: pf?.tel_empleo ?? null,
          ext_empleo: pf?.ext_empleo ?? null,
          calle_empresa: pf?.calle_empresa ?? null,
          num_ext_empresa: pf?.num_ext_empresa ?? null,
          num_int_empresa: pf?.num_int_empresa ?? null,
          cp_empresa: pf?.cp_empresa ?? null,
          col_empresa: pf?.col_empresa ?? null,
          mun_empresa: pf?.mun_empresa ?? null,
          edo_empresa: pf?.edo_empresa ?? null,
          fecha_ing_empleo: pf?.fecha_ing_empleo ?? null,
          ing_comprobable: pf?.ing_comprobable ? Number(pf.ing_comprobable) : null,
          ing_no_comprobable: pf?.ing_no_comprobable ? Number(pf.ing_no_comprobable) : null,
          dependientes: pf?.dependientes ? Number(pf.dependientes) : null,
          ing_fam_aporta: pf?.ing_fam_aporta ?? null,
          num_aportan: pf?.num_aportan ? Number(pf.num_aportan) : null,
          aportante_nombre: pf?.aportante_nombre ?? null,
          aportante_apellido_p: pf?.aportante_apellido_p ?? null,
          aportante_apellido_m: pf?.aportante_apellido_m ?? null,
          aportante_parentesco: pf?.aportante_parentesco ?? null,
          aportante_telefono: pf?.aportante_telefono ?? null,
          aportante_empresa: pf?.aportante_empresa ?? null,
          aportante_ingreso: pf?.aportante_ingreso ? Number(pf.aportante_ingreso) : null,
        },
        
        // Referencias personales
        pf_referencias: {
          per1_nombre: pf?.ref_per1_nombre ?? null,
          per1_apellido_p: pf?.ref_per1_apellido_p ?? null,
          per1_apellido_m: pf?.ref_per1_apellido_m ?? null,
          per1_relacion: pf?.ref_per1_relacion ?? null,
          per1_telefono: pf?.ref_per1_telefono ?? null,
          per2_nombre: pf?.ref_per2_nombre ?? null,
          per2_apellido_p: pf?.ref_per2_apellido_p ?? null,
          per2_apellido_m: pf?.ref_per2_apellido_m ?? null,
          per2_relacion: pf?.ref_per2_relacion ?? null,
          per2_telefono: pf?.ref_per2_telefono ?? null,
          fam1_nombre: pf?.ref_fam1_nombre ?? null,
          fam1_apellido_p: pf?.ref_fam1_apellido_p ?? null,
          fam1_apellido_m: pf?.ref_fam1_apellido_m ?? null,
          fam1_relacion: pf?.ref_fam1_relacion ?? null,
          fam1_telefono: pf?.ref_fam1_telefono ?? null,
          fam2_nombre: pf?.ref_fam2_nombre ?? null,
          fam2_apellido_p: pf?.ref_fam2_apellido_p ?? null,
          fam2_apellido_m: pf?.ref_fam2_apellido_m ?? null,
          fam2_relacion: pf?.ref_fam2_relacion ?? null,
          fam2_telefono: pf?.ref_fam2_telefono ?? null,
        },
        
        // Uso de propiedad
        uso_propiedad: person?.uso_propiedad ? {
          tipo_inm: person.uso_propiedad.tipo_inm ?? null,
          giro_neg: person.uso_propiedad.giro_neg ?? null,
          exp_giro: person.uso_propiedad.exp_giro ?? null,
          propositos: person.uso_propiedad.propositos ?? null,
          sustituye_dom: person.uso_propiedad.sustituye_dom ?? null,
          ant_calle: person.uso_propiedad.ant_calle ?? null,
          ant_num_ext: person.uso_propiedad.ant_num_ext ?? null,
          ant_num_int: person.uso_propiedad.ant_num_int ?? null,
          ant_cp: person.uso_propiedad.ant_cp ?? null,
          ant_colonia: person.uso_propiedad.ant_colonia ?? null,
          ant_del_mun: person.uso_propiedad.ant_del_mun ?? null,
          ant_estado: person.uso_propiedad.ant_estado ?? null,
          motivo_cambio: person.uso_propiedad.motivo_cambio ?? null,
        } : null,
        
        rawData: person,
      }
    } else {
      // Persona Moral - mapear desde person.pm o campos directos
      const pm = person?.pm ?? {}
      return {
        type: "moral" as PersonType,
        
        // Básicos
        nombre: null,
        telefono: person?.telefono ?? person?.tel_cel ?? null,
        correo: person?.correo ?? person?.email ?? null,
        razonSocial: person?.razon_social ?? pm?.razon_social ?? null,
        nombreComercial: person?.nombre_comercial ?? pm?.nombre_comercial ?? null,
        representante: person?.representante_legal ?? null,
        
        // Contacto
        email: person?.email ?? person?.correo ?? null,
        tel_cel: person?.tel_cel ?? person?.telefono ?? null,
        tel_fijo: person?.tel_fijo ?? null,
        
        // Datos de Persona Moral
        pm_datos: {
          razon_social: person?.razon_social ?? pm?.razon_social ?? null,
          dominio: pm?.dominio ?? null,
          ing_mensual: pm?.ing_mensual ? Number(pm.ing_mensual) : null,
          ref_ubi: pm?.ref_ubi ?? null,
          
          // Notario y constitución
          notario_nombre: pm?.notario_nombre ?? null,
          notario_apellido_p: pm?.notario_apellido_p ?? null,
          notario_apellido_m: pm?.notario_apellido_m ?? null,
          escritura_num: pm?.escritura_num ?? null,
          fecha_const: pm?.fecha_const ?? null,
          notario_num: pm?.notario_num ?? null,
          ciudad_reg: pm?.ciudad_reg ?? null,
          estado_reg: pm?.estado_reg ?? null,
          reg_num: pm?.reg_num ?? null,
          
          // Apoderado legal
          apoderado_nombre: pm?.apoderado_nombre ?? null,
          apoderado_apellido_p: pm?.apoderado_apellido_p ?? null,
          apoderado_apellido_m: pm?.apoderado_apellido_m ?? null,
          apoderado_sexo: pm?.apoderado_sexo ?? null,
          apoderado_tel: pm?.apoderado_tel ?? null,
          apoderado_ext: pm?.apoderado_ext ?? null,
          apoderado_email: pm?.apoderado_email ?? null,
          apoderado_facultades: pm?.apoderado_facultades ?? null,
          
          // Datos del poder
          apo_escritura_num: pm?.apo_escritura_num ?? null,
          apo_notario_num: pm?.apo_notario_num ?? null,
          apo_fecha_escritura: pm?.apo_fecha_escritura ?? null,
          apo_reg_num: pm?.apo_reg_num ?? null,
          apo_ciudad_reg: pm?.apo_ciudad_reg ?? null,
          apo_estado_reg: pm?.apo_estado_reg ?? null,
          apo_fecha_inscripcion: pm?.apo_fecha_inscripcion ?? null,
          apo_tipo_rep: pm?.apo_tipo_rep ?? null,
        },
        
        // Referencias comerciales
        pm_referencias: {
          c1_empresa: pm?.ref_c1_empresa ?? null,
          c1_contacto: pm?.ref_c1_contacto ?? null,
          c1_tel: pm?.ref_c1_tel ?? null,
          c2_empresa: pm?.ref_c2_empresa ?? null,
          c2_contacto: pm?.ref_c2_contacto ?? null,
          c2_tel: pm?.ref_c2_tel ?? null,
          c3_empresa: pm?.ref_c3_empresa ?? null,
          c3_contacto: pm?.ref_c3_contacto ?? null,
          c3_tel: pm?.ref_c3_tel ?? null,
        },
        
        rawData: person,
      }
    }
  }

  // Determinar tipo de persona (manejar "PF"/"PM" y "fisica"/"moral")
  const normalizeTipoPersona = (tipo: string | undefined | null): boolean => {
    if (!tipo) return true // default: física
    const t = String(tipo).toLowerCase()
    return t === "fisica" || t === "pf"
  }

  const isFisicaInq = normalizeTipoPersona(inq?.tipo_persona)
  const isFisicaProp = normalizeTipoPersona(prop?.tipo_persona)
  const isFisicaObl = obl ? normalizeTipoPersona(obl?.tipo_persona) : true

  return {
    id: String(row?.id ?? row?.uuid ?? crypto.randomUUID()),
    status,
    createdAt: String(row?.created_at ?? row?.createdAt ?? "").slice(0, 10) || null,
    updatedAt: String(row?.updated_at ?? row?.updatedAt ?? "").slice(0, 10) || null,
    
    inquilino: mapPersonData(inq, isFisicaInq),
    propietario: mapPersonData(prop, isFisicaProp),
    obligadoSolidario: obl ? mapPersonData(obl, isFisicaObl) : undefined,
    
    propiedad: {
      id: String(house?.id ?? null),
      tipo: house?.tipo ?? null,
      cp: house?.codigo_postal ?? house?.cp ?? null,
      estado: String(house?.estado_id ?? house?.estado ?? ""),
      ciudad: String(house?.ciudad_id ?? house?.ciudad ?? ""),
      colonia: house?.colonia ?? null,
      calle: house?.calle ?? null,
      numero: house?.numero ?? null,
      interior: house?.interior ?? null,
      referencia: house?.referencia ?? null,
      metros: house?.metros_cuadrados ? Number(house.metros_cuadrados) : (house?.metros ? Number(house.metros) : null),
      renta: house?.monto_renta ? Number(house.monto_renta) : (house?.renta ? Number(house.renta) : null),
    },
    
    documentos: Array.isArray(row?.documentos) ? row.documentos : [],
    
    investigacion: row?.investigacion ? {
      indiceRiesgo: row.investigacion.indiceRiesgo ?? row.investigacion.indice_riesgo ?? undefined,
      completed: row.investigacion.completed ?? false,
      fecha: row.investigacion.fecha ?? null,
      resultado: row.investigacion.resultado ?? null,
      notas: row.investigacion.notas ?? null,
    } : undefined,
    
    formalizacion: row?.formalizacion ? {
      fechaInicio: row.formalizacion.fechaInicio ?? row.formalizacion.fecha_inicio ?? undefined,
      fechaFin: row.formalizacion.fechaFin ?? row.formalizacion.fecha_fin ?? undefined,
      fechaFirma: row.formalizacion.fechaFirma ?? row.formalizacion.fecha_firma ?? undefined,
      polizaEnlazada: row.formalizacion.polizaEnlazada ?? row.formalizacion.poliza_enlazada ?? false,
      oficina: row.formalizacion.oficina ?? undefined,
      abogado: row.formalizacion.abogado ?? undefined,
      producto: row.formalizacion.producto ?? undefined,
      notas: row.formalizacion.notas ?? null,
    } : undefined,
    
    activacion: row?.activacion ? {
      fechaInicio: row.activacion.fechaInicio ?? row.activacion.fecha_inicio ?? undefined,
      plazoMeses: row.activacion.plazoMeses ?? row.activacion.plazo_meses ?? undefined,
      fechaFin: row.activacion.fechaFin ?? row.activacion.fecha_fin ?? undefined,
      montoRenta: row.activacion.montoRenta ?? row.activacion.monto_renta ?? undefined,
      montoComision: row.activacion.montoComision ?? row.activacion.monto_comision ?? undefined,
      tipoComision: row.activacion.tipoComision ?? row.activacion.tipo_comision ?? undefined,
      montoNetoComision: row.activacion.montoNetoComision ?? row.activacion.monto_neto_comision ?? undefined,
      formaCobroComision: row.activacion.formaCobroComision ?? row.activacion.forma_cobro_comision ?? undefined,
      activated: row.activacion.activated ?? false,
    } : undefined,
  }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function RentalProcessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = useMemo(() => String(params?.id ?? ""), [params])

  // lee ?edit=1 para habilitar edición
  const editable = useMemo(() => searchParams.get("edit") === "1", [searchParams])

  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const ac = new AbortController()
    
    async function run() {
      setLoading(true)
      setError(null)
      try {
        let row: any | null = null
        try {
          // Intenta obtener la renta directamente
          row = await api(`/rentals/${encodeURIComponent(id)}`, { 
            method: "GET", 
            signal: ac.signal as any 
          })
        } catch {
          // Si falla, obtén todas las rentas y busca por ID
          const raw = await api("/rentals", { 
            method: "GET", 
            signal: ac.signal as any 
          })
          const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
          row = list.find((r) => String(r?.id ?? r?.uuid) === id) ?? null
        }
        
        if (!active) return
        
        if (!row) {
          setError("Renta no encontrada")
          setRental(null)
        } else {
          const mappedRental = toRental(row)
          console.log("Rental mapeado:", mappedRental) // Para debug
          setRental(mappedRental)
        }
      } catch (e: any) {
        if (!active) return
        console.error("Error cargando renta:", e)
        setError(e?.message ?? "Error al cargar la renta")
      } finally {
        if (active) setLoading(false)
      }
    }
    
    if (id) run()
    
    return () => {
      active = false
      ac.abort()
    }
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Cargando proceso…</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-muted-foreground">Obteniendo información de la renta</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !rental) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-medium">
                {error ?? "No se pudo cargar la renta."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                Volver
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Proceso de Renta - {rental.inquilino.type === "fisica" 
              ? (rental.inquilino.nombres 
                  ? `${rental.inquilino.nombres} ${rental.inquilino.apellido_p || ''} ${rental.inquilino.apellido_m || ''}`.trim()
                  : rental.inquilino.nombre || "Sin nombre"
                )
              : rental.inquilino.razonSocial || "Sin razón social"
            }
          </h1>
        </div>
      </div>

      {/* Componente de proceso de renta con todos los datos */}
      <RentalProcess rental={rental} editable={editable} />
    </div>
  )
}