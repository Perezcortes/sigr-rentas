"use client"

import type React from "react"
import Logo from "@/public/sigr_images/LogoRentas.png"
import Image from "next/image"
import { useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getRoleDisplayName, hasPermission } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  BarChart3,
  Settings,
  CreditCard,
  Users,
  Home,
  RotateCcw,
  FileText,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  permission?: string
}

// --- Normalizador local de rol ---
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

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Alias -> permisos requeridos
  const PERM_MAP: Record<string, string[]> = {
    reportes: ["reportes.generar", "reportes.exportar"],
    admin: ["sistema.administrar", "usuarios.listar", "roles.listar", "oficinas.listar", "propiedades.listar"],
    centro_pagos: ["pagos.ver", "pagos.listar"],
    interesados: ["propiedades.ver", "propiedades.listar"],
    mis_rentas: ["rentas.ver", "rentas.listar"],
    renovaciones: ["rentas.editar"],
    administraciones: ["oficinas.listar", "propiedades.listar"],
    usuarios: ["usuarios.listar"],
  }

  const menuItems: MenuItem[] = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Reportes", href: "/reportes", permission: "reportes" },
    { icon: Settings, label: "Admin", href: "/admin", permission: "admin" },
    { icon: CreditCard, label: "Centro de Pagos", href: "/pagos", permission: "centro_pagos" },
    { icon: Users, label: "Interesados", href: "/interesados", permission: "interesados" },
    { icon: Home, label: "Mis Rentas", href: "/rentas", permission: "mis_rentas" },
    { icon: RotateCcw, label: "Renovaciones", href: "/renovaciones", permission: "renovaciones" },
    { icon: Building2, label: "Administraciones", href: "/administraciones", permission: "administraciones" },
    { icon: User, label: "Usuarios", href: "/usuarios", permission: "usuarios" },
  ]

  // Helper para nombre inicial y display name
  const displayName = useMemo(() => {
    if (!user) return undefined
    return (
      (user as any)?.name ||
      (user as any)?.full_name ||
      [ (user as any)?.first_name, (user as any)?.last_name ].filter(Boolean).join(" ") ||
      (user as any)?.email
    )
  }, [user])

  const initial = (displayName?.charAt(0) ?? "?").toUpperCase()

  // Oficina: objeto o string o campo "oficina"
  const officeName = useMemo(() => {
    if (!user) return undefined
    const o: any = (user as any).office ?? (user as any).oficina
    if (!o) return undefined
    return typeof o === "object" ? o.name ?? o.code ?? o.city ?? "" : String(o)
  }, [user])

  // Filtro de menú: usa hasPermission y respeta admin global
  const filteredMenuItems = useMemo(() => {
    if (!user) return menuItems.filter((i) => !i.permission)

    const roleIsAdmin = normalizeRole(user.role) === "administrador"
    const hasGlobal =
      roleIsAdmin ||
      hasPermission(user, "sistema.administrar") ||
      hasPermission(user, "all")

    const canAccess = (alias?: string) => {
      if (!alias) return true
      if (hasGlobal) return true
      const required = PERM_MAP[alias] ?? [alias]
      // basta con 1 permiso de la lista
      return required.some((p) => hasPermission(user, p))
    }

    return menuItems.filter((item) => canAccess(item.permission))
  }, [user]) // dependemos del objeto user completo para evitar desincronización

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
            <div className="relative h-8 w-36">
              <Image src={Logo} alt="Rentas.com" fill className="object-contain" priority sizes="144px" />
            </div>
            <Button variant="ghost" size="sm" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredMenuItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const base = "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
              const active = "bg-primary text-primary-foreground"
              const inactive = "text-sidebar-foreground hover:bg-[#161848] hover:text-sidebar-accent-foreground"
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${base} ${isActive ? active : inactive}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-primary-foreground" : "text-sidebar-foreground"}`}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground">{displayName ?? "—"}</p>
                    <p className="text-xs text-sidebar-foreground/70">
                      {user ? getRoleDisplayName(normalizeRole(user.role)) : ""}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {!!officeName && (
                <div className="hidden lg:block text-sm text-muted-foreground">
                  <span className="font-medium">{officeName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
