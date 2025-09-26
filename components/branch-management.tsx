"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { api } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
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
import { Building2, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

/* ────────────────────────────────
   Reglas / límites
──────────────────────────────── */
const MAX_BRANCH_NAME = 80
const MIN_BRANCH_NAME = 2
const MAX_MANAGER_NAME = 80
const MAX_STREET = 120
const MAX_NEIGHBORHOOD = 80
const MAX_MUNICIPALITY = 80
const MAX_CITYTEXT = 80
const MAX_CODE = 16

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9()+\-.\s]{7,18}$/
const POSTAL_RE = /^\d{5}$/ // ajustado a 5 dígitos MX
const CODE_RE = /^[A-Za-z0-9_-]+$/
const LAT_RE = /^-?\d+(\.\d+)?$/
const LNG_RE = /^-?\d+(\.\d+)?$/

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
  code?: string
  statusReceiveLeads?: boolean
}

const initialForm = {
  name: "",
  code: "",
  manager: "",
  // switches
  status: "active" as "active" | "inactive",
  statusReceiveLeads: true,
  // contacto
  phone: "",
  email: "",
  // ubicación (API: ciudad y estate_id son IDs)
  cityId: "" as number | string,
  stateId: "" as number | string,
  cityText: "",
  // dirección desglosada
  street: "",
  extNumber: "",
  intNumber: "",
  neighborhood: "",
  municipality: "",
  postalCode: "",
  // geo
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
    typeof row?.ciudad === "number" ? row?.ciudad
    : typeof row?.ciudad_id === "number" ? row?.ciudad_id
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

  const stateName = row?.estado?.nombre ?? row?.state?.nombre ?? ""

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
    code: row?.clave ?? "",
    statusReceiveLeads: row?.estatus_recibir_leads ?? true,
  }
}

function safeNumber(v: string | number): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined
  const n = typeof v === "string" ? Number(v) : v
  return typeof n === "number" && Number.isFinite(n) ? n : undefined
}

/* ────────────────────────────────
   Validación
──────────────────────────────── */
function validateForm(f: FormState): FormErrors {
  const e: FormErrors = {}

  const name = (f.name ?? "").trim()
  if (!name) e.name = "El nombre es obligatorio"
  else if (name.length < MIN_BRANCH_NAME) e.name = `Mínimo ${MIN_BRANCH_NAME} caracteres`
  else if (name.length > MAX_BRANCH_NAME) e.name = `Máximo ${MAX_BRANCH_NAME} caracteres`

  const code = (f.code ?? "").trim()
  if (code) {
    if (code.length > MAX_CODE) e.code = `Máximo ${MAX_CODE} caracteres`
    else if (!CODE_RE.test(code)) e.code = "Usa solo letras, números, guion y guion_bajo"
  }

  const manager = (f.manager ?? "").trim()
  if (manager.length > MAX_MANAGER_NAME) e.manager = `Máximo ${MAX_MANAGER_NAME} caracteres`

  const email = (f.email ?? "").trim()
  if (email && !EMAIL_RE.test(email)) e.email = "Email inválido"

  const phone = (f.phone ?? "").trim()
  if (phone && !PHONE_RE.test(phone)) e.phone = "Teléfono inválido"

  const street = (f.street ?? "").trim()
  if (street.length > MAX_STREET) e.street = `Máximo ${MAX_STREET} caracteres`

  const neighborhood = (f.neighborhood ?? "").trim()
  if (neighborhood.length > MAX_NEIGHBORHOOD) e.neighborhood = `Máximo ${MAX_NEIGHBORHOOD} caracteres`

  const municipality = (f.municipality ?? "").trim()
  if (municipality.length > MAX_MUNICIPALITY) e.municipality = `Máximo ${MAX_MUNICIPALITY} caracteres`

  const cityText = (f.cityText ?? "").trim()
  if (cityText.length > MAX_CITYTEXT) e.cityText = `Máximo ${MAX_CITYTEXT} caracteres`

  const postal = (f.postalCode ?? "").trim()
  if (postal && !POSTAL_RE.test(postal)) e.postalCode = "Código postal inválido"

  const cityId = safeNumber(f.cityId)
  if (cityId === undefined) e.cityId = "La ciudad (ID) es obligatoria y numérica"

  const stateId = safeNumber(f.stateId)
  if (stateId === undefined) e.stateId = "El estado (estate_id) es obligatorio y numérico"

  const latStr = String(f.lat ?? "")
  if (latStr !== "") {
    if (!LAT_RE.test(latStr)) e.lat = "Lat debe ser numérica"
    else {
      const lat = Number(latStr)
      if (lat < -90 || lat > 90) e.lat = "Lat debe estar entre −90 y 90"
    }
  }

  const lngStr = String(f.lng ?? "")
  if (lngStr !== "") {
    if (!LNG_RE.test(lngStr)) e.lng = "Lng debe ser numérica"
    else {
      const lng = Number(lngStr)
      if (lng < -180 || lng > 180) e.lng = "Lng debe estar entre −180 y 180"
    }
  }

  return e
}

/**
 * Payload EXACTO según Swagger
 */
function toOfficePayload(form: FormState) {
  const nombre = form.name.trim()
  if (!nombre) throw new Error("El nombre de la sucursal es obligatorio")

  const ciudad = safeNumber(form.cityId)
  const estate_id = safeNumber(form.stateId)
  const lat = safeNumber(form.lat)
  const lng = safeNumber(form.lng)

  const payload: any = {
    nombre,
    telefono: form.phone?.trim() || undefined,
    correo: form.email?.trim() || undefined,
    responsable: form.manager?.trim() || undefined,
    clave: form.code?.trim() || undefined,
    estatus_actividad: form.status === "active",
    estatus_recibir_leads: !!form.statusReceiveLeads,
    calle: form.street?.trim() || undefined,
    numero_exterior: form.extNumber?.trim() || undefined,
    numero_interior: form.intNumber?.trim() || undefined,
    colonia: form.neighborhood?.trim() || undefined,
    delegacion_municipio: form.municipality?.trim() || undefined,
    codigo_postal: form.postalCode?.trim() || undefined,
    ciudad,
    estate_id,
    lat,
    lng,
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
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  const { toast } = useToast()

  // permisos
  const { user } = useAuth()
  const userPerms: string[] = (user as any)?.permissions ?? (user as any)?.permisos ?? []
  const has = (p: string) => userPerms.includes(p)

  const canView = has("ver_oficinas") || has("ver_todas_oficinas")
  const canCreate = has("crear_oficinas")
  const canEdit = has("editar_oficinas")
  const canDelete = has("eliminar_oficinas")

  const [filters, setFilters] = useState<{ search: string; cityId?: string; estateId?: string; status?: "all" | "active" | "inactive" }>({
    search: "",
    cityId: "",
    estateId: "",
    status: "all",
  })

  const [searchValue, setSearchValue] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchValue })), 300)
    return () => clearTimeout(t)
  }, [searchValue])

  /* ────────────────────────────────
     Lookup por Código Postal
  ───────────────────────────────── */
  const [cpLoading, setCpLoading] = useState(false)
  const [cpInfo, setCpInfo] = useState<{ estado?: string; municipio?: string; colonias: string[] } | null>(null)
  const postalTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchPostalInfo = async (cp: string) => {
    if (!POSTAL_RE.test(cp)) {
      setCpInfo(null)
      return
    }
    setCpLoading(true)
    try {
      const res = await api(`/postal-codes/${encodeURIComponent(cp)}`)
      const estado = res?.estado ?? res?.state ?? ""
      const municipio = res?.municipio ?? res?.delegacion_municipio ?? ""
      const colonias: string[] = Array.isArray(res?.colonias) ? res.colonias : []
      setCpInfo({ estado, municipio, colonias })

      // Autorrellenar municipio (delegacion_municipio)
      setFormData((fd) => ({ ...fd, municipality: municipio || fd.municipality }))
      // Si hay colonias, no forcemos automáticamente la colonia; el usuario elegirá.
    } catch (err: any) {
      setCpInfo(null)
      toast({
        title: "No se pudo obtener el código postal",
        description: err?.message ?? "Verifica que el backend responda /postal-codes/{cp}",
        variant: "destructive",
      })
    } finally {
      setCpLoading(false)
    }
  }

  // Debounce cuando cambia el CP
  useEffect(() => {
    if (postalTimer.current) clearTimeout(postalTimer.current)
    postalTimer.current = setTimeout(() => {
      if (formData.postalCode && POSTAL_RE.test(formData.postalCode)) {
        fetchPostalInfo(formData.postalCode)
      } else {
        setCpInfo(null)
      }
    }, 300)
    return () => {
      if (postalTimer.current) clearTimeout(postalTimer.current)
    }
  }, [formData.postalCode])

  async function fetchOffices() {
    if (!canView) return
    setLoading(true)
    try {
      const query = buildQuery({
        search: filters.search || undefined,
        ciudad: filters.cityId ? Number(filters.cityId) : undefined,
        estate_id: filters.estateId ? Number(filters.estateId) : undefined,
        estatus_actividad:
          filters.status === "all" ? undefined : filters.status === "active" ? true : false,
      })
      const raw = await api(`/offices${query}`)
      const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
      setBranches(list.map(toBranch))
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo obtener la lista de oficinas", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOffices() }, [canView])
  useEffect(() => { fetchOffices() }, [filters.cityId, filters.estateId, filters.status, filters.search, canView])

  async function createOffice() {
    setSubmitted(true)
    const errs = validateForm(formData)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (!canCreate) {
      toast({ title: "Permisos", description: "No puedes crear oficinas.", variant: "destructive" })
      return
    }
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
      setTouched({})
      setSubmitted(false)
      await fetchOffices()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo crear la oficina", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  async function updateOffice(id: string) {
    setSubmitted(true)
    const errs = validateForm(formData)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (!canEdit) {
      toast({ title: "Permisos", description: "No puedes editar oficinas.", variant: "destructive" })
      return
    }
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
      setTouched({})
      setSubmitted(false)
      await fetchOffices()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo actualizar la oficina", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteOffice(id: string) {
    if (!canDelete) {
      toast({ title: "Permisos", description: "No puedes eliminar oficinas.", variant: "destructive" })
      return
    }
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
    setTouched({})
    setSubmitted(false)
    setIsDialogOpen(true)
  }

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      ...initialForm,
      name: branch.name,
      cityId: branch.cityId ?? "",
      stateId: branch.stateId ?? "",
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
      statusReceiveLeads: branch.statusReceiveLeads ?? true,
      code: branch.code ?? "",
    })
    setFormErrors({})
    setTouched({})
    setSubmitted(false)
    setIsDialogOpen(true)
  }

  const handleSaveBranch = () => {
    setSubmitted(true)
    const errs = validateForm(formData)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (editingBranch) updateOffice(editingBranch.id)
    else createOffice()
  }

  /* ────────────────────────────────
     Helpers de UI
  ───────────────────────────────── */
  const inputFocus =
    "placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-secondary"
  const selectFocus = "focus:ring-2 focus:ring-secondary focus:border-secondary"

  const err = (k: keyof FormState) => !!formErrors[k] && (touched[k] || submitted)
  const cls = (k: keyof FormState) =>
    `${inputFocus} ${err(k) ? "border-destructive focus-visible:ring-destructive" : ""}`

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setFormData((fd) => {
      const nf = { ...fd, [k]: v }
      setFormErrors(validateForm(nf))
      return nf
    })
  }
  function onBlurField<K extends keyof FormState>(k: K) {
    setTouched((t) => ({ ...t, [k]: true }))
    setFormErrors(validateForm(formData))
  }

  const totalEmployees = useMemo(
    () => branches.reduce((sum, b) => sum + (Number.isFinite(b.employees) ? b.employees : 0), 0),
    [branches]
  )

  if (!canView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestión de Sucursales</h2>
            <p className="text-muted-foreground">No tienes permisos para ver oficinas.</p>
          </div>
        </div>
      </div>
    )
  }

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

          {canCreate && (
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
                      <Label htmlFor="name">nombre *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setField("name", e.target.value)}
                        onBlur={() => onBlurField("name")}
                        placeholder="Oficina Central"
                        className={cls("name")}
                        aria-invalid={err("name")}
                        aria-describedby={err("name") ? "err-name" : undefined}
                        maxLength={MAX_BRANCH_NAME}
                      />
                      {err("name") && <p id="err-name" className="text-xs text-destructive mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">clave</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setField("code", e.target.value)}
                        onBlur={() => onBlurField("code")}
                        placeholder="OAX001"
                        className={cls("code")}
                        aria-invalid={err("code")}
                        aria-describedby={err("code") ? "err-code" : undefined}
                        maxLength={MAX_CODE}
                      />
                      {err("code") && <p id="err-code" className="text-xs text-destructive mt-1">{formErrors.code}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manager">responsable</Label>
                      <Input
                        id="manager"
                        value={formData.manager}
                        onChange={(e) => setField("manager", e.target.value)}
                        onBlur={() => onBlurField("manager")}
                        placeholder="Juan Pérez"
                        className={cls("manager")}
                        aria-invalid={err("manager")}
                        aria-describedby={err("manager") ? "err-manager" : undefined}
                        maxLength={MAX_MANAGER_NAME}
                      />
                      {err("manager") && <p id="err-manager" className="text-xs text-destructive mt-1">{formErrors.manager}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">correo</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setField("email", e.target.value)}
                        onBlur={() => onBlurField("email")}
                        placeholder="contacto@sigr.com"
                        className={cls("email")}
                        aria-invalid={err("email")}
                        aria-describedby={err("email") ? "err-email" : undefined}
                      />
                      {err("email") && <p id="err-email" className="text-xs text-destructive mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">telefono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        onBlur={() => onBlurField("phone")}
                        placeholder="9531234567"
                        className={cls("phone")}
                        aria-invalid={err("phone")}
                        aria-describedby={err("phone") ? "err-phone" : undefined}
                      />
                      {err("phone") && <p id="err-phone" className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
                    </div>

                    {/* Switches */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">estatus_actividad</Label>
                        <div className="flex h-10 items-center gap-3">
                          <Switch
                            checked={formData.status === "active"}
                            onCheckedChange={(v) => setField("status", v ? "active" : "inactive")}
                          />
                          <span className="text-sm text-muted-foreground">{formData.status === "active" ? "Activa" : "Inactiva"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">estatus_recibir_leads</Label>
                        <div className="flex h-10 items-center gap-3">
                          <Switch
                            checked={!!formData.statusReceiveLeads}
                            onCheckedChange={(v) => setField("statusReceiveLeads", v)}
                          />
                          <span className="text-sm text-muted-foreground">{formData.statusReceiveLeads ? "Sí" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dirección desglosada */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">calle</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => setField("street", e.target.value)}
                        onBlur={() => onBlurField("street")}
                        placeholder="Av. Benito Juárez"
                        className={cls("street")}
                        aria-invalid={err("street")}
                        aria-describedby={err("street") ? "err-street" : undefined}
                        maxLength={MAX_STREET}
                      />
                      {err("street") && <p id="err-street" className="text-xs text-destructive mt-1">{formErrors.street}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="extNumber">numero_exterior</Label>
                      <Input
                        id="extNumber"
                        value={formData.extNumber}
                        onChange={(e) => setField("extNumber", e.target.value)}
                        onBlur={() => onBlurField("extNumber")}
                        placeholder="123"
                        className={cls("extNumber")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intNumber">numero_interior</Label>
                      <Input
                        id="intNumber"
                        value={formData.intNumber}
                        onChange={(e) => setField("intNumber", e.target.value)}
                        onBlur={() => onBlurField("intNumber")}
                        placeholder="Local A"
                        className={cls("intNumber")}
                      />
                    </div>

                    {/* Colonia (Select dinámico según CP) */}
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">colonia</Label>

                      {cpInfo?.colonias?.length ? (
                        <Select
                          value={formData.neighborhood || undefined}
                          onValueChange={(v) => setField("neighborhood", v)}
                        >
                          <SelectTrigger className={selectFocus}>
                            <SelectValue placeholder="Selecciona colonia" />
                          </SelectTrigger>
                          <SelectContent>
                            {cpInfo.colonias.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="neighborhood"
                          value={formData.neighborhood}
                          onChange={(e) => setField("neighborhood", e.target.value)}
                          onBlur={() => onBlurField("neighborhood")}
                          placeholder="Centro"
                          className={cls("neighborhood")}
                          aria-invalid={err("neighborhood")}
                          aria-describedby={err("neighborhood") ? "err-neighborhood" : undefined}
                          maxLength={MAX_NEIGHBORHOOD}
                        />
                      )}

                      {err("neighborhood") && <p id="err-neighborhood" className="text-xs text-destructive mt-1">{formErrors.neighborhood}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="municipality">delegacion_municipio</Label>
                      <Input
                        id="municipality"
                        value={formData.municipality}
                        onChange={(e) => setField("municipality", e.target.value)}
                        onBlur={() => onBlurField("municipality")}
                        placeholder="Oaxaca de Juárez"
                        className={cls("municipality")}
                        aria-invalid={err("municipality")}
                        aria-describedby={err("municipality") ? "err-municipality" : undefined}
                        maxLength={MAX_MUNICIPALITY}
                      />
                      {/* Hint de CP */}
                      {cpLoading ? (
                        <p className="text-xs text-muted-foreground">Buscando municipio…</p>
                      ) : cpInfo?.municipio ? (
                        <p className="text-xs text-muted-foreground">Detectado: {cpInfo.municipio}</p>
                      ) : null}
                      {err("municipality") && <p id="err-municipality" className="text-xs text-destructive mt-1">{formErrors.municipality}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">codigo_postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setField("postalCode", e.target.value.replace(/\D+/g, "").slice(0, 5))}
                        onBlur={() => onBlurField("postalCode")}
                        placeholder="68000"
                        className={cls("postalCode")}
                        aria-invalid={err("postalCode")}
                        aria-describedby={err("postalCode") ? "err-postalCode" : undefined}
                      />
                      {cpLoading && <p className="text-xs text-muted-foreground">Consultando CP…</p>}
                      {err("postalCode") && <p id="err-postalCode" className="text-xs text-destructive mt-1">{formErrors.postalCode}</p>}
                    </div>

                    {/* Estado detectado (solo lectura) */}
                    <div className="space-y-2">
                      <Label htmlFor="stateDetected">estado (auto)</Label>
                      <Input
                        id="stateDetected"
                        value={cpInfo?.estado ?? ""}
                        readOnly
                        placeholder="—"
                        className={inputFocus}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cityText">Ciudad (texto, opcional)</Label>
                      <Input
                        id="cityText"
                        value={formData.cityText}
                        onChange={(e) => setField("cityText", e.target.value)}
                        onBlur={() => onBlurField("cityText")}
                        placeholder="Oaxaca"
                        className={cls("cityText")}
                        aria-invalid={err("cityText")}
                        aria-describedby={err("cityText") ? "err-cityText" : undefined}
                        maxLength={MAX_CITYTEXT}
                      />
                      {err("cityText") && <p id="err-cityText" className="text-xs text-destructive mt-1">{formErrors.cityText}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cityId">ciudad (ID numérico) *</Label>
                      <Input
                        id="cityId"
                        type="number"
                        value={formData.cityId}
                        onChange={(e) => setField("cityId", e.target.value)}
                        onBlur={() => onBlurField("cityId")}
                        placeholder="1"
                        className={cls("cityId")}
                        aria-invalid={err("cityId")}
                        aria-describedby={err("cityId") ? "err-cityId" : undefined}
                      />
                      {err("cityId") && <p id="err-cityId" className="text-xs text-destructive mt-1">{formErrors.cityId}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stateId">estate_id (ID numérico) *</Label>
                      <Input
                        id="stateId"
                        type="number"
                        value={formData.stateId}
                        onChange={(e) => setField("stateId", e.target.value)}
                        onBlur={() => onBlurField("stateId")}
                        placeholder="1"
                        className={cls("stateId")}
                        aria-invalid={err("stateId")}
                        aria-describedby={err("stateId") ? "err-stateId" : undefined}
                      />
                      {err("stateId") && <p id="err-stateId" className="text-xs text-destructive mt-1">{formErrors.stateId}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lat">lat</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setField("lat", e.target.value)}
                        onBlur={() => onBlurField("lat")}
                        placeholder="17.0654"
                        className={cls("lat")}
                        aria-invalid={err("lat")}
                        aria-describedby={err("lat") ? "err-lat" : undefined}
                      />
                      {err("lat") && <p id="err-lat" className="text-xs text-destructive mt-1">{formErrors.lat}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lng">lng</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) => setField("lng", e.target.value)}
                        onBlur={() => onBlurField("lng")}
                        placeholder="-96.7236"
                        className={cls("lng")}
                        aria-invalid={err("lng")}
                        aria-describedby={err("lng") ? "err-lng" : undefined}
                      />
                      {err("lng") && <p id="err-lng" className="text-xs text-destructive mt-1">{formErrors.lng}</p>}
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
          )}
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
              placeholder="ciudad (ID)"
              type="number"
              value={filters.cityId}
              onChange={(e) => setFilters((f) => ({ ...f, cityId: e.target.value }))}
              className={inputFocus}
            />
            <Input
              placeholder="estate_id (ID)"
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
                  <TableHead>Responsable</TableHead>
                  {(canEdit || canDelete) && <TableHead className="text-right">Acciones</TableHead>}
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
                    {(canEdit || canDelete) && (
                      <TableCell className="text-right space-x-2">
                        {canEdit && (
                          <Button variant="outline" size="sm" onClick={() => handleEditBranch(b)}>
                            <Edit className="h-4 w-4 mr-1" /> Editar
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="destructive" size="sm" onClick={() => deleteOffice(b.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}

                {branches.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={canEdit || canDelete ? 6 : 5} className="text-center text-muted-foreground py-8">
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
