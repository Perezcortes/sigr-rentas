export type RoleForm = {
  nombre: string
  descripcion: string
}

export interface RoleRow {
  id: string
  nombre: string
  descripcion: string
  permisosCount: number
}

export interface PermissionItem {
  hid: string
  nid: number | null
  nombre: string
  descripcion?: string | null
}

export type PermissionGroup = readonly [string, PermissionItem[]]
