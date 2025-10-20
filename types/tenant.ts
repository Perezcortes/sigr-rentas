// types/tenant.ts

export enum TipoPersona {
  FISICA = "PF",
  MORAL = "PM",
}

// ENTIDADES DE RESPUESTA (API)
export interface PersonaFisicaEntity {
  id: number;
  nombres?: string;
  apellido_p?: string;
  apellido_m?: string;
  nacionalidad?: string;
  sexo?: string;
  edo_civil?: string;
  fecha_nac?: Date | string;
  curp?: string;
  datos_conyuge?: string;
  // Empleo e Ingresos
  profesion?: string;
  tipo_empleo?: string;
  nom_empresa?: string;
  tel_empleo?: string;
  ext_empleo?: string;
  calle_empresa?: string;
  num_ext_empresa?: string;
  num_int_empresa?: string;
  cp_empresa?: string;
  col_empresa?: string;
  mun_empresa?: string;
  edo_empresa?: string;
  fecha_ing_empleo?: Date | string;
  ing_comprobable?: number;
  ing_no_comprobable?: number;
  dependientes?: number;
  ing_fam_aporta?: boolean;
  num_aportan?: number;
  aportante_nombre?: string;
  aportante_apellido_p?: string;
  aportante_apellido_m?: string;
  aportante_parentesco?: string;
  aportante_telefono?: string;
  aportante_empresa?: string;
  aportante_ingreso?: number;
  // Referencias
  ref_per1_nombre?: string;
  ref_per1_apellido_p?: string;
  ref_per1_apellido_m?: string;
  ref_per1_relacion?: string;
  ref_per1_telefono?: string;
  ref_per2_nombre?: string;
  ref_per2_apellido_p?: string;
  ref_per2_apellido_m?: string;
  ref_per2_relacion?: string;
  ref_per2_telefono?: string;
  ref_fam1_nombre?: string;
  ref_fam1_apellido_p?: string;
  ref_fam1_apellido_m?: string;
  ref_fam1_relacion?: string;
  ref_fam1_telefono?: string;
  ref_fam2_nombre?: string;
  ref_fam2_apellido_p?: string;
  ref_fam2_apellido_m?: string;
  ref_fam2_relacion?: string;
  ref_fam2_telefono?: string;
}

export interface PersonaMoralEntity {
  id: number;
  razon_social?: string;
  dominio?: string;
  ing_mensual?: number;
  ref_ubi?: string;
  // Acta Constitutiva
  notario_nombre?: string;
  notario_apellido_p?: string;
  notario_apellido_m?: string;
  escritura_num?: string;
  fecha_const?: Date | string;
  notario_num?: number;
  ciudad_reg?: string;
  estado_reg?: string;
  reg_num?: string;
  // Apoderado Legal
  apoderado_nombre?: string;
  apoderado_apellido_p?: string;
  apoderado_apellido_m?: string;
  apoderado_sexo?: string;
  apoderado_tel?: string;
  apoderado_ext?: string;
  apoderado_email?: string;
  apoderado_facultades?: boolean;
  apo_escritura_num?: string;
  apo_notario_num?: number;
  apo_fecha_escritura?: Date | string;
  apo_reg_num?: string;
  apo_ciudad_reg?: string;
  apo_estado_reg?: string;
  apo_fecha_inscripcion?: Date | string;
  apo_tipo_rep?: string;
  // Referencias Comerciales
  ref_c1_empresa?: string;
  ref_c1_contacto?: string;
  ref_c1_tel?: string;
  ref_c2_empresa?: string;
  ref_c2_contacto?: string;
  ref_c2_tel?: string;
  ref_c3_empresa?: string;
  ref_c3_contacto?: string;
  ref_c3_tel?: string;
}

export interface UsoPropiedadEntity {
  id: number;
  tipo_inm?: string;
  giro_neg?: string;
  exp_giro?: string;
  propositos?: string;
  sustituye_dom?: boolean;
  ant_calle?: string;
  ant_num_ext?: string;
  ant_num_int?: string;
  ant_cp?: string;
  ant_colonia?: string;
  ant_del_mun?: string;
  ant_estado?: string;
  motivo_cambio?: string;
}

export interface TenantEntity {
  id: number;
  tipo_persona: "PF" | "PM";
  email?: string;
  rfc?: string;
  tel_cel?: string;
  tel_fijo?: string;
  id_tipo?: string;
  dom_calle?: string;
  dom_num_ext?: string;
  dom_num_int?: string;
  dom_cp?: string;
  dom_colonia?: string;
  dom_municipio?: string;
  dom_estado?: string;
  sit_hab?: string;
  arr_act_nombre?: string;
  arr_act_apellido_p?: string;
  arr_act_apellido_m?: string;
  arr_act_tel?: string;
  arr_act_renta?: number;
  arr_act_ano?: number;
  pf?: PersonaFisicaEntity;
  pm?: PersonaMoralEntity;
  uso_propiedad?: UsoPropiedadEntity;
  created_at: Date;
  updated_at: Date;
}

// DTOs PARA CREAR/ACTUALIZAR 
export interface PersonaFisicaDto {
  nombres?: string;
  apellido_p?: string;
  apellido_m?: string;
  nacionalidad?: string;
  sexo?: string;
  edo_civil?: string;
  fecha_nac?: string;
  curp?: string;
  datos_conyuge?: string;
}

export interface EmpleoIngresosDto {
  profesion?: string;
  tipo_empleo?: string;
  nom_empresa?: string;
  tel_empleo?: string;
  ext_empleo?: string;
  calle_empresa?: string;
  num_ext_empresa?: string;
  num_int_empresa?: string;
  cp_empresa?: string;
  col_empresa?: string;
  mun_empresa?: string;
  edo_empresa?: string;
  fecha_ing_empleo?: string;
  ing_comprobable?: number;
  ing_no_comprobable?: number;
  dependientes?: number;
  ing_fam_aporta?: boolean;
  num_aportan?: number;
  aportante_nombre?: string;
  aportante_apellido_p?: string;
  aportante_apellido_m?: string;
  aportante_parentesco?: string;
  aportante_telefono?: string;
  aportante_empresa?: string;
  aportante_ingreso?: number;
}

export interface ReferenciasPersonalesDto {
  per1_nombre?: string;
  per1_apellido_p?: string;
  per1_apellido_m?: string;
  per1_relacion?: string;
  per1_telefono?: string;
  per2_nombre?: string;
  per2_apellido_p?: string;
  per2_apellido_m?: string;
  per2_relacion?: string;
  per2_telefono?: string;
  fam1_nombre?: string;
  fam1_apellido_p?: string;
  fam1_apellido_m?: string;
  fam1_relacion?: string;
  fam1_telefono?: string;
  fam2_nombre?: string;
  fam2_apellido_p?: string;
  fam2_apellido_m?: string;
  fam2_relacion?: string;
  fam2_telefono?: string;
}

export interface PersonaMoralDto {
  razon_social?: string;
  dominio?: string;
  ing_mensual?: number;
  ref_ubi?: string;
  notario_nombre?: string;
  notario_apellido_p?: string;
  notario_apellido_m?: string;
  escritura_num?: string;
  fecha_const?: string;
  notario_num?: number;
  ciudad_reg?: string;
  estado_reg?: string;
  reg_num?: string;
  apoderado_nombre?: string;
  apoderado_apellido_p?: string;
  apoderado_apellido_m?: string;
  apoderado_sexo?: string;
  apoderado_tel?: string;
  apoderado_ext?: string;
  apoderado_email?: string;
  apoderado_facultades?: boolean;
  apo_escritura_num?: string;
  apo_notario_num?: number;
  apo_fecha_escritura?: string;
  apo_reg_num?: string;
  apo_ciudad_reg?: string;
  apo_estado_reg?: string;
  apo_fecha_inscripcion?: string;
  apo_tipo_rep?: string;
}

export interface ReferenciasComercialesDto {
  c1_empresa?: string;
  c1_contacto?: string;
  c1_tel?: string;
  c2_empresa?: string;
  c2_contacto?: string;
  c2_tel?: string;
  c3_empresa?: string;
  c3_contacto?: string;
  c3_tel?: string;
}

export interface UsoPropiedadDto {
  tipo_inm?: string;
  giro_neg?: string;
  exp_giro?: string;
  propositos?: string;
  sustituye_dom?: boolean;
  ant_calle?: string;
  ant_num_ext?: string;
  ant_num_int?: string;
  ant_cp?: string;
  ant_colonia?: string;
  ant_del_mun?: string;
  ant_estado?: string;
  motivo_cambio?: string;
}

export interface CreateTenantDto {
  tipo_persona: TipoPersona;
  email?: string;
  rfc?: string;
  tel_cel?: string;
  tel_fijo?: string;
  id_tipo?: string;
  dom_calle?: string;
  dom_num_ext?: string;
  dom_num_int?: string;
  dom_cp?: string;
  dom_colonia?: string;
  dom_municipio?: string;
  dom_estado?: string;
  sit_hab?: string;
  arr_act_nombre?: string;
  arr_act_apellido_p?: string;
  arr_act_apellido_m?: string;
  arr_act_tel?: string;
  arr_act_renta?: number;
  arr_act_ano?: number;
  pf_datos?: PersonaFisicaDto;
  pf_empleo_ingresos?: EmpleoIngresosDto;
  pm_datos?: PersonaMoralDto;
  uso_propiedad?: UsoPropiedadDto;
  pf_referencias?: ReferenciasPersonalesDto;
  pm_referencias?: ReferenciasComercialesDto;
}

// TIPO UNIFICADO PARA FORMULARIOS 
export interface TenantFormData {
  tipo_persona: TipoPersona;
  // Datos Comunes
  email?: string;
  rfc?: string;
  tel_cel?: string;
  tel_fijo?: string;
  id_tipo?: string;
  dom_calle?: string;
  dom_num_ext?: string;
  dom_num_int?: string;
  dom_cp?: string;
  dom_colonia?: string;
  dom_municipio?: string;
  dom_estado?: string;
  sit_hab?: string;
  arr_act_nombre?: string;
  arr_act_apellido_p?: string;
  arr_act_apellido_m?: string;
  arr_act_tel?: string;
  arr_act_renta?: number;
  arr_act_ano?: number;
  // Datos PF
  pf_nombres?: string;
  pf_apellido_p?: string;
  pf_apellido_m?: string;
  pf_nacionalidad?: string;
  pf_sexo?: string;
  pf_edo_civil?: string;
  pf_fecha_nac?: string;
  pf_curp?: string;
  pf_datos_conyuge?: string;
  // Empleo e Ingresos PF
  pf_profesion?: string;
  pf_tipo_empleo?: string;
  pf_nom_empresa?: string;
  pf_tel_empleo?: string;
  pf_ext_empleo?: string;
  pf_calle_empresa?: string;
  pf_num_ext_empresa?: string;
  pf_num_int_empresa?: string;
  pf_cp_empresa?: string;
  pf_col_empresa?: string;
  pf_mun_empresa?: string;
  pf_edo_empresa?: string;
  pf_fecha_ing_empleo?: string;
  pf_ing_comprobable?: number;
  pf_ing_no_comprobable?: number;
  pf_dependientes?: number;
  pf_ing_fam_aporta?: boolean;
  pf_num_aportan?: number;
  pf_aportante_nombre?: string;
  pf_aportante_apellido_p?: string;
  pf_aportante_apellido_m?: string;
  pf_aportante_parentesco?: string;
  pf_aportante_telefono?: string;
  pf_aportante_empresa?: string;
  pf_aportante_ingreso?: number;
  // Referencias PF
  pf_per1_nombre?: string;
  pf_per1_apellido_p?: string;
  pf_per1_apellido_m?: string;
  pf_per1_relacion?: string;
  pf_per1_telefono?: string;
  pf_per2_nombre?: string;
  pf_per2_apellido_p?: string;
  pf_per2_apellido_m?: string;
  pf_per2_relacion?: string;
  pf_per2_telefono?: string;
  pf_fam1_nombre?: string;
  pf_fam1_apellido_p?: string;
  pf_fam1_apellido_m?: string;
  pf_fam1_relacion?: string;
  pf_fam1_telefono?: string;
  pf_fam2_nombre?: string;
  pf_fam2_apellido_p?: string;
  pf_fam2_apellido_m?: string;
  pf_fam2_relacion?: string;
  pf_fam2_telefono?: string;
  // Datos PM
  pm_razon_social?: string;
  pm_dominio?: string;
  pm_ing_mensual?: number;
  pm_ref_ubi?: string;
  pm_notario_nombre?: string;
  pm_notario_apellido_p?: string;
  pm_notario_apellido_m?: string;
  pm_escritura_num?: string;
  pm_fecha_const?: string;
  pm_notario_num?: number;
  pm_ciudad_reg?: string;
  pm_estado_reg?: string;
  pm_reg_num?: string;
  pm_apoderado_nombre?: string;
  pm_apoderado_apellido_p?: string;
  pm_apoderado_apellido_m?: string;
  pm_apoderado_sexo?: string;
  pm_apoderado_tel?: string;
  pm_apoderado_ext?: string;
  pm_apoderado_email?: string;
  pm_apoderado_facultades?: boolean;
  pm_apo_escritura_num?: string;
  pm_apo_notario_num?: number;
  pm_apo_fecha_escritura?: string;
  pm_apo_reg_num?: string;
  pm_apo_ciudad_reg?: string;
  pm_apo_estado_reg?: string;
  pm_apo_fecha_inscripcion?: string;
  pm_apo_tipo_rep?: string;
  // Referencias PM
  pm_c1_empresa?: string;
  pm_c1_contacto?: string;
  pm_c1_tel?: string;
  pm_c2_empresa?: string;
  pm_c2_contacto?: string;
  pm_c2_tel?: string;
  pm_c3_empresa?: string;
  pm_c3_contacto?: string;
  pm_c3_tel?: string;
  // Uso de Propiedad
  uso_tipo_inm?: string;
  uso_giro_neg?: string;
  uso_exp_giro?: string;
  uso_propositos?: string;
  uso_sustituye_dom?: boolean;
  uso_ant_calle?: string;
  uso_ant_num_ext?: string;
  uso_ant_num_int?: string;
  uso_ant_cp?: string;
  uso_ant_colonia?: string;
  uso_ant_del_mun?: string;
  uso_ant_estado?: string;
  uso_motivo_cambio?: string;
}

// FUNCIONES DE TRANSFORMACIÓN
export function tenantEntityToFormData(tenant: TenantEntity): TenantFormData {
  const formData: TenantFormData = {
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
    arr_act_renta: tenant.arr_act_renta,
    arr_act_ano: tenant.arr_act_ano,
  };

  // Mapear datos de Persona Física
  if (tenant.pf) {
    formData.pf_nombres = tenant.pf.nombres;
    formData.pf_apellido_p = tenant.pf.apellido_p;
    formData.pf_apellido_m = tenant.pf.apellido_m;
    formData.pf_nacionalidad = tenant.pf.nacionalidad;
    formData.pf_sexo = tenant.pf.sexo;
    formData.pf_edo_civil = tenant.pf.edo_civil;
    formData.pf_fecha_nac = tenant.pf.fecha_nac
      ? new Date(tenant.pf.fecha_nac).toISOString().split("T")[0]
      : undefined;
    formData.pf_curp = tenant.pf.curp;
    formData.pf_datos_conyuge = tenant.pf.datos_conyuge;
    // Empleo
    formData.pf_profesion = tenant.pf.profesion;
    formData.pf_tipo_empleo = tenant.pf.tipo_empleo;
    formData.pf_nom_empresa = tenant.pf.nom_empresa;
    formData.pf_tel_empleo = tenant.pf.tel_empleo;
    formData.pf_ext_empleo = tenant.pf.ext_empleo;
    formData.pf_calle_empresa = tenant.pf.calle_empresa;
    formData.pf_num_ext_empresa = tenant.pf.num_ext_empresa;
    formData.pf_num_int_empresa = tenant.pf.num_int_empresa;
    formData.pf_cp_empresa = tenant.pf.cp_empresa;
    formData.pf_col_empresa = tenant.pf.col_empresa;
    formData.pf_mun_empresa = tenant.pf.mun_empresa;
    formData.pf_edo_empresa = tenant.pf.edo_empresa;
    formData.pf_fecha_ing_empleo = tenant.pf.fecha_ing_empleo
      ? new Date(tenant.pf.fecha_ing_empleo).toISOString().split("T")[0]
      : undefined;
    formData.pf_ing_comprobable = tenant.pf.ing_comprobable;
    formData.pf_ing_no_comprobable = tenant.pf.ing_no_comprobable;
    formData.pf_dependientes = tenant.pf.dependientes;
    formData.pf_ing_fam_aporta = tenant.pf.ing_fam_aporta;
    formData.pf_num_aportan = tenant.pf.num_aportan;
    formData.pf_aportante_nombre = tenant.pf.aportante_nombre;
    formData.pf_aportante_apellido_p = tenant.pf.aportante_apellido_p;
    formData.pf_aportante_apellido_m = tenant.pf.aportante_apellido_m;
    formData.pf_aportante_parentesco = tenant.pf.aportante_parentesco;
    formData.pf_aportante_telefono = tenant.pf.aportante_telefono;
    formData.pf_aportante_empresa = tenant.pf.aportante_empresa;
    formData.pf_aportante_ingreso = tenant.pf.aportante_ingreso;
    // Referencias
    formData.pf_per1_nombre = tenant.pf.ref_per1_nombre;
    formData.pf_per1_apellido_p = tenant.pf.ref_per1_apellido_p;
    formData.pf_per1_apellido_m = tenant.pf.ref_per1_apellido_m;
    formData.pf_per1_relacion = tenant.pf.ref_per1_relacion;
    formData.pf_per1_telefono = tenant.pf.ref_per1_telefono;
    formData.pf_per2_nombre = tenant.pf.ref_per2_nombre;
    formData.pf_per2_apellido_p = tenant.pf.ref_per2_apellido_p;
    formData.pf_per2_apellido_m = tenant.pf.ref_per2_apellido_m;
    formData.pf_per2_relacion = tenant.pf.ref_per2_relacion;
    formData.pf_per2_telefono = tenant.pf.ref_per2_telefono;
    formData.pf_fam1_nombre = tenant.pf.ref_fam1_nombre;
    formData.pf_fam1_apellido_p = tenant.pf.ref_fam1_apellido_p;
    formData.pf_fam1_apellido_m = tenant.pf.ref_fam1_apellido_m;
    formData.pf_fam1_relacion = tenant.pf.ref_fam1_relacion;
    formData.pf_fam1_telefono = tenant.pf.ref_fam1_telefono;
    formData.pf_fam2_nombre = tenant.pf.ref_fam2_nombre;
    formData.pf_fam2_apellido_p = tenant.pf.ref_fam2_apellido_p;
    formData.pf_fam2_apellido_m = tenant.pf.ref_fam2_apellido_m;
    formData.pf_fam2_relacion = tenant.pf.ref_fam2_relacion;
    formData.pf_fam2_telefono = tenant.pf.ref_fam2_telefono;
  }

  // Mapear datos de Persona Moral
  if (tenant.pm) {
    formData.pm_razon_social = tenant.pm.razon_social;
    formData.pm_dominio = tenant.pm.dominio;
    formData.pm_ing_mensual = tenant.pm.ing_mensual;
    formData.pm_ref_ubi = tenant.pm.ref_ubi;
    formData.pm_notario_nombre = tenant.pm.notario_nombre;
    formData.pm_notario_apellido_p = tenant.pm.notario_apellido_p;
    formData.pm_notario_apellido_m = tenant.pm.notario_apellido_m;
    formData.pm_escritura_num = tenant.pm.escritura_num;
    formData.pm_fecha_const = tenant.pm.fecha_const
      ? new Date(tenant.pm.fecha_const).toISOString().split("T")[0]
      : undefined;
    formData.pm_notario_num = tenant.pm.notario_num;
    formData.pm_ciudad_reg = tenant.pm.ciudad_reg;
    formData.pm_estado_reg = tenant.pm.estado_reg;
    formData.pm_reg_num = tenant.pm.reg_num;
    formData.pm_apoderado_nombre = tenant.pm.apoderado_nombre;
    formData.pm_apoderado_apellido_p = tenant.pm.apoderado_apellido_p;
    formData.pm_apoderado_apellido_m = tenant.pm.apoderado_apellido_m;
    formData.pm_apoderado_sexo = tenant.pm.apoderado_sexo;
    formData.pm_apoderado_tel = tenant.pm.apoderado_tel;
    formData.pm_apoderado_ext = tenant.pm.apoderado_ext;
    formData.pm_apoderado_email = tenant.pm.apoderado_email;
    formData.pm_apoderado_facultades = tenant.pm.apoderado_facultades;
    formData.pm_apo_escritura_num = tenant.pm.apo_escritura_num;
    formData.pm_apo_notario_num = tenant.pm.apo_notario_num;
    formData.pm_apo_fecha_escritura = tenant.pm.apo_fecha_escritura
      ? new Date(tenant.pm.apo_fecha_escritura).toISOString().split("T")[0]
      : undefined;
    formData.pm_apo_reg_num = tenant.pm.apo_reg_num;
    formData.pm_apo_ciudad_reg = tenant.pm.apo_ciudad_reg;
    formData.pm_apo_estado_reg = tenant.pm.apo_estado_reg;
    formData.pm_apo_fecha_inscripcion = tenant.pm.apo_fecha_inscripcion
      ? new Date(tenant.pm.apo_fecha_inscripcion).toISOString().split("T")[0]
      : undefined;
    formData.pm_apo_tipo_rep = tenant.pm.apo_tipo_rep;
    // Referencias comerciales
    formData.pm_c1_empresa = tenant.pm.ref_c1_empresa;
    formData.pm_c1_contacto = tenant.pm.ref_c1_contacto;
    formData.pm_c1_tel = tenant.pm.ref_c1_tel;
    formData.pm_c2_empresa = tenant.pm.ref_c2_empresa;
    formData.pm_c2_contacto = tenant.pm.ref_c2_contacto;
    formData.pm_c2_tel = tenant.pm.ref_c2_tel;
    formData.pm_c3_empresa = tenant.pm.ref_c3_empresa;
    formData.pm_c3_contacto = tenant.pm.ref_c3_contacto;
    formData.pm_c3_tel = tenant.pm.ref_c3_tel;
  }

  // Mapear uso de propiedad
  if (tenant.uso_propiedad) {
    formData.uso_tipo_inm = tenant.uso_propiedad.tipo_inm;
    formData.uso_giro_neg = tenant.uso_propiedad.giro_neg;
    formData.uso_exp_giro = tenant.uso_propiedad.exp_giro;
    formData.uso_propositos = tenant.uso_propiedad.propositos;
    formData.uso_sustituye_dom = tenant.uso_propiedad.sustituye_dom;
    formData.uso_ant_calle = tenant.uso_propiedad.ant_calle;
    formData.uso_ant_num_ext = tenant.uso_propiedad.ant_num_ext;
    formData.uso_ant_num_int = tenant.uso_propiedad.ant_num_int;
    formData.uso_ant_cp = tenant.uso_propiedad.ant_cp;
    formData.uso_ant_colonia = tenant.uso_propiedad.ant_colonia;
    formData.uso_ant_del_mun = tenant.uso_propiedad.ant_del_mun;
    formData.uso_ant_estado = tenant.uso_propiedad.ant_estado;
    formData.uso_motivo_cambio = tenant.uso_propiedad.motivo_cambio;
  }

  return formData;
}

export function formDataToCreateDto(formData: TenantFormData): CreateTenantDto {
  const dto: CreateTenantDto = {
    tipo_persona: formData.tipo_persona,
    email: formData.email,
    rfc: formData.rfc,
    tel_cel: formData.tel_cel,
    tel_fijo: formData.tel_fijo,
    id_tipo: formData.id_tipo,
    dom_calle: formData.dom_calle,
    dom_num_ext: formData.dom_num_ext,
    dom_num_int: formData.dom_num_int,
    dom_cp: formData.dom_cp,
    dom_colonia: formData.dom_colonia,
    dom_municipio: formData.dom_municipio,
    dom_estado: formData.dom_estado,
    sit_hab: formData.sit_hab,
    arr_act_nombre: formData.arr_act_nombre,
    arr_act_apellido_p: formData.arr_act_apellido_p,
    arr_act_apellido_m: formData.arr_act_apellido_m,
    arr_act_tel: formData.arr_act_tel,
    arr_act_renta: formData.arr_act_renta,
    arr_act_ano: formData.arr_act_ano,
  };

  // Datos de Persona Física
  if (formData.tipo_persona === TipoPersona.FISICA) {
    dto.pf_datos = {
      nombres: formData.pf_nombres,
      apellido_p: formData.pf_apellido_p,
      apellido_m: formData.pf_apellido_m,
      nacionalidad: formData.pf_nacionalidad,
      sexo: formData.pf_sexo,
      edo_civil: formData.pf_edo_civil,
      fecha_nac: formData.pf_fecha_nac,
      curp: formData.pf_curp,
      datos_conyuge: formData.pf_datos_conyuge,
    };

    dto.pf_empleo_ingresos = {
      profesion: formData.pf_profesion,
      tipo_empleo: formData.pf_tipo_empleo,
      nom_empresa: formData.pf_nom_empresa,
      tel_empleo: formData.pf_tel_empleo,
      ext_empleo: formData.pf_ext_empleo,
      calle_empresa: formData.pf_calle_empresa,
      num_ext_empresa: formData.pf_num_ext_empresa,
      num_int_empresa: formData.pf_num_int_empresa,
      cp_empresa: formData.pf_cp_empresa,
      col_empresa: formData.pf_col_empresa,
      mun_empresa: formData.pf_mun_empresa,
      edo_empresa: formData.pf_edo_empresa,
      fecha_ing_empleo: formData.pf_fecha_ing_empleo,
      ing_comprobable: formData.pf_ing_comprobable,
      ing_no_comprobable: formData.pf_ing_no_comprobable,
      dependientes: formData.pf_dependientes,
      ing_fam_aporta: formData.pf_ing_fam_aporta,
      num_aportan: formData.pf_num_aportan,
      aportante_nombre: formData.pf_aportante_nombre,
      aportante_apellido_p: formData.pf_aportante_apellido_p,
      aportante_apellido_m: formData.pf_aportante_apellido_m,
      aportante_parentesco: formData.pf_aportante_parentesco,
      aportante_telefono: formData.pf_aportante_telefono,
      aportante_empresa: formData.pf_aportante_empresa,
      aportante_ingreso: formData.pf_aportante_ingreso,
    };

    dto.pf_referencias = {
      per1_nombre: formData.pf_per1_nombre,
      per1_apellido_p: formData.pf_per1_apellido_p,
      per1_apellido_m: formData.pf_per1_apellido_m,
      per1_relacion: formData.pf_per1_relacion,
      per1_telefono: formData.pf_per1_telefono,
      per2_nombre: formData.pf_per2_nombre,
      per2_apellido_p: formData.pf_per2_apellido_p,
      per2_apellido_m: formData.pf_per2_apellido_m,
      per2_relacion: formData.pf_per2_relacion,
      per2_telefono: formData.pf_per2_telefono,
      fam1_nombre: formData.pf_fam1_nombre,
      fam1_apellido_p: formData.pf_fam1_apellido_p,
      fam1_apellido_m: formData.pf_fam1_apellido_m,
      fam1_relacion: formData.pf_fam1_relacion,
      fam1_telefono: formData.pf_fam1_telefono,
      fam2_nombre: formData.pf_fam2_nombre,
      fam2_apellido_p: formData.pf_fam2_apellido_p,
      fam2_apellido_m: formData.pf_fam2_apellido_m,
      fam2_relacion: formData.pf_fam2_relacion,
      fam2_telefono: formData.pf_fam2_telefono,
    };
  }

  // Datos de Persona Moral
  if (formData.tipo_persona === TipoPersona.MORAL) {
    dto.pm_datos = {
      razon_social: formData.pm_razon_social,
      dominio: formData.pm_dominio,
      ing_mensual: formData.pm_ing_mensual,
      ref_ubi: formData.pm_ref_ubi,
      notario_nombre: formData.pm_notario_nombre,
      notario_apellido_p: formData.pm_notario_apellido_p,
      notario_apellido_m: formData.pm_notario_apellido_m,
      escritura_num: formData.pm_escritura_num,
      fecha_const: formData.pm_fecha_const,
      notario_num: formData.pm_notario_num,
      ciudad_reg: formData.pm_ciudad_reg,
      estado_reg: formData.pm_estado_reg,
      reg_num: formData.pm_reg_num,
      apoderado_nombre: formData.pm_apoderado_nombre,
      apoderado_apellido_p: formData.pm_apoderado_apellido_p,
      apoderado_apellido_m: formData.pm_apoderado_apellido_m,
      apoderado_sexo: formData.pm_apoderado_sexo,
      apoderado_tel: formData.pm_apoderado_tel,
      apoderado_ext: formData.pm_apoderado_ext,
      apoderado_email: formData.pm_apoderado_email,
      apoderado_facultades: formData.pm_apoderado_facultades,
      apo_escritura_num: formData.pm_apo_escritura_num,
      apo_notario_num: formData.pm_apo_notario_num,
      apo_fecha_escritura: formData.pm_apo_fecha_escritura,
      apo_reg_num: formData.pm_apo_reg_num,
      apo_ciudad_reg: formData.pm_apo_ciudad_reg,
      apo_estado_reg: formData.pm_apo_estado_reg,
      apo_fecha_inscripcion: formData.pm_apo_fecha_inscripcion,
      apo_tipo_rep: formData.pm_apo_tipo_rep,
    };

    dto.pm_referencias = {
      c1_empresa: formData.pm_c1_empresa,
      c1_contacto: formData.pm_c1_contacto,
      c1_tel: formData.pm_c1_tel,
      c2_empresa: formData.pm_c2_empresa,
      c2_contacto: formData.pm_c2_contacto,
      c2_tel: formData.pm_c2_tel,
      c3_empresa: formData.pm_c3_empresa,
      c3_contacto: formData.pm_c3_contacto,
      c3_tel: formData.pm_c3_tel,
    };
  }

  // Uso de Propiedad (común para ambos)
  dto.uso_propiedad = {
    tipo_inm: formData.uso_tipo_inm,
    giro_neg: formData.uso_giro_neg,
    exp_giro: formData.uso_exp_giro,
    propositos: formData.uso_propositos,
    sustituye_dom: formData.uso_sustituye_dom,
    ant_calle: formData.uso_ant_calle,
    ant_num_ext: formData.uso_ant_num_ext,
    ant_num_int: formData.uso_ant_num_int,
    ant_cp: formData.uso_ant_cp,
    ant_colonia: formData.uso_ant_colonia,
    ant_del_mun: formData.uso_ant_del_mun,
    ant_estado: formData.uso_ant_estado,
    motivo_cambio: formData.uso_motivo_cambio,
  };

  return dto;
}

// Transformar datos del formulario en estructura para solicitud de alquiler
export function formDataToRentalRequest(
  formData: TenantFormData,
  usuarioCreacion: string
): any {
  const baseRental = {
    tipoInquilino:
      formData.tipo_persona === TipoPersona.FISICA ? "fisica" : "moral",
    tipoPropietario: "fisica", // Por defecto
    tipoPropiedad: formData.uso_tipo_inm || "casa",
    observaciones: "Creado desde formulario manual",
    usuarioCreacion: usuarioCreacion,
  };

  if (formData.tipo_persona === TipoPersona.FISICA) {
    return {
      ...baseRental,
      inquilinoPf: {
        // Datos Personales
        nombres: formData.pf_nombres,
        apellidoPaterno: formData.pf_apellido_p,
        apellidoMaterno: formData.pf_apellido_m,
        nacionalidad: formData.pf_nacionalidad,
        sexo: formData.pf_sexo,
        estadoCivil: formData.pf_edo_civil,
        email: formData.email,
        tipoIdentificacion: formData.id_tipo,
        fechaNacimiento: formData.pf_fecha_nac,
        rfc: formData.rfc,
        curp: formData.pf_curp,
        telefonoCelular: formData.tel_cel,
        telefonoFijo: formData.tel_fijo,

        // Domicilio Actual
        domCalle: formData.dom_calle,
        domNumExt: formData.dom_num_ext,
        domNumInt: formData.dom_num_int,
        domCp: formData.dom_cp,
        domColonia: formData.dom_colonia,
        domMunicipio: formData.dom_municipio,
        domEstado: formData.dom_estado,
        situacionHabitacional: formData.sit_hab,

        // Datos del Arrendador Actual
        arrActNombre: formData.arr_act_nombre,
        arrActApellidoP: formData.arr_act_apellido_p,
        arrActApellidoM: formData.arr_act_apellido_m,
        arrActTel: formData.arr_act_tel,
        arrActRenta: formData.arr_act_renta,
        arrActAno: formData.arr_act_ano,

        // Empleo e Ingresos
        profesion: formData.pf_profesion,
        tipoEmpleo: formData.pf_tipo_empleo,
        nomEmpresa: formData.pf_nom_empresa,
        fechaIngEmpleo: formData.pf_fecha_ing_empleo,
        ingComprobable: formData.pf_ing_comprobable,
        ingNoComprobable: formData.pf_ing_no_comprobable,
      },
      // Propiedad básica (se puede completar después)
      propiedad: {
        tipoPropiedad: formData.uso_tipo_inm || "casa",
        domCalle: "Por definir",
        domNumExt: "0",
        domCp: "00000",
        domColonia: "Por definir",
        domMunicipio: "Por definir",
        domEstado: "Por definir",
        precioRenta: 0,
      },
    };
  } else {
    return {
      ...baseRental,
      inquilinoPm: {
        // Datos de la Empresa
        razonSocial: formData.pm_razon_social,
        email: formData.email,
        dominio: formData.pm_dominio,
        rfc: formData.rfc,
        telefono: formData.tel_cel,
        ingMensual: formData.pm_ing_mensual,

        // Domicilio de la Empresa
        domCalle: formData.dom_calle,
        domNumExt: formData.dom_num_ext,
        domNumInt: formData.dom_num_int,
        domCp: formData.dom_cp,
        domColonia: formData.dom_colonia,
        domMunicipio: formData.dom_municipio,
        domEstado: formData.dom_estado,

        // Acta Constitutiva
        notarioNombre: formData.pm_notario_nombre,
        notarioApellidoP: formData.pm_notario_apellido_p,
        notarioApellidoM: formData.pm_notario_apellido_m,
        escrituraNum: formData.pm_escritura_num,
        fechaConst: formData.pm_fecha_const,
        notarioNum: formData.pm_notario_num,
        ciudadReg: formData.pm_ciudad_reg,
        estadoReg: formData.pm_estado_reg,
        regNum: formData.pm_reg_num,
        giroComercial: formData.uso_giro_neg,
      },
      // Propiedad básica
      propiedad: {
        tipoPropiedad: formData.uso_tipo_inm || "local_comercial",
        domCalle: "Por definir",
        domNumExt: "0",
        domCp: "00000",
        domColonia: "Por definir",
        domMunicipio: "Por definir",
        domEstado: "Por definir",
        precioRenta: 0,
      },
    };
  }
}

// Transformar datos del formulario en estructura para alquiler manual con datos completos
export function formDataToManualRental(
  formData: TenantFormData,
  usuarioCreacion: string
): any {
  const baseRental = {
    tipoInquilino:
      formData.tipo_persona === TipoPersona.FISICA ? "fisica" : "moral",
    tipoPropietario: "fisica" as const,
    tipoPropiedad: mapTipoPropiedad(formData.uso_tipo_inm),
    observaciones: "Creado desde formulario manual",
    usuarioCreacion: usuarioCreacion,
  };

  const propiedadBasica = {
    tipoPropiedad: mapTipoPropiedad(formData.uso_tipo_inm),
    domCalle: "Por definir",
    domNumExt: "S/N",
    domCp: "00000",
    domColonia: "Por definir",
    domMunicipio: "Por definir",
    domEstado: "Por definir",
    precioRenta: 0,
    usoSuelo: "habitacional" as const,
    permiteMascotas: false,
    ivaRenta: "incluido" as const,
    frecuenciaPago: "mensual" as const,
    condicionesPago: "Por definir",
    depositoGarantia: 0,
    pagaMantenimiento: false,
    requiereSeguro: false,
  };

  if (formData.tipo_persona === TipoPersona.FISICA) {
    return {
      ...baseRental,
      inquilinoPf: {
        // ESTRUCTURA ANIDADA QUE ESPERA EL BACKEND
        datosPersonales: {
          nombres: formData.pf_nombres || "",
          apellidoPaterno: formData.pf_apellido_p || "",
          apellidoMaterno: formData.pf_apellido_m || "",
          nacionalidad: mapNacionalidad(formData.pf_nacionalidad),
          nacionalidadEspecifique:
            formData.pf_nacionalidad === "Otra"
              ? formData.pf_nacionalidad
              : undefined,
          sexo: mapSexo(formData.pf_sexo),
          estadoCivil: mapEstadoCivil(formData.pf_edo_civil),
          email: formData.email || "",
          tipoIdentificacion: mapTipoIdentificacion(formData.id_tipo),
          fechaNacimiento: formData.pf_fecha_nac
            ? new Date(formData.pf_fecha_nac)
            : new Date("2000-01-01"),
          rfc: formData.rfc || "",
          curp: formData.pf_curp || "",
          telefonoCelular: formData.tel_cel || "",
          telefonoFijo: formData.tel_fijo || "",
        },

        domicilioActual: {
          domCalle: formData.dom_calle || "",
          domNumExt: formData.dom_num_ext || "",
          domNumInt: formData.dom_num_int || "",
          domCp: formData.dom_cp || "",
          domColonia: formData.dom_colonia || "",
          domMunicipio: formData.dom_municipio || "",
          domEstado: formData.dom_estado || "",
          domReferencias: formData.pm_ref_ubi || "",
        },

        situacionHabitacional: mapSituacionHabitacional(formData.sit_hab),

        // Arrendador actual (si aplica)
        ...(formData.sit_hab === "Inquilino" && {
          arrendadorActual: {
            nombres: formData.arr_act_nombre || "",
            apellidoPaterno: formData.arr_act_apellido_p || "",
            apellidoMaterno: formData.arr_act_apellido_m || "",
            telefono: formData.arr_act_tel || "",
            rentaActual: formData.arr_act_renta || 0,
            ocupaDesde: formData.arr_act_ano?.toString() || "",
          },
        }),

        empleo: {
          profesion: formData.pf_profesion || "",
          tipoEmpleo: mapTipoEmpleo(formData.pf_tipo_empleo),
          empresaTrabaja: formData.pf_nom_empresa || "",
          fechaIngreso: formData.pf_fecha_ing_empleo
            ? new Date(formData.pf_fecha_ing_empleo)
            : new Date(),
          ingresoComprobable: formData.pf_ing_comprobable || 0,
          ingresoNoComprobable: formData.pf_ing_no_comprobable || 0,
        },

        ingresos: {
          ingresoComprobable: formData.pf_ing_comprobable || 0,
          ingresoNoComprobable: formData.pf_ing_no_comprobable || 0,
          numeroDependientes: formData.pf_dependientes || 0,
          otraPersonaAporta: formData.pf_ing_fam_aporta || false,
        },

        // Datos del cónyuge (si aplica)
        ...(formData.pf_edo_civil === "Casado" && {
          conyuge: {
            nombres: formData.pf_datos_conyuge || "",
            apellidoPaterno: formData.pf_apellido_p || "",
            apellidoMaterno: formData.pf_apellido_m || "",
            telefono: formData.tel_fijo || "",
          },
        }),
      },
      propiedad: propiedadBasica,

      propietarioPf: {
        datosPersonales: {
          nombres: "Por definir",
          apellidoPaterno: "Por definir",
          apellidoMaterno: "Por definir",
          email: "propietario@example.com",
          telefonoCelular: "0000000000",
          estadoCivil: "soltero",
          sexo: "masculino",
          nacionalidad: "mexicana",
          tipoIdentificacion: "ine",
          fechaNacimiento: new Date("2000-01-01"),
        },
        domicilioActual: {
          domCalle: "Por definir",
          domNumExt: "S/N",
          domCp: "00000",
          domColonia: "Por definir",
          domMunicipio: "Por definir",
          domEstado: "Por definir",
        },
        formaPago: "transferencia",
      },
    };
  } else {
    // PERSONA MORAL
    return {
      ...baseRental,
      inquilinoPm: {
        // DATOS DE LA EMPRESA (OBLIGATORIOS)
        nombreEmpresa: formData.pm_razon_social || "EMPRESA POR DEFINIR",
        email: formData.email || "info@empresa.com",
        dominio: formData.pm_dominio || "",
        rfc: formData.rfc || "XAXX010101000",
        telefono: formData.tel_cel || "0000000000",
        ingresoMensual: formData.pm_ing_mensual || 0,

        // DOMICILIO DE LA EMPRESA (OBLIGATORIOS)
        domCalle: formData.dom_calle || "POR DEFINIR",
        domNumExt: formData.dom_num_ext || "S/N",
        domNumInt: formData.dom_num_int || "",
        domCp: formData.dom_cp || "00000",
        domColonia: formData.dom_colonia || "POR DEFINIR",
        domMunicipio: formData.dom_municipio || "POR DEFINIR",
        domEstado: formData.dom_estado || "POR DEFINIR",

        // ACTA CONSTITUTIVA (TODOS OBLIGATORIOS)
        notarioNombres: formData.pm_notario_nombre || "NOTARIO POR DEFINIR",
        notarioApellidoPaterno:
          formData.pm_notario_apellido_p || "APELLIDO PATERNO",
        notarioApellidoMaterno:
          formData.pm_notario_apellido_m || "APELLIDO MATERNO",
        numeroEscritura: formData.pm_escritura_num || "NUMERO ESCRITURA",
        fechaConstitucion: formData.pm_fecha_const
          ? new Date(formData.pm_fecha_const)
          : new Date("2000-01-01"),
        notarioNumero: (formData.pm_notario_num ?? 1).toString(),
        ciudadRegistro: formData.pm_ciudad_reg || "CIUDAD REGISTRO",
        estadoRegistro: formData.pm_estado_reg || "ESTADO REGISTRO",
        numeroRegistro: formData.pm_reg_num || "NUMERO REGISTRO",
        giroComercial: formData.uso_giro_neg || "GIRO COMERCIAL",
      },
      propiedad: {
        ...propiedadBasica,
        tipoPropiedad: mapTipoPropiedad(formData.uso_tipo_inm),
        usoSuelo: "comercial" as const,
      },

      propietarioPm: {
        nombreEmpresa: "PROPIETARIO POR DEFINIR",
        rfc: "XXX010101XXX",
        email: "propietario@example.com",
        telefono: "0000000000",
        domCalle: "POR DEFINIR",
        domNumExt: "S/N",
        domCp: "00000",
        domColonia: "POR DEFINIR",
        domMunicipio: "POR DEFINIR",
        domEstado: "POR DEFINIR",
        formaPago: "transferencia",
        notarioNombres: "NOTARIO POR DEFINIR",
        notarioApellidoPaterno: "APELLIDO PATERNO",
        notarioApellidoMaterno: "APELLIDO MATERNO",
        numeroEscritura: "NUMERO ESCRITURA",
        fechaConstitucion: new Date("2000-01-01"),
        notarioNumero: "1",
        ciudadRegistro: "CIUDAD REGISTRO",
        estadoRegistro: "ESTADO REGISTRO",
        numeroRegistro: "NUMERO REGISTRO",
        giroComercial: "GIRO COMERCIAL",
      },
    };
  }
}

function mapTipoPropiedad(
  tipo?: string
):
  | "casa"
  | "departamento"
  | "local_comercial"
  | "oficina"
  | "bodega"
  | "nave_industrial"
  | "consultorio"
  | "terreno" {
  if (!tipo) return "casa";

  const map: Record<
    string,
    | "casa"
    | "departamento"
    | "local_comercial"
    | "oficina"
    | "bodega"
    | "nave_industrial"
    | "consultorio"
    | "terreno"
  > = {
    Casa: "casa",
    casa: "casa",
    Departamento: "departamento",
    departamento: "departamento",
    "Local Comercial": "local_comercial",
    Local: "local_comercial",
    local_comercial: "local_comercial",
    Oficina: "oficina",
    oficina: "oficina",
    Bodega: "bodega",
    bodega: "bodega",
    "Nave Industrial": "nave_industrial",
    Nave: "nave_industrial",
    nave_industrial: "nave_industrial",
    Consultorio: "consultorio",
    consultorio: "consultorio",
    Terreno: "terreno",
    terreno: "terreno",
  };

  return map[tipo] || "casa";
}

// Funciones auxiliares para mapear valores aceptan string | undefined
function mapNacionalidad(nacionalidad?: string): "mexicana" | "extranjera" {
  if (!nacionalidad) return "mexicana";

  const map: Record<string, "mexicana" | "extranjera"> = {
    Mexicana: "mexicana",
    mexicana: "mexicana",
    Otra: "extranjera",
    extranjera: "extranjera",
  };
  return map[nacionalidad] || "mexicana";
}

function mapSexo(sexo?: string): "masculino" | "femenino" {
  if (!sexo) return "masculino";

  const map: Record<string, "masculino" | "femenino"> = {
    Masculino: "masculino",
    masculino: "masculino",
    Femenino: "femenino",
    femenino: "femenino",
  };
  return map[sexo] || "masculino";
}

function mapEstadoCivil(
  estadoCivil?: string
): "soltero" | "casado" | "divorciado" | "union_libre" {
  if (!estadoCivil) return "soltero";

  const map: Record<
    string,
    "soltero" | "casado" | "divorciado" | "union_libre"
  > = {
    Soltero: "soltero",
    soltero: "soltero",
    Casado: "casado",
    casado: "casado",
    Divorciado: "divorciado",
    divorciado: "divorciado",
    "Union Libre": "union_libre",
    union_libre: "union_libre",
  };
  return map[estadoCivil] || "soltero";
}

function mapTipoIdentificacion(
  tipo?: string
): "ine" | "pasaporte" | "cedula" | "licencia" | "otro" {
  if (!tipo) return "ine";

  const map: Record<
    string,
    "ine" | "pasaporte" | "cedula" | "licencia" | "otro"
  > = {
    INE: "ine",
    Pasaporte: "pasaporte",
    Licencia: "licencia",
    Otro: "otro",
  };
  return map[tipo] || "ine";
}

function mapSituacionHabitacional(
  sit?: string
):
  | "inquilino"
  | "pension_hotel"
  | "con_familia"
  | "propietario_pagando"
  | "propietario_liberado" {
  if (!sit) return "con_familia";

  const map: Record<
    string,
    | "inquilino"
    | "pension_hotel"
    | "con_familia"
    | "propietario_pagando"
    | "propietario_liberado"
  > = {
    Inquilino: "inquilino",
    Propietario: "propietario_liberado",
    Familiar: "con_familia",
    Otro: "con_familia",
  };
  return map[sit] || "con_familia";
}

function mapTipoEmpleo(
  tipo?: string
):
  | "dueño_negocio"
  | "empresario"
  | "independiente"
  | "empleado"
  | "comisionista"
  | "jubilado" {
  if (!tipo) return "empleado";

  const map: Record<
    string,
    | "dueño_negocio"
    | "empresario"
    | "independiente"
    | "empleado"
    | "comisionista"
    | "jubilado"
  > = {
    Empleado: "empleado",
    Independiente: "independiente",
    Empresario: "empresario",
    "Dueño de negocio": "dueño_negocio",
    Comisionista: "comisionista",
    Jubilado: "jubilado",
  };
  return map[tipo] || "empleado";
}
