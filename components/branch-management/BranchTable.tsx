import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Edit, Trash2 } from "lucide-react"
import type { Branch } from "./types"

type BranchTableProps = {
  branches: Branch[]
  loading: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: (branch: Branch) => void
  onDelete: (id: string) => void
  totalEmployees: number
  filters?: ReactNode
}

export function BranchTable({
  branches,
  loading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  totalEmployees,
  filters,
}: BranchTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Sucursales
        </CardTitle>
        <CardDescription>
          Total de empleados reportados: <span className="font-medium">{totalEmployees}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filters}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Responsable</TableHead>
                {(canEdit || canDelete) && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id} className="hover:bg-secondary/20">
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.address || "—"}</TableCell>
                  <TableCell>{b.cityName || "—"}</TableCell>
                  <TableCell>{b.stateName || "—"}</TableCell>
                  <TableCell>{b.manager || "—"}</TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell className="text-right space-x-2">
                      {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(b)}>
                          <Edit className="h-4 w-4 mr-1" /> Editar
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="destructive" size="sm" onClick={() => onDelete(b.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {branches.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={canEdit || canDelete ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No hay sucursales para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
