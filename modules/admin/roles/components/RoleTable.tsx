import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Edit, Trash2 } from "lucide-react"
import type { RoleRow } from "../types"

export type RoleTableProps = {
  roles: RoleRow[]
  loading: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: (role: RoleRow) => void
  onDelete: (id: string) => void
}

export function RoleTable({ roles, loading, canEdit, canDelete, onEdit, onDelete }: RoleTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Roles
        </CardTitle>
        <CardDescription>Lista de roles y conteo de permisos asignados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[140px] text-right">Permisos</TableHead>
                <TableHead className="w-[220px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id} className="hover:bg-secondary/20">
                  <TableCell className="font-medium">{r.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{r.descripcion || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{r.permisosCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(r)} disabled={!canEdit}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)} disabled={!canDelete}>
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay roles para mostrar.
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
