// src/contexts/auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { User, AuthState } from "@/types/auth"
import { authenticateUser, fetchProfile, logoutServer, hasPermission as hasPermFn } from "@/lib/auth"

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: User }

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* ===== Helpers de normalización ===== */

type NormalizedRole =
  | "administrador"
  | "gerente"
  | "coordinador"
  | "agente"
  | "propietario"
  | "inquilino"

function normalizeRole(value: any): NormalizedRole {
  const v = String(
    typeof value === "object" && value?.name ? value.name : value ?? ""
  )
    .trim()
    .toLowerCase()

  const map: Record<string, NormalizedRole> = {
    administrador: "administrador",
    "administrador del sistema": "administrador",
    admin: "administrador",
    gerente: "gerente",
    coordinator: "coordinador",
    coordinador: "coordinador",
    agente: "agente",
    agent: "agente",
    propietario: "propietario",
    owner: "propietario",
    inquilino: "inquilino",
    tenant: "inquilino",
  }
  return map[v] ?? "agente"
}

function b64UrlDecode(input: string) {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function readJwtClaims():
  | { role?: string; permissions?: string[]; sub?: string; email?: string }
  | null {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  if (!token) return null
  const [, payload] = token.split(".")
  if (!payload) return null
  return b64UrlDecode(payload)
}

function pickPermissions(u: any, jwtPerms?: string[]): string[] {
  const fromUserArray =
    Array.isArray(u?.permissions) ? u.permissions.filter((p: any) => typeof p === "string") : []

  const fromUserObjects =
    Array.isArray(u?.permissions) ? u.permissions.map((p: any) => (typeof p === "object" ? p?.name : null)).filter(Boolean) : []

  const fromRoleObjects =
    Array.isArray(u?.role?.permissions)
      ? u.role.permissions.map((p: any) => (typeof p === "string" ? p : p?.name)).filter(Boolean)
      : []

  const fromJwt = Array.isArray(jwtPerms) ? jwtPerms : []

  const all = [...fromUserArray, ...fromUserObjects, ...fromRoleObjects, ...fromJwt]
  // deduplicar y normalizar a string
  return Array.from(new Set(all.map(String)))
}

function normalizeUser(serverUser: any): User {
  const jwt = readJwtClaims()
  const roleSource = serverUser?.role ?? jwt?.role
  const role = normalizeRole(roleSource)

  // nombre legible
  const fullName =
    serverUser?.full_name ||
    [serverUser?.first_name, serverUser?.last_name].filter(Boolean).join(" ").trim() ||
    serverUser?.name ||
    serverUser?.email

  // oficina: acepta objeto o string
  const office = serverUser?.office ?? serverUser?.oficina
  const oficina =
    typeof office === "object"
      ? office
      : office
      ? { name: String(office) }
      : undefined

  const permissions = pickPermissions(serverUser, jwt?.permissions)

  // construimos un User sin romper el tipo (conservamos campos originales)
  const normalized: any = {
    ...serverUser,
    id: serverUser?.id ?? jwt?.sub,
    email: serverUser?.email ?? jwt?.email,
    role,
    full_name: fullName,
    oficina: oficina, // para tu UI
    office: office, // mantenemos original si era objeto
    permissions,
  }

  return normalized as User
}

/* ===== Reducer ===== */

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }
    case "LOGIN_SUCCESS":
      return { user: action.payload, isLoading: false, isAuthenticated: true }
    case "LOGIN_FAILURE":
      return { user: null, isLoading: false, isAuthenticated: false }
    case "LOGOUT":
      return { user: null, isLoading: false, isAuthenticated: false }
    case "RESTORE_SESSION":
      return { user: action.payload, isLoading: false, isAuthenticated: true }
    default:
      return state
  }
}

/* ===== Provider ===== */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Al montar: intenta sesión real; si no hay, intenta restaurar del cache siempre normalizando
  useEffect(() => {
    ;(async () => {
      const remote = await fetchProfile().catch(() => null)
      if (remote) {
        const normalized = normalizeUser(remote)
        localStorage.setItem("rentas_user", JSON.stringify(normalized))
        dispatch({ type: "RESTORE_SESSION", payload: normalized })
        return
      }

      const savedUser = localStorage.getItem("rentas_user")
      const hasToken = !!localStorage.getItem("access_token")
      if (savedUser && hasToken) {
        try {
          const parsed = JSON.parse(savedUser)
          const normalized = normalizeUser(parsed)
          // re-escribe por si antes quedó sin normalizar
          localStorage.setItem("rentas_user", JSON.stringify(normalized))
          dispatch({ type: "RESTORE_SESSION", payload: normalized })
          return
        } catch {
          localStorage.removeItem("rentas_user")
        }
      }
      dispatch({ type: "LOGIN_FAILURE" })
    })()
  }, [])

  // Sincroniza entre pestañas (incluye borrado de token)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rentas_user") {
        if (e.newValue === null) {
          dispatch({ type: "LOGOUT" })
        } else {
          try {
            const userRaw = JSON.parse(e.newValue)
            const normalized = normalizeUser(userRaw)
            dispatch({ type: "RESTORE_SESSION", payload: normalized })
          } catch {}
        }
      }
      if (e.key === "access_token" && e.newValue === null) {
        localStorage.removeItem("rentas_user")
        dispatch({ type: "LOGOUT" })
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })
    try {
      const serverUser = await authenticateUser(email, password) // guarda tokens y trae /auth/profile
      if (!serverUser) {
        dispatch({ type: "LOGIN_FAILURE" })
        throw new Error("Credenciales inválidas")
      }
      const normalized = normalizeUser(serverUser)
      localStorage.setItem("rentas_user", JSON.stringify(normalized))
      dispatch({ type: "LOGIN_SUCCESS", payload: normalized })
      return true
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE" })
      throw err
    }
  }

  const logout = () => {
    logoutServer().finally(() => {
      localStorage.removeItem("rentas_user")
      dispatch({ type: "LOGOUT" })
    })
  }

  // hasPermission opera sobre el user ya normalizado
  const hasPermission = (perm: string) => hasPermFn(state.user, perm)

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
