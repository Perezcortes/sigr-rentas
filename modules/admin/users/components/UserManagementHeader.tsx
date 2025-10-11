import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"

export type UserManagementHeaderProps = {
  loading: boolean
  submitting: boolean
  onRefresh: () => void
  onAddUser: () => void
  canCreateUsers: boolean
}

export function UserManagementHeader({
  loading,
  submitting,
  onRefresh,
  onAddUser,
  canCreateUsers,
}: UserManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
        <p className="text-muted-foreground">Administra los usuarios y sus permisos en el sistema</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={loading || submitting}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Cargando..." : "Recargar"}
        </Button>
        <Button
          onClick={onAddUser}
          className="bg-primary hover:bg-primary/90"
          disabled={submitting || !canCreateUsers}
          title={!canCreateUsers ? "Tu rol no puede crear usuarios" : undefined}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>
    </div>
  )
}
