"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PropietarioFullForm from "@/modules/rentas/components/process-forms/PropietarioFullForm"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function PropietarioFormPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const [value, setValue] = useState<any>({})

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl md:text-2xl">Formulario Completo del Propietario</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>Volver</Button>
            <Button onClick={() => console.log("Guardar propietario", { id: params?.id, value })}>Guardar cambios</Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <PropietarioFullForm
            value={value}
            editable={true}
            onChange={setValue}
            onSave={() => console.log("Guardar propietario", { id: params?.id, value })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

