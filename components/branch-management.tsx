"use client"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/auth"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Building2, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
  code: "",
  manager: "",
  status: "active" as "active" | "inactive",
  statusReceiveLeads: true,
  phone: "",
  email: "",
  cityId: "" as number | string,
  stateId: "" as number | string,
  cityText: "",
  address: "",
  street: "", 
  extNumber: "",  
  intNumber: "",     
  neighborhood: "", 
  municipality: "", 
  postalCode: "",    
  lat: "" as number | string,
  lng: "" as number | string,
}

type FormState = typeof initialForm
type FormErrors = Partial<Record<keyof FormState, string>>

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

function safeNumber(v: string | number): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined
  const n = typeof v === "string" ? Number(v) : v
  return typeof n === "number" && Number.isFinite(n) ? n : undefined
}

function validateForm(f: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!f.name || !f.name.trim()) errors.name = "El nombre es obligatorio"
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = "Email inválido"

  const lat = safeNumber(f.lat)
  const lng = safeNumber(f.lng)
  if (f.lat !== "" && lat === undefined) errors.lat = "Lat debe ser numérica"
  if (f.lng !== "" && lng === undefined) errors.lng = "Lng debe ser numérica"

  return errors
}

function toOfficePayload(form: FormState) {
  const nombre = form.name.trim()
  if (!nombre) throw new Error("El nombre de la sucursal es obligatorio")

  const ciudadId = safeNumber(form.cityId)
  const estadoId = safeNumber(form.stateId)
  const lat = safeNumber(form.lat)
  const lng = safeNumber(form.lng)

  const payload: any = {
    nombre,
    telefono: form.phone?.trim() || undefined,
    correo: form.email?.trim() || undefined,
    responsable: form.manager?.trim() || undefined,
    clave: form.code?.trim() || undefined,
    calle: form.street?.trim() || undefined,
    numero_exterior: form.extNumber?.trim() || undefined,
    numero_interior: form.intNumber?.trim() || undefined,
    colonia: form.neighborhood?.trim() || undefined,
    delegacion_municipio: form.municipality?.trim() || undefined,
    codigo_postal: form.postalCode?.trim() || undefined,
    ciudad: form.cityText?.trim() || undefined, 
    lat,
    lng,
    direccion: form.address?.trim() || undefined, 
    ciudad_id: ciudadId,
    estate_id: estadoId,
    estado_id: estadoId,

    estatus_actividad: form.status === "active",
    estatus_recibir_leads: !!form.statusReceiveLeads,
  }
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined || payload[k] === "") delete payload[k]
  })

  return payload
}

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

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState<FormState>(initialForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const { toast } = useToast()

  const [filters, setFilters] = useState<{
    search: string
    cityId?: string
    estateId?: string
    status?: "all" | "active" | "inactive"
  }>({ search: "", cityId: "", estateId: "", status: "all" })

  const [searchValue, setSearchValue] = useState("")
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchValue }))
    }, 300)
    return () => clearTimeout(t)
  }, [searchValue])

  async function fetchOffices(opts?: { keepMessages?: boolean }) {
    setLoading(true)

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
      toast({
        title: "Error",
        description: e?.message || "No se pudo obtener la lista de oficinas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  useEffect(() => {
    fetchOffices({ keepMessages: true })
  }, [filters.cityId, filters.estateId, filters.status, filters.search])

  async function createOffice() {
    setSubmitting(true)
    try {
      const payload = toOfficePayload(formData)
      await api("/offices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      toast({ title: "Éxito", description: "Oficina creada correctamente" })
      setIsDialogOpen(false)
      setFormData(initialForm)
      await fetchOffices()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo crear la oficina", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }
  async function updateOffice(id: string) {
    setSubmitting(true)
    try {
      const payload = toOfficePayload(formData)
      await api(`/offices/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      toast({ title: "Éxito", description: "Oficina actualizada" })
      setIsDialogOpen(false)
      setFormData(initialForm)
      await fetchOffices()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo actualizar la oficina", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteOffice(id: string) {
    const ok = typeof window !== "undefined" ? window.confirm("¿Eliminar esta oficina?") : true
    if (!ok) return

    setSubmitting(true)
    try {
      await api(`/offices/${encodeURIComponent(id)}`, { method: "DELETE" }, { expectJson: false })
      toast({ title: "Éxito", description: "Oficina eliminada" })
      await fetchOffices()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo eliminar la oficina", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const openCreate = () => {
    setEditingBranch(null)
    setFormData(initialForm)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData((prev) => ({
      ...initialForm,
      name: branch.name,
      address: branch.address,
      cityId: branch.cityId ?? "",
      stateId: branch.stateId ?? "",
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
      statusReceiveLeads: true,
    }))
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleSaveBranch = () => {
    const errs = validateForm(formData)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast({
        title: "Validación",
        description: "Revisa los campos marcados en el formulario.",
      })
      return
    }
    if (editingBranch) updateOffice(editingBranch.id)
    else createOffice()
  }

  const totalEmployees = useMemo(
    () => branches.reduce((sum, b) => sum + (Number.isFinite(b.employees) ? b.employees : 0), 0),
    [branches]
  )

  const inputFocus =
    "placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-secondary"
  const selectFocus = "focus:ring-2 focus:ring-secondary focus:border-secondary"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Sucursales</h2>
          <p className="text-muted-foreground">Administra las sucursales y oficinas del sistema.</p>
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

            <DialogContent className="sm:max-w-[860px]">
              <DialogHeader>
                <DialogTitle>{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</DialogTitle>
                <DialogDescription>
                  {editingBranch ? "Modifica los datos de la sucursal" : "Completa la información para crear una nueva sucursal"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre de la sucursal"
                      className={inputFocus}
                    />
                    {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Clave</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ej. OAX01"
                      className={inputFocus}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager">Responsable / Gerente</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="Nombre del responsable"
                      className={inputFocus}
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
                      className={inputFocus}
                    />
                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
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
                      className={inputFocus}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado de actividad</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className={selectFocus}>
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="inactive">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección (compacta, opcional)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle, número, colonia"
                    className={inputFocus}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Calle</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Av. Benito Juárez"
                      className={inputFocus}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extNumber">No. exterior</Label>
                    <Input
                      id="extNumber"
                      value={formData.extNumber}
                      onChange={(e) => setFormData({ ...formData, extNumber: e.target.value })}
                      placeholder="123"
                      className={inputFocus}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intNumber">No. interior</Label>
                    <Input
                      id="intNumber"
                      value={formData.intNumber}
                      onChange={(e) => setFormData({ ...formData, intNumber: e.target.value })}
                      placeholder="A-2"
                      className={inputFocus}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Colonia</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Centro"
                      className={inputFocus}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="municipality">Delegación/Municipio</Label>
                    <Input
                      id="municipality"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      placeholder="Oaxaca de Juárez"
                      className={inputFocus}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="68000"
                      className={inputFocus}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cityText">Ciudad (texto)</Label>
                    <Input
                      id="cityText"
                      value={formData.cityText}
                      onChange={(e) => setFormData({ ...formData, cityText: e.target.value })}
                      placeholder="Oaxaca"
                      className={inputFocus}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cityId">Ciudad (ID numérico)</Label>
                    <Input
                      id="cityId"
                      type="number"
                      value={formData.cityId}
                      onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                      placeholder="Ej. 125"
                      className={inputFocus}
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
                      className={inputFocus}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lat">Lat</Label>
                    <Input
                      id="lat"
                      type="number"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="17.0654"
                      className={inputFocus}
                    />
                    {formErrors.lat && <p className="text-xs text-destructive">{formErrors.lat}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Lng</Label>
                    <Input
                      id="lng"
                      type="number"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      placeholder="−96.7236"
                      className={inputFocus}
                    />
                    {formErrors.lng && <p className="text-xs text-destructive">{formErrors.lng}</p>}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveBranch} disabled={submitting}>
                  {submitting ? "Guardando..." : editingBranch ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* tabla */}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Buscar por nombre, ciudad, responsable…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={inputFocus}
            />
            <Input
              placeholder="Ciudad ID"
              type="number"
              value={filters.cityId}
              onChange={(e) => setFilters((f) => ({ ...f, cityId: e.target.value }))}
              className={inputFocus}
            />
            <Input
              placeholder="Estado ID"
              type="number"
              value={filters.estateId}
              onChange={(e) => setFilters((f) => ({ ...f, estateId: e.target.value }))}
              className={inputFocus}
            />
            <Select
              value={filters.status}
              onValueChange={(v: "all" | "active" | "inactive") => setFilters((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger className={selectFocus}>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Gerente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
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
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditBranch(b)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteOffice(b.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {branches.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay sucursales para mostrar.
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
