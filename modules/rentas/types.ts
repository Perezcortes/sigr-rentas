// src/modules/rentas/types.ts

export type RentalStatus = "apartada" | "en_proceso" | "rentada" | "cancelada" | "rechazada" | "rescindida"

export type PersonType = "fisica" | "moral"

export interface Person {
  type: PersonType
  // Persona Física
  nombre: string | null
  telefono: string | null
  correo: string | null
  // Persona Moral
  razonSocial: string | null
  nombreComercial: string | null
  representante: string | null
  rawData: any;
  fullFormData?: any
}

export interface Property {
  id?: string | null
  tipo: string | null
  cp: string | null
  estado: string | null
  ciudad: string | null
  colonia: string | null
  calle: string | null
  numero: string | null
  interior: string | null
  referencia: string | null
  metros: number | null
  renta: number | null
}

export interface Document {
  id: string
  name: string
  type: string
  category: "inquilino" | "obligado_solidario" | "propietario"
  uploadedAt: string
  url?: string
}

export interface Rental {
  id: string
  status: RentalStatus
  createdAt: string | null
  updatedAt: string | null

  // Process data
  inquilino: Person
  obligadoSolidario?: Person | null
  propietario: Person
  propiedad: Property

  // Documents
  documentos: Document[]

  // Investigation
  investigacion?: {
    indiceRiesgo?: number
    completed: boolean
  }

  // Formalization
  formalizacion?: {
    fechaInicio?: string
    fechaFin?: string
    fechaFirma?: string
    polizaEnlazada: boolean
  }

  // Activation
  activacion?: {
    fechaInicio?: string
    plazoMeses?: number
    fechaFin?: string
    montoRenta?: number
    montoComision?: number
    tipoComision?: "completa" | "compartida"
    montoNetoComision?: number
    formaCobroComision?: "efectivo" | "transferencia"
    activated: boolean
  }
}