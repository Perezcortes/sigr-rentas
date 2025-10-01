"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PropietarioTabProps {
  value: any
  editable: boolean
  onChange: (next: any) => void
  onSave: () => void
}

export function PropietarioTab({ value, editable, onChange, onSave }: PropietarioTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Propietario</CardTitle>
        <CardDescription>Información del propietario del inmueble</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Label>Tipo de Persona:</Label>
          <Select value={value.type} disabled>
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
              value={value.nombre || value.razonSocial || ""}
              readOnly={!editable}
              onChange={(e) => onChange({ ...value, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={value.telefono || ""}
              readOnly={!editable}
              onChange={(e) => onChange({ ...value, telefono: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Correo</Label>
            <Input
              value={value.correo || ""}
              readOnly={!editable}
              onChange={(e) => onChange({ ...value, correo: e.target.value })}
            />
          </div>
        </div>

        {editable && (
          <div className="pt-2">
            <Button onClick={onSave}>Guardar cambios</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

