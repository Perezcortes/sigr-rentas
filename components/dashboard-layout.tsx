"use client"

import type React from "react"
import Logo from "@/public/sigr_images/LogoRentas.png"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
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
import { useAuth } from "@/contexts/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

/** ===== API base ===== */
const RAW = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const BASE = RAW.replace(/\/+$/, "")

/** ===== Perfil desde /auth/profile ===== */
type ApiOffice = { nombre?: string; name?: string; code?: string; city?: string }
type ApiRole = { nombre?: string; name?: string; uid?: string } | string | null | undefined
type ApiProfile = {
  id?: string
  email?: string
  name?: string
  role?: ApiRole
  oficina?: ApiOffice | string
  office?: ApiOffice | string
  permissions?: string[]
}

/** ===== Catálogo de ítems de menú =====
 * Cada item define los permisos que habilitan su visibilidad (cualquiera de ellos).
 */
type MenuItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  requires?: string[]        // si es undefined => siempre visible
}
const MENU_CATALOG: MenuItem[] = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Reportes", href: "/reportes", requires: ["reportes", "exportar"] },
  { icon: Settings, label: "Admin", href: "/admin", requires: ["sistema.administrar", "gestionar_roles", "ver_usuarios", "ver_oficinas", "ver_propiedades"] },
  { icon: CreditCard, label: "Centro de Pagos", href: "/pagos", requires: ["pagos.ver", "pagos.listar"] },
  { icon: Users, label: "Interesados", href: "/interesados", requires: ["interesados.ver", "interesados.listar", "ver_propiedades"] },
  { icon: Home, label: "Mis Rentas", href: "/rentas", requires: ["rentas.ver", "rentas.listar"] },
  { icon: RotateCcw, label: "Renovaciones", href: "/renovaciones", requires: ["rentas.editar", "rentas.ver"] },
  { icon: Building2, label: "Administraciones", href: "/administraciones", requires: ["oficinas.listar", "ver_oficinas", "ver_propiedades"] },
  { icon: User, label: "Usuarios", href: "/usuarios", requires: ["usuarios.listar", "ver_usuarios"] },
]

/** ===== Utilidades de presentación ===== */
function roleNameFrom(apiRole: ApiRole): string {
  if (!apiRole) return ""
  if (typeof apiRole === "string") return apiRole
  return apiRole.nombre ?? apiRole.name ?? ""
}

function isAdminRole(apiRole: ApiRole): boolean {
  const n = roleNameFrom(apiRole).trim().toLowerCase()
  return n === "administrador" || n === "admin" || n === "administrador del sistema"
}

function officeDisplay(o?: ApiOffice | string): string {
  if (!o) return ""
  if (typeof o === "string") return o
  return o.nombre ?? o.name ?? o.code ?? o.city ?? ""
}

/** ===== Componente ===== */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth() // seguimos usando el logout del contexto
  const router = useRouter()
  const pathname = usePathname()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<ApiProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  /** Cargar /auth/profile (siempre desde el endpoint, como pediste) */
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoadingProfile(true)
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
        const res = await fetch(`${BASE}/auth/profile`, {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: "no-store",
        })
        const text = await res.text()
        if (!res.ok) throw new Error(text || `Error ${res.status}`)
        const data: ApiProfile = JSON.parse(text)
        if (mounted) setProfile(data)
      } catch (e) {
        // En un layout no saturamos con toasts; si quieres, integra useToast aquí.
        console.error("auth/profile error:", e)
        if (mounted) setProfile(null)
      } finally {
        if (mounted) setLoadingProfile(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  /** Derivados de perfil */
  const displayName = useMemo(() => {
    if (!profile) return undefined
    return (
      profile.name ||
      profile.email ||
      undefined
    )
  }, [profile])
  const initial = (displayName?.charAt(0) ?? "?").toUpperCase()
  const officeName = useMemo(() => officeDisplay(profile?.office ?? profile?.oficina), [profile])
  const roleLabel = useMemo(() => roleNameFrom(profile?.role), [profile])

  /** Filtrado del menú por permisos/rol */
  const filteredMenuItems = useMemo(() => {
    if (!profile) {
      // mientras carga el perfil, muestra solo los ítems públicos
      return MENU_CATALOG.filter(i => !i.requires)
    }
    const admin = isAdminRole(profile.role)
    const perms = new Set((profile.permissions ?? []).map(p => String(p).trim().toLowerCase()))

    const can = (requires?: string[]) => {
      if (!requires || requires.length === 0) return true
      if (admin) return true
      // permite acceso si tiene cualquiera de los permisos requeridos
      return requires.some(req => perms.has(req.trim().toLowerCase()))
    }

    return MENU_CATALOG.filter(item => can(item.requires))
  }, [profile])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

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
                <Button variant="ghost" className="w-full justify-start p-2" disabled={loadingProfile}>
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground">{displayName ?? "—"}</p>
                    <p className="text-xs text-sidebar-foreground/70">
                      {roleLabel || ""}
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
