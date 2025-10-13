import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  INPUT_FOCUS,
  MAX_BRANCH_NAME,
  MAX_CITYTEXT,
  MAX_CODE,
  MAX_MANAGER_NAME,
  MAX_MUNICIPALITY,
  MAX_NEIGHBORHOOD,
  MAX_STREET,
  SELECT_FOCUS,
} from "../constants"
import type {
  Branch,
  BranchFormErrors,
  BranchFormState,
  BranchTouched,
  PostalInfo,
} from "../types"

export type BranchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingBranch: Branch | null
  formData: BranchFormState
  formErrors: BranchFormErrors
  touched: BranchTouched
  submitted: boolean
  cpInfo: PostalInfo | null
  cpLoading: boolean
  onFieldChange: <K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) => void
  onFieldBlur: (field: keyof BranchFormState) => void
  onSubmit: () => void
  onCancel: () => void
  submitting: boolean
}

export function BranchDialog({
  open,
  onOpenChange,
  editingBranch,
  formData,
  formErrors,
  touched,
  submitted,
  cpInfo,
  cpLoading,
  onFieldChange,
  onFieldBlur,
  onSubmit,
  onCancel,
  submitting,
}: BranchDialogProps) {
  const showError = (field: keyof BranchFormState) => !!formErrors[field] && (touched[field] || submitted)
  const fieldClass = (field: keyof BranchFormState) =>
    `${INPUT_FOCUS} ${showError(field) ? "border-destructive focus-visible:ring-destructive" : ""}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</DialogTitle>
          <DialogDescription>
            {editingBranch ? "Modifica los datos de la sucursal" : "Completa la información para crear una nueva sucursal"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">nombre *</Label>
              <Input
                id="branch-name"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                onBlur={() => onFieldBlur("name")}
                placeholder="Oficina Central"
                className={fieldClass("name")}
                aria-invalid={showError("name")}
                aria-describedby={showError("name") ? "err-name" : undefined}
                maxLength={MAX_BRANCH_NAME}
              />
              {showError("name") && <p id="err-name" className="text-xs text-destructive mt-1">{formErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-code">clave</Label>
              <Input
                id="branch-code"
                value={formData.code}
                onChange={(e) => onFieldChange("code", e.target.value)}
                onBlur={() => onFieldBlur("code")}
                placeholder="OAX001"
                className={fieldClass("code")}
                aria-invalid={showError("code")}
                aria-describedby={showError("code") ? "err-code" : undefined}
                maxLength={MAX_CODE}
              />
              {showError("code") && <p id="err-code" className="text-xs text-destructive mt-1">{formErrors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch-manager">responsable</Label>
              <Input
                id="branch-manager"
                value={formData.manager}
                onChange={(e) => onFieldChange("manager", e.target.value)}
                onBlur={() => onFieldBlur("manager")}
                placeholder="Juan Pérez"
                className={fieldClass("manager")}
                aria-invalid={showError("manager")}
                aria-describedby={showError("manager") ? "err-manager" : undefined}
                maxLength={MAX_MANAGER_NAME}
              />
              {showError("manager") && <p id="err-manager" className="text-xs text-destructive mt-1">{formErrors.manager}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-email">correo</Label>
              <Input
                id="branch-email"
                type="email"
                value={formData.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                onBlur={() => onFieldBlur("email")}
                placeholder="contacto@sigr.com"
                className={fieldClass("email")}
                aria-invalid={showError("email")}
                aria-describedby={showError("email") ? "err-email" : undefined}
              />
              {showError("email") && <p id="err-email" className="text-xs text-destructive mt-1">{formErrors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch-phone">telefono</Label>
              <Input
                id="branch-phone"
                value={formData.phone}
                onChange={(e) => onFieldChange("phone", e.target.value)}
                onBlur={() => onFieldBlur("phone")}
                placeholder="9531234567"
                className={fieldClass("phone")}
                aria-invalid={showError("phone")}
                aria-describedby={showError("phone") ? "err-phone" : undefined}
              />
              {showError("phone") && <p id="err-phone" className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">estatus_actividad</Label>
                <div className="flex h-10 items-center gap-3">
                  <Switch
                    checked={formData.status === "active"}
                    onCheckedChange={(v) => onFieldChange("status", v ? "active" : "inactive")}
                  />
                  <span className="text-sm text-muted-foreground">{formData.status === "active" ? "Activa" : "Inactiva"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">estatus_recibir_leads</Label>
                <div className="flex h-10 items-center gap-3">
                  <Switch
                    checked={!!formData.statusReceiveLeads}
                    onCheckedChange={(v) => onFieldChange("statusReceiveLeads", v)}
                  />
                  <span className="text-sm text-muted-foreground">{formData.statusReceiveLeads ? "Sí" : "No"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch-street">calle</Label>
              <Input
                id="branch-street"
                value={formData.street}
                onChange={(e) => onFieldChange("street", e.target.value)}
                onBlur={() => onFieldBlur("street")}
                placeholder="Av. Benito Juárez"
                className={fieldClass("street")}
                aria-invalid={showError("street")}
                aria-describedby={showError("street") ? "err-street" : undefined}
                maxLength={MAX_STREET}
              />
              {showError("street") && <p id="err-street" className="text-xs text-destructive mt-1">{formErrors.street}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-ext-number">numero_exterior</Label>
              <Input
                id="branch-ext-number"
                value={formData.extNumber}
                onChange={(e) => onFieldChange("extNumber", e.target.value)}
                onBlur={() => onFieldBlur("extNumber")}
                placeholder="123"
                className={fieldClass("extNumber")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-int-number">numero_interior</Label>
              <Input
                id="branch-int-number"
                value={formData.intNumber}
                onChange={(e) => onFieldChange("intNumber", e.target.value)}
                onBlur={() => onFieldBlur("intNumber")}
                placeholder="Local A"
                className={fieldClass("intNumber")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-neighborhood">colonia</Label>
              {cpInfo?.colonias?.length ? (
                <Select
                  value={formData.neighborhood || undefined}
                  onValueChange={(v) => onFieldChange("neighborhood", v)}
                >
                  <SelectTrigger className={SELECT_FOCUS}>
                    <SelectValue placeholder="Selecciona colonia" />
                  </SelectTrigger>
                  <SelectContent>
                    {cpInfo.colonias.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="branch-neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => onFieldChange("neighborhood", e.target.value)}
                  onBlur={() => onFieldBlur("neighborhood")}
                  placeholder="Centro"
                  className={fieldClass("neighborhood")}
                  aria-invalid={showError("neighborhood")}
                  aria-describedby={showError("neighborhood") ? "err-neighborhood" : undefined}
                  maxLength={MAX_NEIGHBORHOOD}
                />
              )}
              {showError("neighborhood") && <p id="err-neighborhood" className="text-xs text-destructive mt-1">{formErrors.neighborhood}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch-municipality">delegacion_municipio</Label>
              <Input
                id="branch-municipality"
                value={formData.municipality}
                onChange={(e) => onFieldChange("municipality", e.target.value)}
                onBlur={() => onFieldBlur("municipality")}
                placeholder="Oaxaca de Juárez"
                className={fieldClass("municipality")}
                aria-invalid={showError("municipality")}
                aria-describedby={showError("municipality") ? "err-municipality" : undefined}
                maxLength={MAX_MUNICIPALITY}
              />
              {cpLoading ? (
                <p className="text-xs text-muted-foreground">Buscando municipio…</p>
              ) : cpInfo?.municipio ? (
                <p className="text-xs text-muted-foreground">Detectado: {cpInfo.municipio}</p>
              ) : null}
              {showError("municipality") && <p id="err-municipality" className="text-xs text-destructive mt-1">{formErrors.municipality}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-postal">codigo_postal</Label>
              <Input
                id="branch-postal"
                value={formData.postalCode}
                onChange={(e) => onFieldChange("postalCode", e.target.value.replace(/\D+/g, "").slice(0, 5))}
                onBlur={() => onFieldBlur("postalCode")}
                placeholder="68000"
                className={fieldClass("postalCode")}
                aria-invalid={showError("postalCode")}
                aria-describedby={showError("postalCode") ? "err-postalCode" : undefined}
              />
              {cpLoading && <p className="text-xs text-muted-foreground">Consultando CP…</p>}
              {showError("postalCode") && <p id="err-postalCode" className="text-xs text-destructive mt-1">{formErrors.postalCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-state-detected">estado (auto)</Label>
              <Input id="branch-state-detected" value={cpInfo?.estado ?? ""} readOnly placeholder="—" className={INPUT_FOCUS} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch-city-text">Ciudad (texto, opcional)</Label>
              <Input
                id="branch-city-text"
                value={formData.cityText}
                onChange={(e) => onFieldChange("cityText", e.target.value)}
                onBlur={() => onFieldBlur("cityText")}
                placeholder="Oaxaca"
                className={fieldClass("cityText")}
                aria-invalid={showError("cityText")}
                aria-describedby={showError("cityText") ? "err-cityText" : undefined}
                maxLength={MAX_CITYTEXT}
              />
              {showError("cityText") && <p id="err-cityText" className="text-xs text-destructive mt-1">{formErrors.cityText}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-city-id">ciudad (ID numérico) *</Label>
              <Input
                id="branch-city-id"
                type="number"
                value={formData.cityId}
                onChange={(e) => onFieldChange("cityId", e.target.value)}
                onBlur={() => onFieldBlur("cityId")}
                placeholder="1"
                className={fieldClass("cityId")}
                aria-invalid={showError("cityId")}
                aria-describedby={showError("cityId") ? "err-cityId" : undefined}
              />
              {showError("cityId") && <p id="err-cityId" className="text-xs text-destructive mt-1">{formErrors.cityId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-state-id">estate_id (ID numérico) *</Label>
              <Input
                id="branch-state-id"
                type="number"
                value={formData.stateId}
                onChange={(e) => onFieldChange("stateId", e.target.value)}
                onBlur={() => onFieldBlur("stateId")}
                placeholder="1"
                className={fieldClass("stateId")}
                aria-invalid={showError("stateId")}
                aria-describedby={showError("stateId") ? "err-stateId" : undefined}
              />
              {showError("stateId") && <p id="err-stateId" className="text-xs text-destructive mt-1">{formErrors.stateId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-lat">lat</Label>
              <Input
                id="branch-lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => onFieldChange("lat", e.target.value)}
                onBlur={() => onFieldBlur("lat")}
                placeholder="17.0654"
                className={fieldClass("lat")}
                aria-invalid={showError("lat")}
                aria-describedby={showError("lat") ? "err-lat" : undefined}
              />
              {showError("lat") && <p id="err-lat" className="text-xs text-destructive mt-1">{formErrors.lat}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-lng">lng</Label>
              <Input
                id="branch-lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => onFieldChange("lng", e.target.value)}
                onBlur={() => onFieldBlur("lng")}
                placeholder="-96.7236"
                className={fieldClass("lng")}
                aria-invalid={showError("lng")}
                aria-describedby={showError("lng") ? "err-lng" : undefined}
              />
              {showError("lng") && <p id="err-lng" className="text-xs text-destructive mt-1">{formErrors.lng}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : editingBranch ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
