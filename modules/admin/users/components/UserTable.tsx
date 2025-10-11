import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Shield, Users, Edit, Trash2 } from "lucide-react"
import type { UserRole } from "@/types/auth"
import type { SystemUser } from "../types"

export type UserTableProps = {
  users: SystemUser[]
  loading: boolean
  creatorRole: UserRole
  canManageTarget: (creator: UserRole, target: UserRole) => boolean
  onEdit: (user: SystemUser) => void
  onDelete: (id: string) => void
}

export function UserTable({ users, loading, creatorRole, canManageTarget, onEdit, onDelete }: UserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Usuarios
        </CardTitle>
        <CardDescription>Administra usuarios, roles y oficinas asignadas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Oficina(s)</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const canManage = canManageTarget(creatorRole, u.role)
                return (
                  <TableRow key={u.id} className="hover:bg-secondary/20">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {u.email}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {u.roleName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.oficina || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.lastLogin}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {canManage && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(u)}>
                          <Edit className="h-4 w-4 mr-1" /> Editar
                        </Button>
                      )}
                      {canManage && (
                        <Button variant="destructive" size="sm" onClick={() => onDelete(u.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay usuarios para mostrar.
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
