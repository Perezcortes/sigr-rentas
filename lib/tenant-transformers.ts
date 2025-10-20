// lib/tenant-transformers.ts
import { TenantEntity, PersonaFisicaEntity, PersonaMoralEntity, UsoPropiedadEntity } from '@/types/tenant';
import { CreateTenantDto, TipoPersona } from '@/types/tenant';

/**
 * Convierte una TenantEntity del backend a CreateTenantDto para enviar al API
 */
export function tenantEntityToCreateDto(tenant: TenantEntity): CreateTenantDto {
  const dto: CreateTenantDto = {
    tipo_persona: tenant.tipo_persona as TipoPersona,
    email: tenant.email,
    rfc: tenant.rfc,
    tel_cel: tenant.tel_cel,
    tel_fijo: tenant.tel_fijo,
    id_tipo: tenant.id_tipo,
    dom_calle: tenant.dom_calle,
    dom_num_ext: tenant.dom_num_ext,
    dom_num_int: tenant.dom_num_int,
    dom_cp: tenant.dom_cp,
    dom_colonia: tenant.dom_colonia,
    dom_municipio: tenant.dom_municipio,
    dom_estado: tenant.dom_estado,
    sit_hab: tenant.sit_hab,
    arr_act_nombre: tenant.arr_act_nombre,
    arr_act_apellido_p: tenant.arr_act_apellido_p,
    arr_act_apellido_m: tenant.arr_act_apellido_m,
    arr_act_tel: tenant.arr_act_tel,
    arr_act_renta: tenant.arr_act_renta ? Number(tenant.arr_act_renta) : undefined,
    arr_act_ano: tenant.arr_act_ano,
  };

  // Datos de Persona Física
  if (tenant.tipo_persona === 'PF' && tenant.pf) {
    dto.pf_datos = {
      nombres: tenant.pf.nombres,
      apellido_p: tenant.pf.apellido_p,
      apellido_m: tenant.pf.apellido_m,
      nacionalidad: tenant.pf.nacionalidad,
      sexo: tenant.pf.sexo,
      edo_civil: tenant.pf.edo_civil,
      fecha_nac: tenant.pf.fecha_nac 
        ? new Date(tenant.pf.fecha_nac).toISOString().split('T')[0] 
        : undefined,
      curp: tenant.pf.curp,
      datos_conyuge: tenant.pf.datos_conyuge,
    };

    dto.pf_empleo_ingresos = {
      profesion: tenant.pf.profesion,
      tipo_empleo: tenant.pf.tipo_empleo,
      nom_empresa: tenant.pf.nom_empresa,
      tel_empleo: tenant.pf.tel_empleo,
      ext_empleo: tenant.pf.ext_empleo,
      calle_empresa: tenant.pf.calle_empresa,
      num_ext_empresa: tenant.pf.num_ext_empresa,
      num_int_empresa: tenant.pf.num_int_empresa,
      cp_empresa: tenant.pf.cp_empresa,
      col_empresa: tenant.pf.col_empresa,
      mun_empresa: tenant.pf.mun_empresa,
      edo_empresa: tenant.pf.edo_empresa,
      fecha_ing_empleo: tenant.pf.fecha_ing_empleo 
        ? new Date(tenant.pf.fecha_ing_empleo).toISOString().split('T')[0] 
        : undefined,
      ing_comprobable: tenant.pf.ing_comprobable ? Number(tenant.pf.ing_comprobable) : undefined,
      ing_no_comprobable: tenant.pf.ing_no_comprobable ? Number(tenant.pf.ing_no_comprobable) : undefined,
      dependientes: tenant.pf.dependientes,
      ing_fam_aporta: tenant.pf.ing_fam_aporta,
      num_aportan: tenant.pf.num_aportan,
      aportante_nombre: tenant.pf.aportante_nombre,
      aportante_apellido_p: tenant.pf.aportante_apellido_p,
      aportante_apellido_m: tenant.pf.aportante_apellido_m,
      aportante_parentesco: tenant.pf.aportante_parentesco,
      aportante_telefono: tenant.pf.aportante_telefono,
      aportante_empresa: tenant.pf.aportante_empresa,
      aportante_ingreso: tenant.pf.aportante_ingreso ? Number(tenant.pf.aportante_ingreso) : undefined,
    };

    dto.pf_referencias = {
      per1_nombre: tenant.pf.ref_per1_nombre,
      per1_apellido_p: tenant.pf.ref_per1_apellido_p,
      per1_apellido_m: tenant.pf.ref_per1_apellido_m,
      per1_relacion: tenant.pf.ref_per1_relacion,
      per1_telefono: tenant.pf.ref_per1_telefono,
      per2_nombre: tenant.pf.ref_per2_nombre,
      per2_apellido_p: tenant.pf.ref_per2_apellido_p,
      per2_apellido_m: tenant.pf.ref_per2_apellido_m,
      per2_relacion: tenant.pf.ref_per2_relacion,
      per2_telefono: tenant.pf.ref_per2_telefono,
      fam1_nombre: tenant.pf.ref_fam1_nombre,
      fam1_apellido_p: tenant.pf.ref_fam1_apellido_p,
      fam1_apellido_m: tenant.pf.ref_fam1_apellido_m,
      fam1_relacion: tenant.pf.ref_fam1_relacion,
      fam1_telefono: tenant.pf.ref_fam1_telefono,
      fam2_nombre: tenant.pf.ref_fam2_nombre,
      fam2_apellido_p: tenant.pf.ref_fam2_apellido_p,
      fam2_apellido_m: tenant.pf.ref_fam2_apellido_m,
      fam2_relacion: tenant.pf.ref_fam2_relacion,
      fam2_telefono: tenant.pf.ref_fam2_telefono,
    };
  }

  // Datos de Persona Moral
  if (tenant.tipo_persona === 'PM' && tenant.pm) {
    dto.pm_datos = {
      razon_social: tenant.pm.razon_social,
      dominio: tenant.pm.dominio,
      ing_mensual: tenant.pm.ing_mensual ? Number(tenant.pm.ing_mensual) : undefined,
      ref_ubi: tenant.pm.ref_ubi,
      notario_nombre: tenant.pm.notario_nombre,
      notario_apellido_p: tenant.pm.notario_apellido_p,
      notario_apellido_m: tenant.pm.notario_apellido_m,
      escritura_num: tenant.pm.escritura_num,
      fecha_const: tenant.pm.fecha_const 
        ? new Date(tenant.pm.fecha_const).toISOString().split('T')[0] 
        : undefined,
      notario_num: tenant.pm.notario_num,
      ciudad_reg: tenant.pm.ciudad_reg,
      estado_reg: tenant.pm.estado_reg,
      reg_num: tenant.pm.reg_num,
      apoderado_nombre: tenant.pm.apoderado_nombre,
      apoderado_apellido_p: tenant.pm.apoderado_apellido_p,
      apoderado_apellido_m: tenant.pm.apoderado_apellido_m,
      apoderado_sexo: tenant.pm.apoderado_sexo,
      apoderado_tel: tenant.pm.apoderado_tel,
      apoderado_ext: tenant.pm.apoderado_ext,
      apoderado_email: tenant.pm.apoderado_email,
      apoderado_facultades: tenant.pm.apoderado_facultades,
      apo_escritura_num: tenant.pm.apo_escritura_num,
      apo_notario_num: tenant.pm.apo_notario_num,
      apo_fecha_escritura: tenant.pm.apo_fecha_escritura 
        ? new Date(tenant.pm.apo_fecha_escritura).toISOString().split('T')[0] 
        : undefined,
      apo_reg_num: tenant.pm.apo_reg_num,
      apo_ciudad_reg: tenant.pm.apo_ciudad_reg,
      apo_estado_reg: tenant.pm.apo_estado_reg,
      apo_fecha_inscripcion: tenant.pm.apo_fecha_inscripcion 
        ? new Date(tenant.pm.apo_fecha_inscripcion).toISOString().split('T')[0] 
        : undefined,
      apo_tipo_rep: tenant.pm.apo_tipo_rep,
    };

    dto.pm_referencias = {
      c1_empresa: tenant.pm.ref_c1_empresa,
      c1_contacto: tenant.pm.ref_c1_contacto,
      c1_tel: tenant.pm.ref_c1_tel,
      c2_empresa: tenant.pm.ref_c2_empresa,
      c2_contacto: tenant.pm.ref_c2_contacto,
      c2_tel: tenant.pm.ref_c2_tel,
      c3_empresa: tenant.pm.ref_c3_empresa,
      c3_contacto: tenant.pm.ref_c3_contacto,
      c3_tel: tenant.pm.ref_c3_tel,
    };
  }

  // Uso de Propiedad
  if (tenant.uso_propiedad) {
    dto.uso_propiedad = {
      tipo_inm: tenant.uso_propiedad.tipo_inm,
      giro_neg: tenant.uso_propiedad.giro_neg,
      exp_giro: tenant.uso_propiedad.exp_giro,
      propositos: tenant.uso_propiedad.propositos,
      sustituye_dom: tenant.uso_propiedad.sustituye_dom,
      ant_calle: tenant.uso_propiedad.ant_calle,
      ant_num_ext: tenant.uso_propiedad.ant_num_ext,
      ant_num_int: tenant.uso_propiedad.ant_num_int,
      ant_cp: tenant.uso_propiedad.ant_cp,
      ant_colonia: tenant.uso_propiedad.ant_colonia,
      ant_del_mun: tenant.uso_propiedad.ant_del_mun,
      ant_estado: tenant.uso_propiedad.ant_estado,
      motivo_cambio: tenant.uso_propiedad.motivo_cambio,
    };
  }

  return dto;
}