export type UserRole = "administrador" | "gerente" | "coordinador" | "agente" | "propietario" | "inquilino"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  oficina?: string
  permissions: string[]
  isActive: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
