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
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, RefreshCw, Plus, Edit, Trash2 } from "lucide-react"

import Hashids from "hashids"

// ================= Hashids (auto–detector) =================
const SALT  = process.env.NEXT_PUBLIC_HASHIDS_SALT ?? ""
const P_SALT = process.env.NEXT_PUBLIC_HASHIDS_PERMISSIONS_SALT ?? SALT
const MIN   = Number(process.env.NEXT_PUBLIC_HASHIDS_MIN_LENGTH ?? 0)
const ALPH  = process.env.NEXT_PUBLIC_HASHIDS_ALPHABET || undefined

type HashidsCandidate = { salt: string; min: number; alph?: string; inst: Hashids }
function makeCandidate(salt: string, min: number, alph?: string): HashidsCandidate {
  return { salt, min, alph, inst: new Hashids(salt, min, alph) }
}
const CANDIDATES_BASE: HashidsCandidate[] = []
if (SALT) {
  const salts = Array.from(new Set([
    SALT,
    P_SALT,
    `${SALT}permisos`,
    `${SALT}_permisos`,
    `${SALT}:permisos`,
    `${SALT}permissions`,
    `${SALT}_permissions`,
    `${SALT}:permissions`,
  ]))
  const mins = Array.from(new Set([MIN, 0, 6, 8, 10]))
  for (const s of salts) for (const m of mins) CANDIDATES_BASE.push(makeCandidate(s, m, ALPH || undefined))
}

let ACTIVE_DECODER: Hashids | null = CANDIDATES_BASE.length ? CANDIDATES_BASE[0].inst : null
let ACTIVE_DECODER_DESC = SALT ? `SALT=${SALT} MIN=${MIN}${ALPH ? " ALPH(custom)" : ""}` : "none"

function decodeWith(h: Hashids | null, hid: string): number | null {
  if (!hid) return null
  if (/^\d+$/.test(hid)) return Number(hid) // already numeric
  if (!h) return null
  const arr = h.decode(hid)
  if (Array.isArray(arr) && arr.length && typeof arr[0] === "number") return arr[0] as number
  const hex = (h as any).decodeHex?.(hid)
  if (typeof hex === "string" && hex.length) {
    const n = parseInt(hex, 16)
    if (Number.isFinite(n)) return n
  }
  return null
}
function tryDecodeWithCandidates(hid: string, candidates: HashidsCandidate[]): number | null {
  for (const c of candidates) {
    const n = decodeWith(c.inst, hid)
    if (typeof n === "number" && n > 0) {
      ACTIVE_DECODER = c.inst
      ACTIVE_DECODER_DESC = `SALT=${c.salt} MIN=${c.min}${c.alph ? " ALPH(custom)" : ""}`
      return n
    }
  }
  return null
}
function decodePermId(hid: string): number | null {
  if (/^\d+$/.test(hid)) return Number(hid)
  const nA = decodeWith(ACTIVE_DECODER, hid)
  if (typeof nA === "number") return nA
  return tryDecodeWithCandidates(hid, CANDIDATES_BASE)
}
function ensureNumericPermissions(hids: string[]): number[] {
  const out: number[] = []
  for (const v of hids) {
    const n = decodePermId(v)
    if (typeof n === "number" && Number.isFinite(n)) out.push(n)
    else throw new Error(`No se pudo convertir el permiso "${v}" a entero. No se logró decodificar con Hashids.`)
  }
  return out
}

// ================= Tipos/normalizadores =================
type RawRole = any
interface RoleRow {
  id: string
  nombre: string
  descripcion: string
  permisosCount: number
}
interface PermissionItem {
  hid: string        // hash (o string numérica)
  nid: number | null // id numérico (decodificado)
  nombre: string
  descripcion?: string | null
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
function extractPermissionHids(perms: any): string[] {
  if (!perms) return []
  if (Array.isArray(perms)) {
    return perms.map((p: any) =>
      typeof p === "string" ? p :
      typeof p === "number" ? String(p) :
      String(p?.id ?? p?.permission_id ?? "")
    ).filter(Boolean)
  }
  if (typeof perms === "object") return Object.keys(perms)
  return []
}

// ================= Componente =================
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

  const [form, setForm] = useState({ nombre: "", descripcion: "" })

  // ===== Permisos =====
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [byHid, setByHid] = useState<Map<string, PermissionItem>>(new Map())
  const [byNid, setByNid] = useState<Map<number, PermissionItem>>(new Map())
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [permLoading, setPermLoading] = useState(false)
  const [permError, setPermError] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [permQuery, setPermQuery] = useState("")
  const [decoderInfo, setDecoderInfo] = useState(ACTIVE_DECODER_DESC)

  // Prefetch flag
  const [permsLoaded, setPermsLoaded] = useState(false)

  const selectedCount = selectedPerms.size

  // Prefetch de permisos cuando se puede ver
  useEffect(() => {
    if (canView && !permsLoaded) {
      void fetchPermissions()
    }
  }, [canView, permsLoaded])

  function togglePerm(hid: string, checked: boolean | string) {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      if (checked) next.add(hid)
      else next.delete(hid)
      return next
    })
  }

  async function fetchPermissions() {
    setPermLoading(true); setPermError(null)
    try {
      const raw = await api("/permissions")
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []

      // Preliminar
      const prelim = list.map((p) => {
        const hid = String(p?.id ?? p?.permission_id ?? p?.uuid ?? "")
        const nombre = String(p?.nombre ?? p?.name ?? p?.slug ?? "permiso")
        const descripcion = p?.descripcion ?? p?.description ?? null
        return { hid, nombre, descripcion }
      }).filter(p => p.hid)

      // Auto–descubre decoder con 1–2 muestras no numéricas
      const samples = prelim.map(x => x.hid).filter(id => !/^\d+$/.test(id)).slice(0, 2)
      for (const s of samples) {
        const probe = decodePermId(s)
        if (typeof probe === "number" && probe > 0) break
      }

      // Mapea con nid ya calculado
      const mapped: PermissionItem[] = prelim.map(p => ({
        hid: p.hid,
        nid: decodePermId(p.hid),
        nombre: p.nombre,
        descripcion: p.descripcion
      }))

      setPermissions(mapped)

      // índices
      const _byHid = new Map<string, PermissionItem>()
      const _byNid = new Map<number, PermissionItem>()
      for (const it of mapped) {
        _byHid.set(it.hid, it)
        if (typeof it.nid === "number") _byNid.set(it.nid, it)
      }
      setByHid(_byHid); setByNid(_byNid)
      setDecoderInfo(ACTIVE_DECODER_DESC)
      setPermsLoaded(true)

      if (typeof window !== "undefined") {
        console.info("[roles] Hashids decoder activo:", ACTIVE_DECODER_DESC)
      }
    } catch (e: any) {
      setPermError(e?.message || "No se pudieron cargar los permisos")
    } finally {
      setPermLoading(false)
    }
  }

  async function fetchRoles() {
    if (!canView) {
      setAuthIssue({ code: 403, msg: "No tienes el permiso requerido: gestionar_roles o ver_permisos." })
      return
    }
    setLoading(true); setError(null); setAuthIssue(null)
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
    } finally { setLoading(false) }
  }
  useEffect(() => { fetchRoles() }, [canView])

  const groupedPermissions = useMemo(() => {
    const q = permQuery.trim().toLowerCase()
    const filtered = q
      ? permissions.filter(p =>
          p.nombre.toLowerCase().includes(q) ||
          (p.descripcion ? String(p.descripcion).toLowerCase().includes(q) : false)
        )
      : permissions

    const groups: Record<string, PermissionItem[]> = {}
    for (const p of filtered) {
      const prefix = p.nombre.includes("_") ? p.nombre.split("_")[0] : "otros"
      groups[prefix] ||= []
      groups[prefix].push(p)
    }
    return Object.entries(groups)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([k, arr]) => [k, arr.sort((a,b) => a.nombre.localeCompare(b.nombre))] as const)
  }, [permissions, permQuery])

  // === Mejora 2: seleccionar todo/ninguno por grupo ===
  function setGroup(groupKey: string, checked: boolean) {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      const grp = groupedPermissions.find(([g]) => g === groupKey)
      if (grp) {
        for (const p of grp[1]) checked ? next.add(p.hid) : next.delete(p.hid)
      }
      return next
    })
  }

  function buildPayloadPermissions(): number[] {
    const hids = Array.from(selectedPerms)
    return ensureNumericPermissions(hids)
  }

  async function createRole() {
    setSubmitting(true); setError(null); setSuccess(null)
    try {
      const payload: any = {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        permissions: buildPayloadPermissions(),
      }
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
      const payload: any = {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        permissions: buildPayloadPermissions(),
      }
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

  async function deleteRole(id: string) {
    if (!canDelete) return
    const ok = typeof window !== "undefined" ? window.confirm("¿Eliminar este rol? Esta acción es reversible (soft delete).") : true
    if (!ok) return
    setSubmitting(true); setError(null); setSuccess(null)
    try {
      await api(`/roles/${encodeURIComponent(id)}`, { method: "DELETE" }, { expectJson: false })
      setSuccess("Rol eliminado")
      await fetchRoles()
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar el rol")
    } finally { setSubmitting(false) }
  }

  const openCreate = async () => {
    setEditing(null)
    setForm({ nombre: "", descripcion: "" })
    setSelectedPerms(new Set())
    setPermQuery("")
    setIsDialogOpen(true)
    setError(null)
    setSuccess(null)
    if (!permsLoaded) await fetchPermissions() // Mejora 3: prefetch
  }

  async function openEdit(r: RoleRow) {
    setEditing(r)
    setIsDialogOpen(true)
    setError(null)
    setSuccess(null)
    setForm({ nombre: r.nombre, descripcion: r.descripcion })
    setSelectedPerms(new Set())
    setPermQuery("")
    if (!permsLoaded) await fetchPermissions() // Mejora 3: prefetch
    if (!canEdit) return
    setLoadingDetail(true)
    try {
      const detail = await api(`/roles/${encodeURIComponent(r.id)}`)
      const nombre = detail?.nombre ?? detail?.name ?? r.nombre
      const descripcion = detail?.descripcion ?? detail?.description ?? r.descripcion
      setForm({ nombre: String(nombre), descripcion: String(descripcion ?? "") })

      const rawPerms = detail?.permisos ?? detail?.permissions ?? []
      const hids: string[] = []
      const items = Array.isArray(rawPerms) ? rawPerms : Object.keys(rawPerms ?? {})

      for (const it of items) {
        if (typeof it === "string") hids.push(it)
        else if (typeof it === "number") {
          const found = byNid.get(it)
          hids.push(found?.hid ?? String(it))
        } else if (it && typeof it === "object") {
          const v = it.id ?? it.permission_id
          if (typeof v === "number") hids.push(byNid.get(v)?.hid ?? String(v))
          else if (typeof v === "string") hids.push(v)
        }
      }
      setSelectedPerms(new Set(hids.filter(Boolean)))
    } catch { /* noop */ }
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
          {SALT ? (
            <p className="mt-2 text-xs text-muted-foreground">Decoder: {decoderInfo}</p>
          ) : (
            <p className="mt-2 text-sm text-amber-600">
              Falta <code>NEXT_PUBLIC_HASHIDS_SALT</code>. No se podrán convertir permisos hasheados.
            </p>
          )}
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
            <DialogContent className="sm:max-w-[820px]">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
                <DialogDescription>
                  {editing ? "Actualiza el rol y sus permisos." : "Crea un rol y selecciona los permisos que aplican."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Administrador, Gerente…"
                      disabled={editing ? !canEdit : !canCreate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      placeholder="Rol con privilegios…"
                      disabled={editing ? !canEdit : !canCreate}
                    />
                  </div>
                </div>

                {/* ======= Permisos (buscador + grupos + checkboxes) ======= */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="permQuery">Permisos</Label>
                      {/* Mejora 1: contador */}
                      <span className="text-xs text-muted-foreground">{selectedCount} seleccionados</span>
                    </div>
                    <Input
                      id="permQuery"
                      placeholder="Buscar permiso (ej. usuarios, crear, oficinas)…"
                      value={permQuery}
                      onChange={(e) => setPermQuery(e.target.value)}
                      disabled={editing ? !canEdit : !canCreate}
                    />
                  </div>

                  {permLoading ? (
                    <p className="text-sm text-muted-foreground">Cargando permisos…</p>
                  ) : permError ? (
                    <p className="text-sm text-destructive">{permError}</p>
                  ) : permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay permisos disponibles.</p>
                  ) : (
                    <div className="max-h-80 overflow-auto rounded-md border p-2">
                      {groupedPermissions.map(([group, items]) => {
                        const disabledHeader = editing ? !canEdit : !canCreate
                        return (
                          <div key={group} className="mb-3">
                            {/* Encabezado de grupo con “Todos / Ninguno” (Mejora 2) */}
                            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground px-1 mb-1">
                              <span>{group}</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="underline hover:opacity-80 disabled:opacity-50"
                                  onClick={() => setGroup(group, true)}
                                  disabled={disabledHeader}
                                >
                                  Todos
                                </button>
                                <span>·</span>
                                <button
                                  type="button"
                                  className="underline hover:opacity-80 disabled:opacity-50"
                                  onClick={() => setGroup(group, false)}
                                  disabled={disabledHeader}
                                >
                                  Ninguno
                                </button>
                              </div>
                            </div>

                            <ul className="space-y-2">
                              {items.map((p) => {
                                const checked = selectedPerms.has(p.hid)
                                const disabled = editing ? !canEdit : !canCreate
                                return (
                                  <li key={p.hid} className="flex items-start gap-2">
                                    <Checkbox
                                      id={`perm-${p.hid}`}
                                      checked={checked}
                                      onCheckedChange={(v) => togglePerm(p.hid, v)}
                                      disabled={disabled}
                                    />
                                    <div className="leading-tight">
                                      <Label htmlFor={`perm-${p.hid}`} className="cursor-pointer">
                                        {p.nombre}{typeof p.nid === "number" ? ` (#${p.nid})` : ""}
                                      </Label>
                                      {p.descripcion && (
                                        <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                                      )}
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {loadingDetail && editing && (
                    <p className="text-xs text-muted-foreground">Cargando permisos del rol…</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button
                  onClick={save}
                  className="bg-primary hover:bg-primary/90"
                  disabled={submitting || !form.nombre || (editing ? !canEdit : !canCreate)}
                >
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
