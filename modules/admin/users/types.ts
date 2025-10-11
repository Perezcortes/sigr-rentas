import type { UserRole } from "@/types/auth"

export type OfficeId = string | number

export type Office = {
  id: OfficeId
  nombre: string
  clave?: string
  ciudad?: string
  estado?: string
  activo?: boolean
}

export interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleName: string
  oficina: string
  permissions: string[]
  isActive: boolean
  lastLogin: string
}

export type FormData = {
  nombres: string
  primer_apellido: string
  segundo_apellido: string
  correo: string
  telefono: string
  whatsapp: string
  role: UserRole
  isActive: boolean
  password: string
}

export type FormErrors = Partial<Record<keyof FormData, string>> & { roleUid?: string }

export type ApiRole = {
  uid?: string
  id?: number
  nombre?: string
  descripcion?: string
  is_active?: boolean
}

export type SelectedOfficePill = {
  id: OfficeId
  label: string
}
