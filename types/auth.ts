export type UserRole = "administrador" | "gerente" | "coordinador" | "agente" | "propietario" | "inquilino"

// Tipos flexibles usados en la respuesta directa de la API para oficina y rol
export type ApiOffice = { nombre?: string; name?: string; code?: string; city?: string }
export type ApiRole = { nombre?: string; name?: string; uid?: string } | string | null | undefined

// Estructura completa del Perfil devuelto por la API /auth/profile
export type ApiProfile = {
    id?: string;
    email?: string;
    name?: string;
    role?: ApiRole;
    oficina?: ApiOffice | string;
    office?: ApiOffice | string;
    permissions?: string[];
    isActive?: boolean;
    created_at?: string;
    last_login_at?: string;
}

// Estructura del Usuario usado internamente en el contexto (limpio, una vez autenticado)
export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    oficina?: string
    permissions: string[]
    isActive: boolean
}

// Estructura del Estado de Autenticación Global
export interface AuthState {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
}
