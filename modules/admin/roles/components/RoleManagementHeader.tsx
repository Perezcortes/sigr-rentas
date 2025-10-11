import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"

export type RoleManagementHeaderProps = {
  loading: boolean
  submitting: boolean
  canCreate: boolean
  onRefresh: () => void
  onCreate: () => void
}

export function RoleManagementHeader({ loading, submitting, canCreate, onRefresh, onCreate }: RoleManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestión de Roles</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={loading || submitting}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Cargando..." : "Recargar"}
        </Button>
        <Button onClick={onCreate} className="bg-primary hover:bg-primary/90" disabled={!canCreate || submitting}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>
    </div>
  )
}
