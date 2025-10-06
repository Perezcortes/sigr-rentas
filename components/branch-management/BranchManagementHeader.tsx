import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"

export type BranchManagementHeaderProps = {
  loading: boolean
  submitting: boolean
  canCreate: boolean
  onRefresh: () => void
  onCreate: () => void
}

export function BranchManagementHeader({
  loading,
  submitting,
  canCreate,
  onRefresh,
  onCreate,
}: BranchManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestión de Sucursales</h2>
        <p className="text-muted-foreground">Administra las sucursales y oficinas del sistema.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={loading || submitting}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Cargando..." : "Recargar"}
        </Button>
        {canCreate && (
          <Button onClick={onCreate} className="bg-primary hover:bg-primary/90" disabled={submitting}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Sucursal
          </Button>
        )}
      </div>
    </div>
  )
}
