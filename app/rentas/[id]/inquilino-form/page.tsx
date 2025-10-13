"use client"
import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { InquilinoFullForm } from "@/modules/rentas/components/process-forms/InquilinoFullForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Errors = Record<string, string | undefined>

export default function InquilinoFormPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const [value, setValue] = useState<any>({ type: "fisica" })
  const [editable] = useState(true)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    // TODO: Cargar datos reales por id si aplica
  }, [params?.id])

  const errors: Errors = useMemo(() => validate(value), [value])
  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl md:text-2xl">Formulario Completo del Inquilino</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>Volver</Button>
            <Button
              disabled={hasErrors && touched}
              onClick={() => {
                setTouched(true)
                if (hasErrors) return
                // TODO: Guardar cambios reales
                console.log("Guardar", { id: params?.id, value })
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            {touched && hasErrors && (
              <div className="text-red-600">Revisa los campos marcados en rojo.</div>
            )}
          </div>
          <InquilinoFullForm
            value={value}
            editable={editable}
            onChange={(next) => {
              setValue(next)
            }}
            onSave={() => {
              setTouched(true)
              if (hasErrors) return
              // TODO: Guardar cambios reales
              console.log("Guardar", { id: params?.id, value })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function validate(v: any): Errors {
  const e: Errors = {}
  const req = (cond: boolean, key: string, msg: string) => { if (cond) e[key] = msg }
  const isEmail = (s?: string) => !!s && /.+@.+\..+/.test(s)
  const lenIs = (s?: string, n?: number) => (s ?? "").length === (n ?? -1)
  const digits = (s?: string, n?: number) => !!s && new RegExp(`^\\d{${n}}$`).test(s)
  const notFuture = (s?: string) => {
    if (!s) return false
    try { return new Date(s) > new Date() } catch { return false }
  }

  // Básicos PF
  if (v.type === "fisica") {
    req(!(v.nombres && v.apellidoP), "nombres", "Requerido")
    req(!v.sexo, "sexo", "Requerido")
    req(!v.edoCivil, "edoCivil", "Requerido")
    req(!isEmail(v.email), "email", "Email inválido")
    req(!v.iden, "iden", "Requerido")
    req(!v.fechaNac, "fechaNac", "Requerido")
    req(notFuture(v.fechaNac), "fechaNac", "Fecha inválida")
    req(!digits(v.celular, 10), "celular", "10 dígitos")

    // Domicilio
    req(!v.calle, "calle", "Requerido")
    req(!v.numExt, "numExt", "Requerido")
    req(!digits(v.cp, 5), "cp", "CP 5 dígitos")
    req(!v.colonia, "colonia", "Requerido")
    req(!v.mun, "mun", "Requerido")
    req(!v.estado, "estado", "Requerido")

    // Condicionales
    if (v.nacionalidad === "otra") req(!v.especifiqueN, "especifiqueN", "Requerido")
    if (v.edoCivil === "casado") req(!v.nombrec, "nombrec", "Requerido")
    if (v.situacion === "Inquilino") req(!v.nombrea, "nombrea", "Requerido")
    if (v.uso_sustituirDomicilioPF === "Sí" || v.uso_sustituirDomicilioPF === "Si") {
      req(!v.uso_callePF, "uso_callePF", "Requerido")
      req(!digits(v.uso_codigoPosPF, 5), "uso_codigoPosPF", "CP 5 dígitos")
    }
    if (v.otroIngreso === "1") {
      req(!v.numPerIngre, "numPerIngre", "Requerido")
      req(!v.nombreaOI, "nombreaOI", "Requerido")
    }
    // RFC/CURP longitudes suaves si existen
    if (v.rfc) e.rfc = (v.rfc.length === 12 || v.rfc.length === 13) ? undefined : "12-13 chars"
    if (v.curp) e.curp = v.curp.length === 18 ? undefined : "18 chars"
  }

  return e
}
