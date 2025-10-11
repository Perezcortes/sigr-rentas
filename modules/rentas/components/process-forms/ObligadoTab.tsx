"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ObligadoTabProps {
  value: any | null
  editable: boolean
  onChange: (next: any | null) => void
  onSave: () => void
  onRemove: () => void
}

export function ObligadoTab({ value, editable, onChange, onSave, onRemove }: ObligadoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Obligado Solidario</CardTitle>
        <CardDescription>Información del obligado solidario (opcional)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {value ? (
          <>
            <div className="flex items-center space-x-4">
              <Label>Tipo de Persona:</Label>
              <Select value={(value as any).type ?? "fisica"} disabled>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Persona Física</SelectItem>
                  <SelectItem value="moral">Persona Moral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre / Razón Social</Label>
                <Input
                  value={(value as any).nombre || (value as any).razonSocial || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...(value as any), nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={(value as any).telefono || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...(value as any), telefono: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input
                  value={(value as any).correo || ""}
                  readOnly={!editable}
                  onChange={(e) => onChange({ ...(value as any), correo: e.target.value })}
                />
              </div>
            </div>

            {editable && (
              <div className="pt-2 flex gap-2">
                <Button onClick={onSave}>Guardar cambios</Button>
                <Button variant="outline" onClick={onRemove}>Quitar obligado</Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No se ha agregado obligado solidario</p>
            {editable && (
              <Button onClick={() => onChange({ nombre: "", telefono: "", correo: "", type: "fisica" })}>
                Agregar Obligado Solidario
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

