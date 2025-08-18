import type { User, UserRole } from "@/types/auth"

// Mock user data - in production this would come from a database
const mockUsers: Record<string, { password: string; user: User }> = {
  "admin@rentas.com": {
    password: "admin123",
    user: {
      id: "1",
      email: "admin@rentas.com",
      name: "Administrador Sistema",
      role: "administrador",
      permissions: ["all"],
      isActive: true,
    },
  },
  "gerente@rentas.com": {
    password: "gerente123",
    user: {
      id: "2",
      email: "gerente@rentas.com",
      name: "Gerente Oficina",
      role: "gerente",
      oficina: "Oficina Central",
      permissions: [
        "dashboard",
        "reportes",
        "centro_pagos",
        "interesados",
        "mis_rentas",
        "renovaciones",
        "administraciones",
      ],
      isActive: true,
    },
  },
  "agente@rentas.com": {
    password: "agente123",
    user: {
      id: "3",
      email: "agente@rentas.com",
      name: "Agente Inmobiliario",
      role: "agente",
      oficina: "Oficina Central",
      permissions: ["dashboard", "interesados", "mis_rentas", "renovaciones"],
      isActive: true,
    },
  },
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const userData = mockUsers[email]
  if (userData && userData.password === password) {
    return userData.user
  }

  return null
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false
  if (user.permissions.includes("all")) return true
  return user.permissions.includes(permission)
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    administrador: "Administrador",
    gerente: "Gerente",
    coordinador: "Coordinador",
    agente: "Agente",
    propietario: "Propietario",
    inquilino: "Inquilino",
  }
  return roleNames[role]
}
