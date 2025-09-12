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
  id: string            // hash devuelto por la API
  name: string
  address: string
  cityName: string      // para mostrar
  stateName: string     // para mostrar
  cityId?: number       // para enviar a la API
  stateId?: number      // para enviar a la API
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

  // IDs que espera el backend
  const cityId =
    typeof row?.ciudad_id === "number" ? row?.ciudad_id
    : typeof row?.city_id === "number" ? row?.city_id
    : undefined

  const stateId =
    typeof row?.estate_id === "number" ? row?.estate_id
    : typeof row?.estado_id === "number" ? row?.estado_id
    : undefined

  // Nombres (solo visual)
  const cityName =
    row?.ciudad?.nombre ??
    row?.municipio ??
    row?.delegacion_municipio ??
    (typeof row?.ciudad === "string" ? row?.ciudad : "") ?? ""

  const stateName =
    row?.estado?.nombre ??
    row?.state?.nombre ??
    "" // si no viene, quedará vacío

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

/* ========= UI -> payload API (create/update) ========= */
function toOfficePayload(form: typeof initialForm) {
  // Convierte a número si viene como string
  const cityIdNum = typeof form.cityId === "string" ? Number(form.cityId) : form.cityId
  const stateIdNum = typeof form.stateId === "string" ? Number(form.stateId) : form.stateId

  return {
    nombre: form.name || undefined,
    telefono: form.phone || undefined,
    correo: form.email || undefined,
    responsable: form.manager || undefined,
    direccion: form.address || undefined,

    // ⚠️ Backend espera IDs numéricos
    ciudad_id: typeof cityIdNum === "number" && !Number.isNaN(cityIdNum) ? cityIdNum : undefined,
    estate_id: typeof stateIdNum === "number" && !Number.isNaN(stateIdNum) ? stateIdNum : undefined, // usa estado_id si tu API lo requiere

    estatus_actividad: form.status === "active",
  }
}

export function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState(initialForm)

  /* ====== GET /offices ====== */
  async function fetchOffices() {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const raw = await api("/offices")
      const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
      setBranches(list.map(toBranch))
    } catch (e: any) {
      setError(e?.message || "No se pudo obtener la lista de oficinas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffices()
  }, [])

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
  const handleAddBranch = () => {
    setEditingBranch(null)
    setFormData(initialForm)
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
    setIsDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleSaveBranch = () => {
    if (editingBranch) updateOffice(editingBranch.id)
    else createOffice()
  }

  const handleDeleteBranch = (id: string) => {
    deleteOffice(id)
  }

  const totalEmployees = useMemo(
    () => branches.reduce((sum, b) => sum + (Number.isFinite(b.employees) ? b.employees : 0), 0),
    [branches]
  )

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
          <Button variant="outline" onClick={fetchOffices} disabled={loading || submitting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Recargar"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddBranch} className="bg-primary hover:bg-primary/90" disabled={submitting}>
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveBranch} className="bg-primary hover:bg-primary/90" disabled={submitting}>
                  {submitting ? "Guardando..." : editingBranch ? "Guardar Cambios" : "Crear Sucursal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
            <div className="text-2xl font-bold">
              {totalEmployees}
            </div>
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
                          onClick={() => handleDeleteBranch(branch.id)}
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
