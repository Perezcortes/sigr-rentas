import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type RoleMetricsProps = {
  totalRoles: number
  rolesSinPermisos: number
  permisosTotales: number
}

export function RoleMetrics({ totalRoles, rolesSinPermisos, permisosTotales }: RoleMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total de roles</CardDescription>
          <CardTitle className="text-2xl">{totalRoles}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Roles sin permisos</CardDescription>
          <CardTitle className="text-2xl">{rolesSinPermisos}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Permisos asignados</CardDescription>
          <CardTitle className="text-2xl">{permisosTotales}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
