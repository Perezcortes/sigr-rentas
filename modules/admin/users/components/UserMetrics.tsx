import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type UserMetricsProps = {
  totalUsers: number
  activos: number
  inactivos: number
  recientes7d: number
}

export function UserMetrics({ totalUsers, activos, inactivos, recientes7d }: UserMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total usuarios</CardDescription>
          <CardTitle className="text-2xl">{totalUsers}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Activos</CardDescription>
          <CardTitle className="text-2xl">{activos}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Inactivos</CardDescription>
          <CardTitle className="text-2xl">{inactivos}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Accesos últimos 7 días</CardDescription>
          <CardTitle className="text-2xl">{recientes7d}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
