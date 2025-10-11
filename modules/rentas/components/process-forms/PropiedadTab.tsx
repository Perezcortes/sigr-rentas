"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PropiedadTabProps {
  value: any
  editable: boolean
  onChange: (next: any) => void
  onSave: () => void
}

export function PropiedadTab({ value, editable, onChange, onSave }: PropiedadTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Propiedad</CardTitle>
        <CardDescription>Datos del inmueble a rentar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input value={value.tipo || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, tipo: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Código Postal</Label>
            <Input value={value.cp || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, cp: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Estado (ID o nombre)</Label>
            <Input value={value.estado || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, estado: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Ciudad (ID o nombre)</Label>
            <Input value={value.ciudad || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, ciudad: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Colonia</Label>
            <Input value={value.colonia || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, colonia: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Calle</Label>
            <Input value={value.calle || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, calle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Número</Label>
            <Input value={value.numero || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, numero: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Interior</Label>
            <Input value={value.interior || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, interior: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Metros Cuadrados</Label>
            <Input type="number" value={Number.isFinite(value.metros) ? value.metros : (value.metros ?? 0)} readOnly={!editable} onChange={(e) => onChange({ ...value, metros: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Renta Mensual</Label>
            <Input type="number" value={Number.isFinite(value.renta) ? value.renta : (value.renta ?? 0)} readOnly={!editable} onChange={(e) => onChange({ ...value, renta: Number(e.target.value) || 0 })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Referencia</Label>
          <Textarea value={value.referencia || ""} readOnly={!editable} onChange={(e) => onChange({ ...value, referencia: e.target.value })} />
        </div>

        {editable && (
          <div className="pt-2 flex gap-2">
            <Button onClick={onSave}>Guardar cambios</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

