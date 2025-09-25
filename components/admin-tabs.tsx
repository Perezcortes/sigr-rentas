"use client"

import { useCallback, useMemo } from "react"
import type { ReactNode, ComponentType } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BranchManagement } from "@/components/branch-management"
import { UserManagement } from "@/components/user-management"
import { RoleManagement } from "@/components/role-management"
import { Building2, Users, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

type RoleLike = {
  nombre?: unknown
  name?: unknown
  code?: unknown
  display_name?: unknown
}

function normalizeRole(value: unknown): string {
  if (!value) return ""
  if (typeof value === "string") return value.trim().toLowerCase()
  if (typeof value === "object" && value !== null) {
    const roleObj = value as RoleLike
    const raw = roleObj.nombre ?? roleObj.name ?? roleObj.code ?? roleObj.display_name
    return typeof raw === "string" ? raw.trim().toLowerCase() : ""
  }
  return ""
}

export function AdminTabs() {
  const { user } = useAuth()

  const permissions = useMemo(() => {
    return Array.isArray(user?.permissions)
      ? user!.permissions.map((p) => String(p ?? "").trim().toLowerCase())
      : []
  }, [user])

  const normalizedRole = useMemo(() => {
    if (!user) return ""
    const direct = normalizeRole((user as unknown as Record<string, unknown>).role ?? user.role)
    if (direct) return direct
    const fallback = (user as Record<string, unknown>)
    const alt = typeof fallback.role_name === "string" ? fallback.role_name : typeof fallback.roleName === "string" ? fallback.roleName : ""
    return normalizeRole(alt)
  }, [user])

  const isAdmin = normalizedRole === "administrador" || normalizedRole === "admin" || normalizedRole === "administrador del sistema"

  type TabDescriptor = {
    value: "branches" | "users" | "roles"
    label: string
    icon: ComponentType<{ className?: string }>
    component: ReactNode
    requiredPerms?: string[]
    requireAdmin?: boolean
  }

  const tabs: TabDescriptor[] = useMemo(() => [
    {
      value: "branches",
      label: "Sucursales",
      icon: Building2,
      component: <BranchManagement />,
      requiredPerms: ["ver_oficinas", "ver_sucursales", "oficinas.listar"],
    },
    {
      value: "users",
      label: "Usuarios",
      icon: Users,
      component: <UserManagement />,
      requiredPerms: ["ver_usuarios", "usuarios.listar"],
    },
    {
      value: "roles",
      label: "Roles",
      icon: Shield,
      component: <RoleManagement />,
      requiredPerms: ["gestionar_roles", "ver_permisos"],
      requireAdmin: true,
    },
  ], [])

  const hasPerm = useCallback((target: string) => permissions.includes(target.trim().toLowerCase()), [permissions])

  const availableTabs = useMemo(() => {
    return tabs.filter((tab) => {
      if (tab.requireAdmin && !isAdmin) return false
      if (!tab.requiredPerms || tab.requiredPerms.length === 0) return true
      return tab.requiredPerms.some(hasPerm)
    })
  }, [tabs, isAdmin, hasPerm])

  if (availableTabs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No tienes permisos para gestionar sucursales, usuarios o roles.
      </div>
    )
  }

  const defaultValue = availableTabs[0].value
  const gridColsClass = availableTabs.length >= 3 ? "grid-cols-3" : availableTabs.length === 2 ? "grid-cols-2" : "grid-cols-1"

  return (
    <Tabs defaultValue={defaultValue} className="space-y-6">
      <TabsList
        className={`grid ${gridColsClass} w-fit max-w-2xl`}
      >
        {availableTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {availableTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-6">
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  )
}
