"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, hasPermission as hasPermLib } from "@/lib/auth"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Shield, RefreshCw, Plus, Edit, Trash2 } from "lucide-react"

type RawRole = any
interface RoleRow {
  id: string
  nombre: string
  descripcion: string
  permisosCount: number
}

function toRoleRow(r: RawRole): RoleRow {
  const id = String(r?.id ?? r?.role_id ?? r?.uuid ?? crypto.randomUUID())
  const nombre = r?.nombre ?? r?.name ?? r?.display_name ?? r?.slug ?? "Sin nombre"
  const descripcion = r?.descripcion ?? r?.description ?? r?.details ?? ""
  const permisos = r?.permisos ?? r?.permissions ?? r?.scopes ?? []
  const permisosCount = Array.isArray(permisos)
    ? permisos.length
    : typeof permisos === "object" && permisos
    ? Object.keys(permisos).length
    : 0

  return { id, nombre: String(nombre), descripcion: String(descripcion), permisosCount }
}

function parseIdList(text: string): number[] {
  if (!text) return []
  const ids = text
    .split(/[,\s]+/)
    .map((t) => Number(t.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  return Array.from(new Set(ids))
}
function permsToCsv(perms: any): string {
  if (!perms) return ""
  if (Array.isArray(perms)) {
    const ids = perms
      .map((p) => (typeof p === "number" ? p : typeof p === "object" ? p?.id : NaN))
      .filter((n) => Number.isFinite(n))
    return Array.from(new Set(ids)).join(", ")
  }
  if (typeof perms === "object") {
    const ids = Object.keys(perms)
      .map((k) => Number(k))
      .filter((n) => Number.isFinite(n))
    return Array.from(new Set(ids)).join(", ")
  }
  return ""
}

export function RoleManagement() {
  const { user } = useAuth()

  const canView   = useMemo(() => hasPermLib(user, "gestionar_roles") || hasPermLib(user, "ver_permisos"), [user])
  const canCreate = useMemo(() => hasPermLib(user, "gestionar_roles"), [user])
  const canEdit   = canCreate
  const canDelete = canCreate

  const [roles, setRoles] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [authIssue, setAuthIssue] = useState<null | { code: 401 | 403; msg: string }>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RoleRow | null>(null)
  const [form, setForm] = useState({ nombre: "", descripcion: "", permissionsText: "" })
  const [loadingDetail, setLoadingDetail] = useState(false)

  async function fetchRoles() {
    if (!canView) {
      setAuthIssue({ code: 403, msg: "No tienes el permiso requerido: gestionar_roles o ver_permisos." })
      return
    }
    setLoading(true)
    setError(null)
    setAuthIssue(null)
    try {
      const raw = await api("/roles")
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []
      setRoles(list.map(toRoleRow))
    } catch (e: any) {
      const msg = String(e?.message || "")
      if (/401/.test(msg)) setAuthIssue({ code: 401, msg: "Sesión expirada. Inicia sesión nuevamente." })
      else if (/403/.test(msg) || /No tienes los permisos|Forbidden/i.test(msg))
        setAuthIssue({ code: 403, msg: "No tienes el permiso requerido: gestionar_roles o ver_permisos." })
      else setError(msg || "No se pudo cargar la lista de roles")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchRoles() }, [canView])

  async function createRole() {
    setSubmitting(true); setError(null); setSuccess(null)
    try {
      const payload: any = { nombre: form.nombre, descripcion: form.descripcion || undefined }
      const ids = parseIdList(form.permissionsText)
      if (ids.length) payload.permissions = ids
      await api("/roles", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } })
      setSuccess("Rol creado correctamente")
      setIsDialogOpen(false)
      await fetchRoles()
    } catch (e: any) {
      setError(e?.message || "No se pudo crear el rol")
    } finally { setSubmitting(false) }
  }

  async function updateRole(id: string) {
    setSubmitting(true); setError(null); setSuccess(null)
    try {
      const payload: any = { nombre: form.nombre, descripcion: form.descripcion || undefined }
      const ids = parseIdList(form.permissionsText)
      if (ids.length) payload.permissions = ids
      await api(`/roles/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      })
      setSuccess("Rol actualizado")
      setIsDialogOpen(false)
      await fetchRoles()
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar el rol")
    } finally { setSubmitting(false) }
  }

//   delete
  async function deleteRole(id: string) {
    if (!canDelete) return
    const ok = typeof window !== "undefined"
      ? window.confirm("¿Eliminar este rol? Esta acción es reversible (soft delete).")
      : true
    if (!ok) return

    setSubmitting(true); setError(null); setSuccess(null)
    try {
      const res = await api(`/roles/${encodeURIComponent(id)}`, { method: "DELETE" }, { expectJson: false })
      setSuccess("Rol eliminado")
      await fetchRoles()
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar el rol")
    } finally {
      setSubmitting(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: "", descripcion: "", permissionsText: "" })
    setIsDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  async function openEdit(r: RoleRow) {
    setEditing(r)
    setIsDialogOpen(true)
    setError(null)
    setSuccess(null)
    setForm({ nombre: r.nombre, descripcion: r.descripcion, permissionsText: "" })

    if (!canEdit) return
    setLoadingDetail(true)
    try {
      const detail = await api(`/roles/${encodeURIComponent(r.id)}`)
      const nombre = detail?.nombre ?? detail?.name ?? r.nombre
      const descripcion = detail?.descripcion ?? detail?.description ?? r.descripcion
      const permsCsv = permsToCsv(detail?.permisos ?? detail?.permissions)
      setForm({ nombre: String(nombre), descripcion: String(descripcion ?? ""), permissionsText: permsCsv })
    } catch { /* no hacemos nada, queda el form básico */ }
    finally { setLoadingDetail(false) }
  }

  const save = () => { editing ? updateRole(editing.id) : createRole() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Roles</h2>
          <p className="text-muted-foreground">
            Ver requiere <code>gestionar_roles</code> o <code>ver_permisos</code>. CRUD sólo con <code>gestionar_roles</code>.
          </p>
          {authIssue && <p className={`mt-2 text-sm ${authIssue.code === 403 ? "text-amber-600" : "text-destructive"}`}>{authIssue.msg}</p>}
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchRoles} disabled={loading || submitting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Recargar"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-primary hover:bg-primary/90" disabled={!canCreate || submitting}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
                <DialogDescription>
                  {editing ? "Actualiza el rol y sus permisos (IDs)." : "Crea un rol e ingresa IDs de permisos separados por coma."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={form.nombre}
                         onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                         placeholder="Administrador, Gerente…"
                         disabled={editing ? !canEdit : !canCreate}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input id="descripcion" value={form.descripcion}
                         onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                         placeholder="Rol con privilegios…"
                         disabled={editing ? !canEdit : !canCreate}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permissions">IDs de permisos (opcional)</Label>
                  <Input id="permissions" value={form.permissionsText}
                         onChange={(e) => setForm({ ...form, permissionsText: e.target.value })}
                         placeholder="1, 2, 5"
                         disabled={editing ? !canEdit : !canCreate}/>
                  {loadingDetail && editing && <p className="text-xs text-muted-foreground">Cargando permisos del rol…</p>}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancelar</Button>
                <Button onClick={save} className="bg-primary hover:bg-primary/90"
                        disabled={submitting || !form.nombre || (editing ? !canEdit : !canCreate)}>
                  {submitting ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Rol"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{roles.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles con permisos</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{roles.filter(r => r.permisosCount > 0).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permisos totales (suma)</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{roles.reduce((a, r) => a + r.permisosCount, 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Roles</CardTitle>
          <CardDescription>Visualiza y gestiona los roles existentes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando roles…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.descripcion || "—"}</TableCell>
                    <TableCell>
                      {r.permisosCount > 0 ? (
                        <Badge variant="outline">{r.permisosCount} permisos</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin permisos</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(r)} disabled={!canEdit}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRole(r.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={!canDelete || submitting}
                          title="Eliminar rol"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && !error && !authIssue && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No hay roles para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
