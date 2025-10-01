"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { RentalProcess } from "@/components/rental-process"
import type { Rental, RentalStatus } from "@/types/rental"
import { api } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function toRental(row: any): Rental {
  const inq = row?.inquilino ?? {}
  const prop = row?.propietario ?? {}
  const obl = row?.obligado_solidario ?? null
  const house = row?.propiedad ?? {}

  const status: RentalStatus =
    (row?.status as RentalStatus) ??
    (row?.estado as RentalStatus) ??
    "en_proceso"

  return {
    id: String(row?.id ?? row?.uuid ?? crypto.randomUUID()),
    status,
    createdAt: String(row?.created_at ?? row?.createdAt ?? "").slice(0, 10),
    updatedAt: String(row?.updated_at ?? row?.updatedAt ?? "").slice(0, 10),
    inquilino: {
      type: (inq?.tipo_persona ?? "fisica") === "moral" ? "moral" : "fisica",
      nombre: inq?.nombre_completo ?? null,
      razonSocial: inq?.razon_social ?? null,
      nombreComercial: inq?.nombre_comercial ?? null,
      representante: inq?.representante_legal ?? null,
      telefono: inq?.telefono ?? "",
      correo: inq?.correo ?? "",
    },
    propietario: {
      type: (prop?.tipo_persona ?? "fisica") === "moral" ? "moral" : "fisica",
      nombre: prop?.nombre_completo ?? null,
      razonSocial: prop?.razon_social ?? null,
      nombreComercial: prop?.nombre_comercial ?? null,
      representante: prop?.representante_legal ?? null,
      telefono: prop?.telefono ?? "",
      correo: prop?.correo ?? "",
    },
    obligadoSolidario: obl
      ? {
          type: (obl?.tipo_persona ?? "fisica") === "moral" ? "moral" : "fisica",
          nombre: obl?.nombre_completo ?? null,
          razonSocial: obl?.razon_social ?? null,
          nombreComercial: obl?.nombre_comercial ?? null,
          representante: obl?.representante_legal ?? null,
          telefono: obl?.telefono ?? "",
          correo: obl?.correo ?? "",
        }
      : undefined,
    propiedad: {
      tipo: house?.tipo ?? "",
      cp: house?.codigo_postal ?? house?.cp ?? "",
      estado: String(house?.estado_id ?? house?.estado ?? ""),
      ciudad: String(house?.ciudad_id ?? house?.ciudad ?? ""),
      colonia: house?.colonia ?? "",
      calle: house?.calle ?? "",
      numero: house?.numero ?? "",
      interior: house?.interior ?? "",
      metros: Number(house?.metros_cuadrados ?? house?.metros ?? 0),
      renta: Number(house?.monto_renta ?? house?.renta ?? 0),
    },
    documentos: Array.isArray(row?.documentos) ? row.documentos : [],
    activacion: row?.activacion ?? undefined,
  }
}

export default function RentalProcessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = useMemo(() => String(params?.id ?? ""), [params])

  // lee ?edit=1 para habilitar edición
  const editable = useMemo(() => searchParams.get("edit") === "1", [searchParams])

  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const ac = new AbortController()
    async function run() {
      setLoading(true)
      setError(null)
      try {
        let row: any | null = null
        try {
          row = await api(`/rentals/${encodeURIComponent(id)}`, { method: "GET", signal: ac.signal as any })
        } catch {
          const raw = await api("/rentals", { method: "GET", signal: ac.signal as any })
          const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
          row = list.find((r) => String(r?.id ?? r?.uuid) === id) ?? null
        }
        if (!active) return
        if (!row) {
          setError("Renta no encontrada")
          setRental(null)
        } else {
          setRental(toRental(row))
        }
      } catch (e: any) {
        if (!active) return
        setError(e?.message ?? "Error al cargar la renta")
      } finally {
        if (active) setLoading(false)
      }
    }
    if (id) run()
    return () => {
      active = false
      ac.abort()
    }
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Cargando proceso…</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Obteniendo información de la renta.</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !rental) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-destructive">{error ?? "No se pudo cargar la renta."}</div>
            <Button variant="outline" onClick={() => window.close()}>Cerrar ventana</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">
          Proceso de Renta – {rental.inquilino.nombre || rental.inquilino.razonSocial}
        </h1>

        <div className="flex gap-2">
          {/* Toggle rápido entre ver/editar modificando la query */}
          {editable ? (
            <Button
              variant="outline"
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.delete("edit")
                window.location.href = url.toString()
              }}
            >
              Salir de edición
            </Button>
          ) : (
            <Button
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set("edit", "1")
                window.location.href = url.toString()
              }}
            >
              Editar
            </Button>
          )}
          <Button variant="outline" onClick={() => window.close()}>Cerrar</Button>
        </div>
      </div>

      {/* pasa la bandera editable al proceso */}
      <RentalProcess rental={rental} editable={editable} />
    </div>
  )
}
