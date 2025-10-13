"use client"

import type React from "react"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission as hasPermLib } from "@/modules/auth/auth.service"

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Requiere un permiso específico */
  requiredPermission?: string
  /** Requiere al menos uno de esta lista */
  requiredAny?: string[]
  /** Fallback si le FALTAN permisos (401/403 lógico) */
  fallback?: React.ReactNode
  /** Fallback si NO está autenticado (evita el flash al cerrar sesión) */
  unauthenticatedFallback?: React.ReactNode | null
}

const norm = (s: string) => String(s).trim().toLowerCase()

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredAny,
  fallback = <div className="p-4">No tienes permisos para acceder a esta sección</div>,
  unauthenticatedFallback = null, // <- evita mostrar el mensaje de permisos al desloguear
}: ProtectedRouteProps) {
  // HOOKS (siempre, sin returns antes)
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  const permsSet = useMemo(() => {
    const arr: string[] = Array.isArray(user?.permissions) ? (user!.permissions as string[]) : []
    return new Set(arr.map(norm))
  }, [user])

  const isAdminLite = useMemo(() => permsSet.has("configuracion_sistema"), [permsSet])

  const hasAccess = useMemo(() => {
    const noReq = !requiredPermission && !(requiredAny && requiredAny.length)
    if (noReq) return true
    if (isAdminLite) return true

    const checkOne = (p: string) => {
      try {
        if (typeof hasPermLib === "function") {
          // ajusta si tu hasPermLib usa otra firma
          return !!hasPermLib(user, p)
        }
      } catch {}
      return permsSet.has(norm(p))
    }

    const passSingle = requiredPermission ? checkOne(requiredPermission) : false
    const passAny = requiredAny?.length ? requiredAny.some(checkOne) : false
    return passSingle || passAny
  }, [requiredPermission, requiredAny, isAdminLite, permsSet, user])

  // Redirige sólo por NO autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isLoading, isAuthenticated, router])

  // Render estable
  if (isLoading) return <Loading />

  if (!isAuthenticated) {
    // estamos redirigiendo => no muestres "no tienes permisos"
    return unauthenticatedFallback ?? <Loading />
  }

  if (!hasAccess) {
    // autenticado pero sin permisos requeridos
    return <>{fallback}</>
  }

  return <>{children}</>
}
