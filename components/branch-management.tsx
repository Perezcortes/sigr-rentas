"use client"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, RefreshCw } from "lucide-react"

/* ===== Tipos ===== */
interface Branch {
  id: string
  name: string
  address: string
  cityName: string
  stateName: string
  cityId?: number
  stateId?: number
  phone: string
  email: string
  manager: string
  status: "active" | "inactive"
  employees: number
}

const initialForm = {
  name: "",
  address: "",
  cityId: "" as number | string,
  stateId: "" as number | string,
  phone: "",
  email: "",
  manager: "",
  status: "active" as "active" | "inactive",
}

type FormState = typeof initialForm
type FormErrors = Partial<Record<keyof FormState, string>>

/* ========= Normalizador API -> UI ========= */
function toBranch(row: any): Branch {
  const id = String(row?.id ?? row?.uuid ?? crypto.randomUUID())
  const nombre = row?.nombre ?? row?.name ?? "Sin nombre"

  const calle = row?.calle ?? ""
  const numExt = row?.numero_exterior ?? ""
  const numInt = row?.numero_interior ? ` Int. ${row?.numero_interior}` : ""
  const colonia = row?.colonia ?? row?.colonia_barrio ?? ""
  const addressParts = [calle, numExt, numInt, colonia].filter(Boolean)
  const address = row?.direccion ?? (addressParts.join(", ") || "")

  const cityId =
    typeof row?.ciudad_id === "number" ? row?.ciudad_id
    : typeof row?.city_id === "number" ? row?.city_id
    : undefined

  const stateId =
    typeof row?.estate_id === "number" ? row?.estate_id
    : typeof row?.estado_id === "number" ? row?.estado_id
    : undefined

  const cityName =
    row?.ciudad?.nombre ??
    row?.municipio ??
    row?.delegacion_municipio ??
    (typeof row?.ciudad === "string" ? row?.ciudad : "") ?? ""

  const stateName =
    row?.estado?.nombre ??
    row?.state?.nombre ??
    ""

  const status: "active" | "inactive" =
    row?.estatus_actividad === false ? "inactive" : "active"

  return {
    id,
    name: String(nombre),
    address,
    cityName: String(cityName),
    stateName: String(stateName),
    cityId,
    stateId,
    phone: String(row?.telefono ?? ""),
    email: String(row?.correo ?? ""),
    manager: String(row?.responsable ?? ""),
    status,
    employees: Number(row?.empleados ?? 0),
  }
}

/* ===== Helpers ===== */
function safeNumber(v: string | number): number | undefined {
  const n = typeof v === "string" ? Number(v) : v
  return typeof n === "number" && Number.isFinite(n) ? n : undefined
}

function validateForm(f: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!f.name || !f.name.trim()) errors.name = "El nombre es obligatorio"
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = "Email inválido"
  return errors
}

/* ========= UI -> payload API (create/update) ========= */
function toOfficePayload(form: FormState) {
  const nombre = form.name.trim()
  if (!nombre) throw new Error("El nombre de la sucursal es obligatorio")

  const payload: any = {
    nombre,
    telefono: form.phone?.trim() || undefined,
    correo: form.email?.trim() || undefined,
    responsable: form.manager?.trim() || undefined,
    direccion: form.address?.trim() || undefined,
    ciudad_id: safeNumber(form.cityId),
    estate_id: safeNumber(form.stateId),
    estatus_actividad: form.status === "active",
  }
  // Si tu tabla exige 'clave' NOT NULL, puedes generar una por defecto:
  // payload.clave = `${nombre.slice(0,3).toUpperCase()}-${Date.now()}`
  return payload
}

/* ===== Querystring + debounce ===== */
function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (typeof v === "string" && v.trim() === "") return
    q.append(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ""
}

export function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState<FormState>(initialForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Filtros
  const [filters, setFilters] = useState<{
    search: string
    cityId?: string
    estateId?: string
    status?: "all" | "active" | "inactive"
  }>({ search: "", cityId: "", estateId: "", status: "all" })

  // Debounce del search
  const [searchValue, setSearchValue] = useState("")
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchValue }))
    }, 300)
    return () => clearTimeout(t)
  }, [searchValue])

  /* ====== GET /offices (con filtros) ====== */
  async function fetchOffices(opts?: { keepMessages?: boolean }) {
    setLoading(true)
    if (!opts?.keepMessages) { setError(null); setSuccess(null) }

    try {
      const query = buildQuery({
        search: filters.search || undefined,
        cityId: filters.cityId ? Number(filters.cityId) : undefined,
        estateId: filters.estateId ? Number(filters.estateId) : undefined,
        estatus_actividad:
          filters.status === "all"
            ? undefined
            : filters.status === "active"
            ? true
            : false,
      })

      const raw = await api(`/offices${query}`)
      const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
      setBranches(list.map(toBranch))
    } catch (e: any) {
      setError(e?.message || "No se pudo obtener la lista de oficinas")
    } finally {
      setLoading(false)
    }
  }

  // Carga inicial
  useEffect(() => {
    fetchOffices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refetch cuando cambian filtros
  useEffect(() => {
    fetchOffices({ keepMessages: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cityId, filters.estateId, filters.status, filters.search])

  /* ====== POST /offices ====== */
  async function createOffice() {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = toOfficePayload(formData)
      await api("/offices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setSuccess("Oficina creada correctamente")
      setIsDialogOpen(false)
      setFormData(initialForm)
      await fetchOffices()
    } catch (e: any) {
      setError(e?.message || "No se pudo crear la oficina")
    } finally {
      setSubmitting(false)
    }
  }

  /* ====== PATCH /offices/{id} ====== */
  async function updateOffice(id: string) {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = toOfficePayload(formData)
      await api(`/offices/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setSuccess("Oficina actualizada")
      setIsDialogOpen(false)
      setFormData(initialForm)
      await fetchOffices()
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar la oficina")
    } finally {
      setSubmitting(false)
    }
  }

  /* ====== DELETE /offices/{id} ====== */
  async function deleteOffice(id: string) {
    const ok = typeof window !== "undefined" ? window.confirm("¿Eliminar esta oficina?") : true
    if (!ok) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await api(`/offices/${encodeURIComponent(id)}`, { method: "DELETE" }, { expectJson: false })
      setSuccess("Oficina eliminada")
      await fetchOffices()
    } catch (e: any) {
      setError(e?.message || "No se pudo eliminar la oficina")
    } finally {
      setSubmitting(false)
    }
  }

  /* ====== UI handlers ====== */
  const openCreate = () => {
    setEditingBranch(null)
    setFormData(initialForm)
    setFormErrors({})
    setIsDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      address: branch.address,
      cityId: branch.cityId ?? "",
      stateId: branch.stateId ?? "",
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
    })
    setFormErrors({})
    setIsDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleSaveBranch = () => {
    const errs = validateForm(formData)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (editingBranch) updateOffice(editingBranch.id)
    else createOffice()
  }

  const totalEmployees = useMemo(
    () => branches.reduce((sum, b) => sum + (Number.isFinite(b.employees) ? b.employees : 0), 0),
    [branches]
  )

  const saving = submitting
  const saveDisabled = saving || !formData.name.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Sucursales</h2>
          <p className="text-muted-foreground">Administra las sucursales y oficinas del sistema.</p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchOffices()} disabled={loading || submitting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Recargar"}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="bg-primary hover:bg-primary/90" disabled={submitting}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Sucursal
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle>{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</DialogTitle>
                <DialogDescription>
                  {editingBranch ? "Modifica los datos de la sucursal" : "Completa la información para crear una nueva sucursal"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre de la sucursal"
                    />
                    {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Responsable / Gerente</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cityId">Ciudad (ID numérico)</Label>
                    <Input
                      id="cityId"
                      type="number"
                      value={formData.cityId}
                      onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                      placeholder="Ej. 125"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateId">Estado (ID numérico)</Label>
                    <Input
                      id="stateId"
                      type="number"
                      value={formData.stateId}
                      onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                      placeholder="Ej. 20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+52 55 1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sucursal@empresa.com"
                    />
                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado de actividad</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveBranch} className="bg-primary hover:bg-primary/90" disabled={saveDisabled}>
                  {saving ? "Guardando..." : editingBranch ? "Guardar Cambios" : "Crear Sucursal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>Busca por nombre, responsable, clave o correo; y filtra por ciudad/estado/estatus.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          {/* Search (debounced) */}
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="search">Búsqueda</Label>
            <Input
              id="search"
              placeholder="oficina, responsable, clave o correo"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="f-cityId">Ciudad (ID)</Label>
            <Input
              id="f-cityId"
              type="number"
              inputMode="numeric"
              placeholder="1"
              value={filters.cityId}
              onChange={(e) => setFilters((f) => ({ ...f, cityId: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="f-estateId">Estado (ID)</Label>
            <Input
              id="f-estateId"
              type="number"
              inputMode="numeric"
              placeholder="1"
              value={filters.estateId}
              onChange={(e) => setFilters((f) => ({ ...f, estateId: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="f-status">Estatus</Label>
            <Select
              value={filters.status}
              onValueChange={(v: "all" | "active" | "inactive") =>
                setFilters((f) => ({ ...f, status: v }))
              }
            >
              <SelectTrigger id="f-status"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="inactive">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Acciones */}
          <div className="md:col-span-5 flex gap-2">
            <Button variant="outline" onClick={() => fetchOffices()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Aplicar / Recargar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchValue("")
                setFilters({ search: "", cityId: "", estateId: "", status: "all" })
              }}
              disabled={loading}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sucursales</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucursales Activas</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.filter((b) => b.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Sucursales</CardTitle>
          <CardDescription>Gestiona todas las sucursales del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando oficinas…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sucursal</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Empleados</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {branch.cityName || branch.cityId || "—"}, {branch.stateName || branch.stateId || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                          {branch.phone || "—"}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                          {branch.email || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{branch.manager || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                        {branch.status === "active" ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>{branch.employees}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditBranch(branch)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOffice(branch.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {branches.length === 0 && !error && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No hay oficinas para mostrar.
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
