import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Building2, RefreshCw } from "lucide-react"
import type { ApiRole, FormData, FormErrors, Office, OfficeId, SelectedOfficePill, SystemUser } from "./types"
import { INPUT_FOCUS, SELECT_FOCUS } from "./constants"

export type UserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  submitting: boolean
  editingUser: SystemUser | null
  formData: FormData
  errors: FormErrors
  onFieldChange: (patch: Partial<FormData>) => void
  onToggleActive: (value: boolean) => void
  roles: ApiRole[]
  rolesLoading: boolean
  selectedRoleUid: string | undefined
  onRoleSelect: (uid: string) => void
  roleError?: string
  officeSearch: string
  onOfficeSearchChange: (value: string) => void
  officesLoading: boolean
  onReloadOffices: () => void
  filteredOffices: Office[]
  selectedOfficeIds: OfficeId[]
  selectedOfficePills: SelectedOfficePill[]
  onToggleOffice: (id: OfficeId, checked: boolean) => void
  onToggleAllFiltered: (check: boolean) => void
  onClearOffices: () => void
  onRemoveOffice: (id: OfficeId) => void
  isOfficeSelected: (selected: OfficeId[], candidate: OfficeId) => boolean
  onSubmit: () => void
  onCancel: () => void
}

export function UserDialog({
  open,
  onOpenChange,
  submitting,
  editingUser,
  formData,
  errors,
  onFieldChange,
  onToggleActive,
  roles,
  rolesLoading,
  selectedRoleUid,
  onRoleSelect,
  roleError,
  officeSearch,
  onOfficeSearchChange,
  officesLoading,
  onReloadOffices,
  filteredOffices,
  selectedOfficeIds,
  selectedOfficePills,
  onToggleOffice,
  onToggleAllFiltered,
  onClearOffices,
  onRemoveOffice,
  isOfficeSelected,
  onSubmit,
  onCancel,
}: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Modifica los datos y oficinas del usuario"
              : "Completa la información para crear un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres</Label>
              <Input
                id="nombres"
                className={`${INPUT_FOCUS} ${errors.nombres ? "border-red-500" : ""}`}
                value={formData.nombres}
                onChange={(e) => onFieldChange({ nombres: e.target.value })}
                placeholder="Juan Carlos"
                aria-invalid={!!errors.nombres}
              />
              {errors.nombres && <p className="text-xs text-red-600">{errors.nombres}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="primer_apellido">Primer apellido</Label>
              <Input
                id="primer_apellido"
                className={`${INPUT_FOCUS} ${errors.primer_apellido ? "border-red-500" : ""}`}
                value={formData.primer_apellido}
                onChange={(e) => onFieldChange({ primer_apellido: e.target.value })}
                placeholder="Pérez"
                aria-invalid={!!errors.primer_apellido}
              />
              {errors.primer_apellido && <p className="text-xs text-red-600">{errors.primer_apellido}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="segundo_apellido">Segundo apellido</Label>
              <Input
                id="segundo_apellido"
                className={`${INPUT_FOCUS} ${errors.segundo_apellido ? "border-red-500" : ""}`}
                value={formData.segundo_apellido}
                onChange={(e) => onFieldChange({ segundo_apellido: e.target.value })}
                placeholder="García"
                aria-invalid={!!errors.segundo_apellido}
              />
              {errors.segundo_apellido && <p className="text-xs text-red-600">{errors.segundo_apellido}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                className={`${INPUT_FOCUS} ${errors.correo ? "border-red-500" : ""}`}
                value={formData.correo}
                onChange={(e) => onFieldChange({ correo: e.target.value })}
                placeholder="usuario@sigr.com"
                aria-invalid={!!errors.correo}
              />
              {errors.correo && <p className="text-xs text-red-600">{errors.correo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                inputMode="tel"
                maxLength={15}
                className={`${INPUT_FOCUS} ${errors.telefono ? "border-red-500" : ""}`}
                value={formData.telefono}
                onChange={(e) => onFieldChange({ telefono: e.target.value })}
                placeholder="9512345678"
                aria-invalid={!!errors.telefono}
              />
              {errors.telefono && <p className="text-xs text-red-600">{errors.telefono}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                inputMode="tel"
                maxLength={15}
                className={`${INPUT_FOCUS} ${errors.whatsapp ? "border-red-500" : ""}`}
                value={formData.whatsapp}
                onChange={(e) => onFieldChange({ whatsapp: e.target.value })}
                placeholder="9512345678"
                aria-invalid={!!errors.whatsapp}
              />
              {errors.whatsapp && <p className="text-xs text-red-600">{errors.whatsapp}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={selectedRoleUid}
                onValueChange={onRoleSelect}
                disabled={rolesLoading || roles.length === 0}
              >
                <SelectTrigger className={`${SELECT_FOCUS} ${roleError ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={rolesLoading ? "Cargando roles…" : "Selecciona un rol"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.length === 0 && !rolesLoading && (
                    <div className="px-2 py-2 text-sm text-muted-foreground">Sin roles</div>
                  )}
                  {roles.map((r) => {
                    const value = r.uid ?? String(r.id ?? "")
                    const label = r.nombre ?? "(Sin nombre)"
                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {roleError && <p className="text-xs text-red-600">{roleError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Activo</Label>
              <div className="h-10 flex items-center">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={(v) => onToggleActive(!!v)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password {editingUser ? "(deja vacío para no cambiar)" : "(temporal)"}</Label>
              <Input
                id="password"
                className={`${INPUT_FOCUS} ${errors.password ? "border-red-500" : ""}`}
                type="text"
                value={formData.password}
                onChange={(e) => onFieldChange({ password: e.target.value })}
                placeholder={editingUser ? "Opcional" : "Se generó automáticamente"}
                aria-invalid={!!errors.password}
              />
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password}</p>
              ) : (
                !editingUser && (
                  <ul className="text-xs text-muted-foreground list-disc ml-4">
                    <li>8+ caracteres</li>
                    <li>1 mayúscula</li>
                    <li>1 número</li>
                    <li>1 carácter especial</li>
                  </ul>
                )
              )}
            </div>
          </div>

          <OfficeSelector
            loading={officesLoading}
            officeSearch={officeSearch}
            onOfficeSearchChange={onOfficeSearchChange}
            onReload={onReloadOffices}
            filteredOffices={filteredOffices}
            selectedOfficeIds={selectedOfficeIds}
            selectedOfficePills={selectedOfficePills}
            onToggleOffice={onToggleOffice}
            onToggleAllFiltered={onToggleAllFiltered}
            onClear={onClearOffices}
            onRemoveOffice={onRemoveOffice}
            isOfficeSelected={isOfficeSelected}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type OfficeSelectorProps = {
  loading: boolean
  officeSearch: string
  onOfficeSearchChange: (value: string) => void
  onReload: () => void
  filteredOffices: Office[]
  selectedOfficeIds: OfficeId[]
  selectedOfficePills: SelectedOfficePill[]
  onToggleOffice: (id: OfficeId, checked: boolean) => void
  onToggleAllFiltered: (check: boolean) => void
  onClear: () => void
  onRemoveOffice: (id: OfficeId) => void
  isOfficeSelected: (selected: OfficeId[], candidate: OfficeId) => boolean
}

function OfficeSelector({
  loading,
  officeSearch,
  onOfficeSearchChange,
  onReload,
  filteredOffices,
  selectedOfficeIds,
  selectedOfficePills,
  onToggleOffice,
  onToggleAllFiltered,
  onClear,
  onRemoveOffice,
  isOfficeSelected,
}: OfficeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Label>Oficinas</Label>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            <span className="truncate">
              {selectedOfficeIds.length > 0
                ? `${selectedOfficeIds.length} oficina${selectedOfficeIds.length > 1 ? "s" : ""} seleccionada${selectedOfficeIds.length > 1 ? "s" : ""}`
                : "Selecciona oficinas"}
            </span>
            <Building2 className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[520px] p-0">
          <div className="sticky top-0 z-10 space-y-2 border-b bg-background p-3">
            <DropdownMenuLabel className="px-0">Selecciona oficinas</DropdownMenuLabel>
            <div className="flex items-center gap-2">
              <Input
                className={INPUT_FOCUS}
                placeholder="Buscar por nombre/clave/ciudad/estado…"
                value={officeSearch}
                onChange={(e) => onOfficeSearchChange(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={onReload} disabled={loading}>
                <RefreshCw className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Cargando…" : "Recargar"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => onToggleAllFiltered(true)} disabled={loading}>
                Seleccionar filtradas
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => onToggleAllFiltered(false)} disabled={loading}>
                Quitar filtradas
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onClear} disabled={loading}>
                Limpiar todo
              </Button>
            </div>
          </div>

          <div className="max-h-72 overflow-auto p-2">
            {loading ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Cargando oficinas…</p>
            ) : filteredOffices.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">No se encontraron oficinas.</p>
            ) : (
              <ul className="space-y-1">
                {filteredOffices.map((o) => {
                  const checked = isOfficeSelected(selectedOfficeIds, o.id)
                  return (
                    <li key={String(o.id)}>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-default data-[highlighted]:bg-secondary data-[highlighted]:text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground"
                      >
                        <label className="flex w-full items-center gap-2">
                          <Checkbox checked={checked} onCheckedChange={(v) => onToggleOffice(o.id, !!v)} />
                          <span className="text-sm">
                            <span className="font-medium">{o.nombre}</span>
                            {o.clave ? <span className="text-muted-foreground"> · {o.clave}</span> : null}
                            {(o.ciudad || o.estado) ? (
                              <span className="text-muted-foreground">
                                {o.ciudad ? ` · ${o.ciudad}` : ""}
                                {o.estado ? `, ${o.estado}` : ""}
                              </span>
                            ) : null}
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {typeof o.id === "string" ? o.id : `#${o.id}`}
                          </span>
                        </label>
                      </DropdownMenuItem>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <DropdownMenuSeparator />
          <div className="flex flex-wrap gap-2 p-3">
            {selectedOfficePills.length === 0 ? (
              <span className="text-xs text-muted-foreground">Ninguna seleccionada</span>
            ) : (
              selectedOfficePills.map((pill) => (
                <span key={String(pill.id)} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                  {pill.label}
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => onRemoveOffice(pill.id)}
                    aria-label={`Quitar ${pill.label}`}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
