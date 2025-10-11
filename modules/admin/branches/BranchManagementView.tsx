"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { api } from "@/modules/auth/auth.service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  CODE_RE,
  EMAIL_RE,
  LAT_RE,
  LNG_RE,
  MAX_BRANCH_NAME,
  MAX_CITYTEXT,
  MAX_CODE,
  MAX_MANAGER_NAME,
  MAX_MUNICIPALITY,
  MAX_NEIGHBORHOOD,
  MAX_STREET,
  MIN_BRANCH_NAME,
  PHONE_RE,
  POSTAL_RE,
} from "./constants"
import {
  Branch,
  BranchFilters,
  BranchFormErrors,
  BranchFormState,
  BranchTouched,
  PostalInfo,
  initialBranchForm,
} from "./types"
import { BranchManagementHeader } from "./components/BranchManagementHeader"
import { BranchDialog } from "./components/BranchDialog"
import { BranchFilters as BranchFiltersInputs } from "./components/BranchFilters"
import { BranchTable } from "./components/BranchTable"

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
    typeof row?.ciudad === "number"
      ? row?.ciudad
      : typeof row?.ciudad_id === "number"
      ? row?.ciudad_id
      : typeof row?.city_id === "number"
      ? row?.city_id
      : undefined

  const stateId =
    typeof row?.estate_id === "number"
      ? row?.estate_id
      : typeof row?.estado_id === "number"
      ? row?.estado_id
      : undefined

  const cityName =
    row?.ciudad?.nombre ??
    row?.municipio ??
    row?.delegacion_municipio ??
    (typeof row?.ciudad === "string" ? row?.ciudad : "") ?? ""

  const stateName = row?.estado?.nombre ?? row?.state?.nombre ?? ""
  const status: "active" | "inactive" = row?.estatus_actividad === false ? "inactive" : "active"

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

function validateForm(f: BranchFormState): BranchFormErrors {
  const e: BranchFormErrors = {}

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

function toOfficePayload(form: BranchFormState) {
  const nombre = form.name.trim()
  if (!nombre) throw new Error("El nombre de la sucursal es obligatorio")

  const ciudad = safeNumber(form.cityId)
  const estate_id = safeNumber(form.stateId)
  const lat = safeNumber(form.lat)
  const lng = safeNumber(form.lng)

  const payload: Record<string, unknown> = {
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

function buildQuery(params: Record<string, unknown>) {
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
  const [formData, setFormData] = useState<BranchFormState>(initialBranchForm)
  const [formErrors, setFormErrors] = useState<BranchFormErrors>({})
  const [touched, setTouched] = useState<BranchTouched>({})
  const [submitted, setSubmitted] = useState(false)

  const [filters, setFilters] = useState<BranchFilters>({
    search: "",
    cityId: "",
    estateId: "",
    status: "all",
  })
  const [searchValue, setSearchValue] = useState("")

  const [cpLoading, setCpLoading] = useState(false)
  const [cpInfo, setCpInfo] = useState<PostalInfo | null>(null)
  const postalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { toast } = useToast()
  const { user } = useAuth()

  const userPerms: string[] = (user as any)?.permissions ?? (user as any)?.permisos ?? []
  const has = (perm: string) => userPerms.includes(perm)

  const canView = has("ver_oficinas") || has("ver_todas_oficinas")
  const canCreate = has("crear_oficinas")
  const canEdit = has("editar_oficinas")
  const canDelete = has("eliminar_oficinas")

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    if (postalTimer.current) clearTimeout(postalTimer.current)
    postalTimer.current = setTimeout(() => {
      if (formData.postalCode && POSTAL_RE.test(formData.postalCode)) {
        void fetchPostalInfo(formData.postalCode)
      } else {
        setCpInfo(null)
      }
    }, 300)
    return () => {
      if (postalTimer.current) clearTimeout(postalTimer.current)
    }
  }, [formData.postalCode])

  async function fetchPostalInfo(cp: string) {
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
      setFormData((fd) => ({ ...fd, municipality: municipio || fd.municipality }))
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
      const list: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.result ?? []
      setBranches(list.map(toBranch))
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo obtener la lista de oficinas", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView])

  useEffect(() => {
    fetchOffices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cityId, filters.estateId, filters.status, filters.search])

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingBranch(null)
    setFormData(initialBranchForm)
    setFormErrors({})
    setTouched({})
    setSubmitted(false)
    setCpInfo(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (open) setIsDialogOpen(true)
    else closeDialog()
  }

  const handleFieldChange = <K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      setFormErrors(validateForm(next))
      return next
    })
  }

  const handleFieldBlur = (field: keyof BranchFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setFormErrors(validateForm(formData))
  }

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
      closeDialog()
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
      closeDialog()
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
    setFormData(initialBranchForm)
    setFormErrors({})
    setTouched({})
    setSubmitted(false)
    setCpInfo(null)
    setIsDialogOpen(true)
  }

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      ...initialBranchForm,
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
    setCpInfo(null)
    setIsDialogOpen(true)
  }

  const handleSaveBranch = () => {
    setSubmitted(true)
    const errs = validateForm(formData)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (editingBranch) updateOffice(editingBranch.id)
    else if (canCreate) createOffice()
    else toast({ title: "Permisos", description: "No puedes crear oficinas.", variant: "destructive" })
  }

  const totalEmployees = useMemo(
    () => branches.reduce((sum, b) => sum + (Number.isFinite(b.employees) ? b.employees : 0), 0),
    [branches]
  )

  if (!canView) {
    return (
      <div className="space-y-6">
        <BranchManagementHeader
          loading={false}
          submitting={false}
          canCreate={false}
          onRefresh={() => undefined}
          onCreate={() => undefined}
        />
        <p className="text-muted-foreground">No tienes permisos para ver oficinas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BranchManagementHeader
        loading={loading}
        submitting={submitting}
        canCreate={canCreate}
        onRefresh={fetchOffices}
        onCreate={openCreate}
      />

      <BranchDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingBranch={editingBranch}
        formData={formData}
        formErrors={formErrors}
        touched={touched}
        submitted={submitted}
        cpInfo={cpInfo}
        cpLoading={cpLoading}
        onFieldChange={handleFieldChange}
        onFieldBlur={handleFieldBlur}
        onSubmit={handleSaveBranch}
        onCancel={closeDialog}
        submitting={submitting}
      />

      <BranchTable
        branches={branches}
        loading={loading}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEditBranch}
        onDelete={deleteOffice}
        totalEmployees={totalEmployees}
        filters={
          <BranchFiltersInputs
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            cityId={filters.cityId ?? ""}
            onCityIdChange={(value) => setFilters((prev) => ({ ...prev, cityId: value }))}
            estateId={filters.estateId ?? ""}
            onEstateIdChange={(value) => setFilters((prev) => ({ ...prev, estateId: value }))}
            status={filters.status}
            onStatusChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          />
        }
      />
    </div>
  )
}
