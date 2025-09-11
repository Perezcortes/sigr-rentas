"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission as hasPermLib } from "@/lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredAny?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredAny,
  fallback = <div>No tienes permisos para acceder a esta sección</div>,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  const passSingle = requiredPermission ? hasPermLib(user, requiredPermission) : true
  const passAny = requiredAny?.length ? requiredAny.some((p) => hasPermLib(user, p)) : true

  if (!(passSingle && passAny)) {
    return <div className="p-4">{fallback}</div>
  }

  return <>{children}</>
}
