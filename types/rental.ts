export type RentalStatus = "apartada" | "en_proceso" | "rentada" | "cancelada" | "rechazada" | "rescindida"

export type PersonType = "fisica" | "moral"

export interface Person {
  type: PersonType
  // Persona Física
  nombre?: string
  telefono?: string
  correo?: string
  // Persona Moral
  razonSocial?: string
  nombreComercial?: string
  representante?: string
}

export interface Property {
  id?: string
  tipo: string
  cp: string
  estado: string
  ciudad: string
  colonia: string
  calle: string
  numero: string
  interior?: string
  referencia?: string
  metros: number
  renta: number
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
  createdAt: string
  updatedAt: string

  // Process data
  inquilino: Person
  obligadoSolidario?: Person
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
