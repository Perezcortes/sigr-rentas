// modules/rentas/types.ts 

export type RentalStatus = "apartada" | "en_proceso" | "rentada" | "aprobada" | "cancelada" | "rechazada" | "rescindida"

export type PersonType = "fisica" | "moral"

// DATOS DE EMPLEO E INGRESOS (Persona Física)
export interface EmpleoIngresos {
  profesion?: string | null
  tipo_empleo?: string | null
  nom_empresa?: string | null
  tel_empleo?: string | null
  ext_empleo?: string | null
  calle_empresa?: string | null
  num_ext_empresa?: string | null
  num_int_empresa?: string | null
  cp_empresa?: string | null
  col_empresa?: string | null
  mun_empresa?: string | null
  edo_empresa?: string | null
  fecha_ing_empleo?: string | null
  ing_comprobable?: number | null
  ing_no_comprobable?: number | null
  dependientes?: number | null
  ing_fam_aporta?: boolean | null
  num_aportan?: number | null
  aportante_nombre?: string | null
  aportante_apellido_p?: string | null
  aportante_apellido_m?: string | null
  aportante_parentesco?: string | null
  aportante_telefono?: string | null
  aportante_empresa?: string | null
  aportante_ingreso?: number | null
}

// REFERENCIAS PERSONALES (Persona Física)
export interface ReferenciasPersonales {
  per1_nombre?: string | null
  per1_apellido_p?: string | null
  per1_apellido_m?: string | null
  per1_relacion?: string | null
  per1_telefono?: string | null
  per2_nombre?: string | null
  per2_apellido_p?: string | null
  per2_apellido_m?: string | null
  per2_relacion?: string | null
  per2_telefono?: string | null
  fam1_nombre?: string | null
  fam1_apellido_p?: string | null
  fam1_apellido_m?: string | null
  fam1_relacion?: string | null
  fam1_telefono?: string | null
  fam2_nombre?: string | null
  fam2_apellido_p?: string | null
  fam2_apellido_m?: string | null
  fam2_relacion?: string | null
  fam2_telefono?: string | null
}

// DATOS DE PERSONA MORAL
export interface PersonaMoralDatos {
  razon_social?: string | null
  dominio?: string | null
  ing_mensual?: number | null
  ref_ubi?: string | null
  
  // Notario y constitución
  notario_nombre?: string | null
  notario_apellido_p?: string | null
  notario_apellido_m?: string | null
  escritura_num?: string | null
  fecha_const?: string | null
  notario_num?: string | null
  ciudad_reg?: string | null
  estado_reg?: string | null
  reg_num?: string | null
  
  // Apoderado legal
  apoderado_nombre?: string | null
  apoderado_apellido_p?: string | null
  apoderado_apellido_m?: string | null
  apoderado_sexo?: string | null
  apoderado_tel?: string | null
  apoderado_ext?: string | null
  apoderado_email?: string | null
  apoderado_facultades?: string | null
  
  // Datos del poder
  apo_escritura_num?: string | null
  apo_notario_num?: string | null
  apo_fecha_escritura?: string | null
  apo_reg_num?: string | null
  apo_ciudad_reg?: string | null
  apo_estado_reg?: string | null
  apo_fecha_inscripcion?: string | null
  apo_tipo_rep?: string | null
}

// REFERENCIAS COMERCIALES (Persona Moral)
export interface ReferenciasComerciales {
  c1_empresa?: string | null
  c1_contacto?: string | null
  c1_tel?: string | null
  c2_empresa?: string | null
  c2_contacto?: string | null
  c2_tel?: string | null
  c3_empresa?: string | null
  c3_contacto?: string | null
  c3_tel?: string | null
}

// USO DE PROPIEDAD
export interface UsoPropiedad {
  tipo_inm?: string | null
  giro_neg?: string | null
  exp_giro?: string | null
  propositos?: string | null
  sustituye_dom?: boolean | null
  ant_calle?: string | null
  ant_num_ext?: string | null
  ant_num_int?: string | null
  ant_cp?: string | null
  ant_colonia?: string | null
  ant_del_mun?: string | null
  ant_estado?: string | null
  motivo_cambio?: string | null
}

// PERSONA (Inquilino, Propietario, Obligado)
export interface Person {
  type: PersonType
  
  // Campos básicos (ambos tipos)
  telefono?: string | null
  correo?: string | null
  email?: string | null
  tel_cel?: string | null
  tel_fijo?: string | null
  
  // Persona Física - Básico
  nombre?: string | null
  nombres?: string | null
  apellido_p?: string | null
  apellido_m?: string | null
  nacionalidad?: string | null
  sexo?: string | null
  fecha_nac?: string | null
  rfc?: string | null
  curp?: string | null
  edo_civil?: string | null
  datos_conyuge?: string | null
  
  // Persona Moral - Básico
  razonSocial?: string | null
  nombreComercial?: string | null
  representante?: string | null
  
  // Domicilio
  dom_calle?: string | null
  dom_num_ext?: string | null
  dom_num_int?: string | null
  dom_cp?: string | null
  dom_colonia?: string | null
  dom_municipio?: string | null
  dom_estado?: string | null
  sit_hab?: string | null
  
  // Arrendador actual (solo para inquilinos)
  arr_act_nombre?: string | null
  arr_act_apellido_p?: string | null
  arr_act_apellido_m?: string | null
  arr_act_tel?: string | null
  arr_act_renta?: number | null
  arr_act_ano?: number | null
  
  // Datos complejos - Persona Física
  pf_empleo_ingresos?: EmpleoIngresos | null
  pf_referencias?: ReferenciasPersonales | null
  
  // Datos complejos - Persona Moral
  pm_datos?: PersonaMoralDatos | null
  pm_referencias?: ReferenciasComerciales | null
  
  // Uso de propiedad (común)
  uso_propiedad?: UsoPropiedad | null
  
  // Raw data del backend (para referencia)
  rawData?: any
  fullFormData?: any
}

// PROPIEDAD
export interface Property {
  id?: string | null
  tipo?: string | null
  cp?: string | null
  estado?: string | null
  ciudad?: string | null
  colonia?: string | null
  calle?: string | null
  numero?: string | null
  interior?: string | null
  referencia?: string | null
  metros?: number | null
  renta?: number | null
}

// DOCUMENTO
export interface Document {
  id: string
  name: string
  type: string
  category: "inquilino" | "obligado_solidario" | "propietario"
  uploadedAt: string
  url?: string
}

// INVESTIGACIÓN
export interface Investigacion {
  indiceRiesgo?: number
  completed: boolean
  fecha?: string | null
  resultado?: string | null
  notas?: string | null
}

// FORMALIZACIÓN
export interface Formalizacion {
  fechaInicio?: string
  fechaFin?: string
  fechaFirma?: string
  polizaEnlazada?: boolean
  oficina?: string
  abogado?: string
  producto?: string
  notas?: string | null
}

// ACTIVACIÓN
export interface Activacion {
  fechaInicio?: string
  plazoMeses?: number
  fechaFin?: string
  montoRenta?: number
  montoComision?: number
  tipoComision?: "completa" | "compartida"
  montoNetoComision?: number
  formaCobroComision?: "efectivo" | "transferencia"
  activated?: boolean
}

// RENTAL (PRINCIPAL)
export interface Rental {
  id: string
  status: RentalStatus
  createdAt: string | null
  updatedAt: string | null

  // Personas involucradas
  inquilino: Person
  obligadoSolidario?: Person | null
  propietario: Person
  
  // Propiedad
  propiedad: Property

  // Documentos
  documentos: Document[]

  // Etapas del proceso
  investigacion?: Investigacion
  formalizacion?: Formalizacion
  activacion?: Activacion
}

// HELPERS Y TYPES ADICIONALES

// Para crear/actualizar rentas
export interface CreateRentalDto {
  tipo_origen: "manual" | "automatico" | "importado"
  creado_por_user_id: number
  inquilino: Partial<Person>
  propietario: Partial<Person>
  propiedad: Partial<Property>
  obligado_solidario?: Partial<Person> | null
}

// Para actualizar secciones específicas
export interface UpdateRentalSection {
  inquilino?: Partial<Person>
  propietario?: Partial<Person>
  obligado_solidario?: Partial<Person> | null
  propiedad?: Partial<Property>
  documentos?: Document[]
  investigacion?: Partial<Investigacion>
  formalizacion?: Partial<Formalizacion>
  activacion?: Partial<Activacion>
}

// Estados posibles
export const RENTAL_STATUSES: Record<RentalStatus, string> = {
  apartada: "Apartada",
  en_proceso: "En Proceso",
  rentada: "Rentada",
  aprobada: "Aprobada",
  cancelada: "Cancelada",
  rechazada: "Rechazada",
  rescindida: "Rescindida",
}

// Tipos de persona
export const PERSON_TYPES: Record<PersonType, string> = {
  fisica: "Persona Física",
  moral: "Persona Moral",
}

// Estados de México
export const ESTADOS_MEXICO = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const

export type EstadoMexico = typeof ESTADOS_MEXICO[number]