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
import { useToast } from "@/components/ui/use-toast"

import Hashids from "hashids"

const PH = "placeholder:text-muted-foreground/60"
const CB = "border-secondary"

// hashids
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
  if (/^\d+$/.test(hid)) return Number(hid)
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

type RawRole = any
interface RoleRow {
  id: string
  nombre: string
  descripcion: string
  permisosCount: number
}
interface PermissionItem {
  hid: string       
  nid: number | null 
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


export function RoleManagement() {
  const { user } = useAuth()
  const { toast } = useToast()

  const canView   = useMemo(() => hasPermLib(user, "gestionar_roles") || hasPermLib(user, "ver_permisos"), [user])
  const canCreate = useMemo(() => hasPermLib(user, "gestionar_roles"), [user])
  const canEdit   = canCreate
  const canDelete = canCreate

  const [roles, setRoles] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RoleRow | null>(null)

  const [form, setForm] = useState({ nombre: "", descripcion: "" })

  // permisos
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [byNid, setByNid] = useState<Map<number, PermissionItem>>(new Map())
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [permLoading, setPermLoading] = useState(false)
  const [permQuery, setPermQuery] = useState("")
  const [decoderInfo, setDecoderInfo] = useState(ACTIVE_DECODER_DESC)
  const [permsLoaded, setPermsLoaded] = useState(false)
  const selectedCount = selectedPerms.size

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
    setPermLoading(true)
    try {
      const raw = await api("/permissions")
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []

      const prelim = list.map((p) => {
        const hid = String(p?.id ?? p?.permission_id ?? p?.uuid ?? "")
        const nombre = String(p?.nombre ?? p?.name ?? p?.slug ?? "permiso")
        const descripcion = p?.descripcion ?? p?.description ?? null
        return { hid, nombre, descripcion }
      }).filter(p => p.hid)

      const samples = prelim.map(x => x.hid).filter(id => !/^\d+$/.test(id)).slice(0, 2)
      for (const s of samples) {
        const probe = decodePermId(s)
        if (typeof probe === "number" && probe > 0) break
      }

      const mapped: PermissionItem[] = prelim.map(p => ({
        hid: p.hid,
        nid: decodePermId(p.hid),
        nombre: p.nombre,
        descripcion: p.descripcion
      }))

      setPermissions(mapped)

      const _byNid = new Map<number, PermissionItem>()
      for (const it of mapped) {
        if (typeof it.nid === "number") _byNid.set(it.nid, it)
      }
      setByNid(_byNid)
      setDecoderInfo(ACTIVE_DECODER_DESC)
      setPermsLoaded(true)
      if (typeof window !== "undefined") {
        console.info("[roles] Hashids decoder activo:", ACTIVE_DECODER_DESC)
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudieron cargar los permisos", variant: "destructive" })
    } finally {
      setPermLoading(false)
    }
  }

  async function fetchRoles() {
    if (!canView) {
      toast({ title: "Permisos insuficientes", description: "Requiere gestionar_roles o ver_permisos", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const raw = await api("/roles")
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []
      setRoles(list.map(toRoleRow))
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo cargar la lista de roles", variant: "destructive" })
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
    setSubmitting(true)
    try {
      const payload: any = {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        permissions: buildPayloadPermissions(),
      }
      await api("/roles", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } })
      toast({ title: "Éxito", description: "Rol creado correctamente" })
      setIsDialogOpen(false)
      setForm({ nombre: "", descripcion: "" })
      setSelectedPerms(new Set())
      await fetchRoles()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo crear el rol", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  async function updateRole(id: string) {
    setSubmitting(true)
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
      toast({ title: "Éxito", description: "Rol actualizado" })
      setIsDialogOpen(false)
      setSelectedPerms(new Set())
      await fetchRoles()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo actualizar el rol", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  async function deleteRole(id: string) {
    if (!canDelete) return
    const ok = typeof window !== "undefined" ? window.confirm("¿Eliminar este rol? Esta acción es reversible (soft delete).") : true
    if (!ok) return
    setSubmitting(true)
    try {
      await api(`/roles/${encodeURIComponent(id)}`, { method: "DELETE" }, { expectJson: false })
      toast({ title: "Éxito", description: "Rol eliminado" })
      await fetchRoles()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo eliminar el rol", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const openCreate = async () => {
    setEditing(null)
    setForm({ nombre: "", descripcion: "" })
    setSelectedPerms(new Set())
    setPermQuery("")
    setIsDialogOpen(true)
    if (!permsLoaded) await fetchPermissions()
  }

  async function openEdit(r: RoleRow) {
    setEditing(r)
    setIsDialogOpen(true)
    setForm({ nombre: r.nombre, descripcion: r.descripcion })
    setSelectedPerms(new Set())
    setPermQuery("")
    if (!permsLoaded) await fetchPermissions()
    if (!canEdit) return
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
    } catch (e: any) {
      toast({ title: "Atención", description: "No se pudo precargar el detalle del rol.", variant: "default" })
    }
  }

  const save = () => {
    if (!form.nombre.trim()) {
      toast({ title: "Validación", description: "El nombre del rol es obligatorio." })
      return
    }
    editing ? updateRole(editing.id) : createRole()
  }

  // cards
  const totalRoles = roles.length
  const rolesSinPermisos = roles.filter(r => r.permisosCount === 0).length
  const permisosTotales = roles.reduce((acc, r) => acc + (Number.isFinite(r.permisosCount) ? r.permisosCount : 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Roles</h2>
          {/* <p className="text-muted-foreground">
            Ver requiere <code>gestionar_roles</code> o <code>ver_permisos</code>. CRUD sólo con <code>gestionar_roles</code>.
          </p>
          {SALT ? (
            <p className="mt-2 text-xs text-muted-foreground">Decoder: {decoderInfo}</p>
          ) : (
            <p className="mt-2 text-sm text-amber-600">
              Falta <code>NEXT_PUBLIC_HASHIDS_SALT</code>. No se podrán convertir permisos hasheados.
            </p>
          )} */}
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
            <DialogContent className="sm:max-w-[920px]">
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
                      className={PH}
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
                      className={PH}
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      placeholder="Rol con privilegios…"
                      disabled={editing ? !canEdit : !canCreate}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="permQuery">Permisos</Label>
                      <span className="text-xs text-muted-foreground">{selectedCount} seleccionados</span>
                    </div>
                    <Input
                      id="permQuery"
                      className={PH}
                      placeholder="Buscar permiso (ej. usuarios, crear, oficinas)…"
                      value={permQuery}
                      onChange={(e) => setPermQuery(e.target.value)}
                    />
                  </div>

                  <div className="h-[360px] overflow-auto rounded-md border p-3">
                    {permLoading ? (
                      <p className="text-sm text-muted-foreground">Cargando permisos…</p>
                    ) : groupedPermissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin resultados</p>
                    ) : (
                      <div className="space-y-4">
                        {groupedPermissions.map(([groupKey, items]) => (
                          <div key={groupKey} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-medium capitalize">{groupKey}</h4>
                                <Badge variant="outline">{items.length}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={() => setGroup(groupKey, true)}>
                                  Todo
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setGroup(groupKey, false)}>
                                  Desmarcar
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {items.map((p) => {
                                const checked = selectedPerms.has(p.hid)
                                return (
                                  <label
                                    key={p.hid}
                                    className={`flex items-center gap-2 rounded-md border p-2 ${CB} hover:bg-secondary/20`}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(v) => togglePerm(p.hid, !!v)}
                                    />
                                    <div className="space-y-0.5">
                                      <div className="text-sm font-medium">{p.nombre}</div>
                                      {p.descripcion && (
                                        <div className="text-xs text-muted-foreground">{p.descripcion}</div>
                                      )}
                                    </div>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={save} disabled={submitting || (!canCreate && !canEdit)}>
                  {submitting ? "Guardando..." : editing ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* metricas */}
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

      {/* tabla */}
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
                      <Button variant="outline" size="sm" onClick={() => openEdit(r)} disabled={!canEdit}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteRole(r.id)} disabled={!canDelete}>
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
    </div>
  )
}
