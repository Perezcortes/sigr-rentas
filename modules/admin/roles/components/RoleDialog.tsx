import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import type { RoleForm, RoleRow, PermissionGroup } from "../types"
import { INPUT_FOCUS, CARD_BORDER } from "../constants"

export type RoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: RoleRow | null
  form: RoleForm
  canCreate: boolean
  canEdit: boolean
  submitting: boolean
  permLoading: boolean
  permQuery: string
  selectedCount: number
  groupedPermissions: PermissionGroup[]
  selectedPermissions: Set<string>
  onFormChange: (patch: Partial<RoleForm>) => void
  onPermQueryChange: (value: string) => void
  onTogglePermission: (hid: string, checked: boolean) => void
  onToggleGroup: (groupKey: string, checked: boolean) => void
  onCancel: () => void
  onSubmit: () => void
}

export function RoleDialog({
  open,
  onOpenChange,
  editing,
  form,
  canCreate,
  canEdit,
  submitting,
  permLoading,
  permQuery,
  selectedCount,
  groupedPermissions,
  selectedPermissions,
  onFormChange,
  onPermQueryChange,
  onTogglePermission,
  onToggleGroup,
  onCancel,
  onSubmit,
}: RoleDialogProps) {
  const canModify = editing ? canEdit : canCreate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                className={INPUT_FOCUS}
                value={form.nombre}
                onChange={(e) => onFormChange({ nombre: e.target.value })}
                placeholder="Administrador, Gerente…"
                disabled={!canModify}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                className={INPUT_FOCUS}
                value={form.descripcion}
                onChange={(e) => onFormChange({ descripcion: e.target.value })}
                placeholder="Rol con privilegios…"
                disabled={!canModify}
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
                className={INPUT_FOCUS}
                placeholder="Buscar permiso (ej. usuarios, crear, oficinas)…"
                value={permQuery}
                onChange={(e) => onPermQueryChange(e.target.value)}
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
                          <Button type="button" size="sm" variant="outline" onClick={() => onToggleGroup(groupKey, true)}>
                            Todo
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => onToggleGroup(groupKey, false)}>
                            Desmarcar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {items.map((p) => {
                          const checked = selectedPermissions.has(p.hid)
                          return (
                            <label key={p.hid} className={`flex items-center gap-2 rounded-md border p-2 ${CARD_BORDER} hover:bg-secondary/20`}>
                              <Checkbox checked={checked} onCheckedChange={(v) => onTogglePermission(p.hid, !!v)} />
                              <div className="space-y-0.5">
                                <div className="text-sm font-medium">{p.nombre}</div>
                                {p.descripcion && <div className="text-xs text-muted-foreground">{p.descripcion}</div>}
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
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={submitting || (!canCreate && !canEdit)}>
            {submitting ? "Guardando..." : editing ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
