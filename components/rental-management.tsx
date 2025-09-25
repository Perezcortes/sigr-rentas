"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  Eye,
  Edit,
  Home,
  Calendar,
  DollarSign,
  FileText,
  RefreshCw,
  UserRound,
  Building2,
  Handshake,
  ClipboardCheck,
  Check,
} from "lucide-react"
import type { Rental, RentalStatus } from "@/types/rental"
import { RentalProcess } from "@/components/rental-process"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/auth"
import type { LucideIcon } from "lucide-react"

/* ───────────────────────────────
   Helpers / Tipos
──────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CP_MX_RE = /^\d{5}$/
type PersonaType = "fisica" | "moral"
const onlyDigits = (s: string) => (s || "").replace(/\D+/g, "")
const hasMinDigits = (s: string, n: number) => onlyDigits(s).length >= n
const toPositiveInt = (v: string) => {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 ? n : undefined
}

type ManualForm = {
  creadoPorUserId: number | string | undefined
  inquilino: {
    tipo_persona: PersonaType
    nombre_completo?: string
    telefono: string
    correo: string
    razon_social?: string
    nombre_comercial?: string
    representante_legal?: string
  }
  propietario: {
    tipo_persona: PersonaType
    nombre_completo?: string
    telefono: string
    correo: string
    razon_social?: string
    nombre_comercial?: string
    representante_legal?: string
  }
  propiedad: {
    tipo: string
    codigo_postal: string
    estado_id: string
    ciudad_id: string
    colonia: string
    calle: string
    numero: string
    interior?: string
    referencia?: string
    metros_cuadrados?: string
    monto_renta: string
  }
  incluirObligado: boolean
  obligado?: {
    tipo_persona: PersonaType
    nombre_completo?: string
    telefono: string
    correo: string
    razon_social?: string
    nombre_comercial?: string
    representante_legal?: string
  }
}

const emptyManualForm: ManualForm = {
  creadoPorUserId: undefined,
  inquilino: { tipo_persona: "fisica", nombre_completo: "", telefono: "", correo: "" },
  propietario: { tipo_persona: "fisica", nombre_completo: "", telefono: "", correo: "" },
  propiedad: {
    tipo: "",
    codigo_postal: "",
    estado_id: "",
    ciudad_id: "",
    colonia: "",
    calle: "",
    numero: "",
    monto_renta: "",
  },
  incluirObligado: false,
  obligado: { tipo_persona: "fisica", nombre_completo: "", telefono: "", correo: "" },
}

type ManualFormErrors = Partial<Record<
  | "creado_por"
  | "inq_tipo" | "inq_nombre" | "inq_telefono" | "inq_correo" | "inq_razon"
  | "prop_tipo" | "prop_nombre" | "prop_telefono" | "prop_correo" | "prop_razon"
  | "obl_tipo" | "obl_nombre" | "obl_telefono" | "obl_correo" | "obl_razon"
  | "p_tipo" | "p_cp" | "p_estado" | "p_ciudad" | "p_colonia" | "p_calle" | "p_numero"
  | "p_metros" | "p_renta"
, string>>

function validateManualForm(f: ManualForm): ManualFormErrors {
  const e: ManualFormErrors = {}

  if (f.creadoPorUserId === undefined || toPositiveInt(String(f.creadoPorUserId)) === undefined) {
    e.creado_por = "ID de usuario creador inválido"
  }

  // Inquilino
  if (!f.inquilino.tipo_persona) e.inq_tipo = "Selecciona tipo de persona"
  if (f.inquilino.tipo_persona === "fisica") {
    if (!f.inquilino.nombre_completo?.trim()) e.inq_nombre = "Nombre del inquilino es obligatorio"
  } else {
    if (!f.inquilino.razon_social?.trim()) e.inq_razon = "Razón social es obligatoria"
  }
  if (f.inquilino.telefono && !hasMinDigits(f.inquilino.telefono, 10)) e.inq_telefono = "Teléfono debe tener al menos 10 dígitos"
  if (f.inquilino.correo && !EMAIL_RE.test(f.inquilino.correo.trim())) e.inq_correo = "Email inválido"

  // Propietario
  if (!f.propietario.tipo_persona) e.prop_tipo = "Selecciona tipo de persona"
  if (f.propietario.tipo_persona === "fisica") {
    if (!f.propietario.nombre_completo?.trim()) e.prop_nombre = "Nombre del propietario es obligatorio"
  } else {
    if (!f.propietario.razon_social?.trim()) e.prop_razon = "Razón social es obligatoria"
  }
  if (f.propietario.telefono && !hasMinDigits(f.propietario.telefono, 10)) e.prop_telefono = "Teléfono debe tener al menos 10 dígitos"
  if (f.propietario.correo && !EMAIL_RE.test(f.propietario.correo.trim())) e.prop_correo = "Email inválido"

  // Obligado (opcional)
  if (f.incluirObligado && f.obligado) {
    if (!f.obligado.tipo_persona) e.obl_tipo = "Selecciona tipo de persona"
    if (f.obligado.tipo_persona === "fisica") {
      if (!f.obligado.nombre_completo?.trim()) e.obl_nombre = "Nombre del obligado es obligatorio"
    } else {
      if (!f.obligado.razon_social?.trim()) e.obl_razon = "Razón social es obligatoria"
    }
    if (f.obligado.telefono && !hasMinDigits(f.obligado.telefono, 10)) e.obl_telefono = "Teléfono debe tener al menos 10 dígitos"
    if (f.obligado.correo && !EMAIL_RE.test(f.obligado.correo.trim())) e.obl_correo = "Email inválido"
  }

  // Propiedad
  if (!f.propiedad.tipo.trim()) e.p_tipo = "Tipo de propiedad es obligatorio"
  if (!CP_MX_RE.test((f.propiedad.codigo_postal || "").trim())) e.p_cp = "Código postal (MX) debe ser de 5 dígitos"
  if (toPositiveInt(f.propiedad.estado_id) === undefined) e.p_estado = "Estado ID debe ser entero positivo"
  if (toPositiveInt(f.propiedad.ciudad_id) === undefined) e.p_ciudad = "Ciudad ID debe ser entero positivo"
  if (!f.propiedad.colonia.trim()) e.p_colonia = "Colonia es obligatoria"
  if (!f.propiedad.calle.trim()) e.p_calle = "Calle es obligatoria"
  if (!f.propiedad.numero.trim()) e.p_numero = "Número es obligatorio"
  if (!f.propiedad.monto_renta.trim()) e.p_renta = "Monto de renta es obligatorio"
  else if (Number(f.propiedad.monto_renta) <= 0) e.p_renta = "Monto debe ser mayor a 0"
  if (f.propiedad.metros_cuadrados?.trim() && Number(f.propiedad.metros_cuadrados) <= 0) {
    e.p_metros = "Metros cuadrados debe ser mayor a 0"
  }

  return e
}

const stepErrorKeys: Record<number, (keyof ManualFormErrors)[]> = {
  0: ["creado_por","inq_tipo","inq_nombre","inq_razon","inq_telefono","inq_correo"],
  1: ["prop_tipo","prop_nombre","prop_razon","prop_telefono","prop_correo"],
  2: ["p_tipo","p_cp","p_estado","p_ciudad","p_colonia","p_calle","p_numero","p_metros","p_renta"],
  3: ["obl_tipo","obl_nombre","obl_razon","obl_telefono","obl_correo"],
  4: [],
}

function isStepValidPure(form: ManualForm, step: number): boolean {
  if (step === 3 && !form.incluirObligado) return true
  const errs = validateManualForm(form)
  const keys = stepErrorKeys[step]
  return !keys.some((k) => errs[k])
}

/* Mapear respuesta del backend a tu tipo Rental */
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

/* Generar fila temporal para UI tras POST (por si no quieres re-consultar) */
function mapFromManualPayloadToRentalRow(payload: any): Rental {
  const now = new Date().toISOString().slice(0, 10)
  return {
    id: crypto.randomUUID(),
    status: "en_proceso",
    createdAt: now,
    updatedAt: now,
    inquilino: {
      type: payload.inquilino?.tipo_persona === "moral" ? "moral" : "fisica",
      nombre: payload.inquilino?.nombre_completo,
      razonSocial: payload.inquilino?.razon_social,
      telefono: payload.inquilino?.telefono,
      correo: payload.inquilino?.correo,
      nombreComercial: payload.inquilino?.nombre_comercial,
      representante: payload.inquilino?.representante_legal,
    },
    propietario: {
      type: payload.propietario?.tipo_persona === "moral" ? "moral" : "fisica",
      nombre: payload.propietario?.nombre_completo,
      razonSocial: payload.propietario?.razon_social,
      telefono: payload.propietario?.telefono,
      correo: payload.propietario?.correo,
      nombreComercial: payload.propietario?.nombre_comercial,
      representante: payload.propietario?.representante_legal,
    },
    obligadoSolidario: payload.obligado_solidario
      ? {
          type: payload.obligado_solidario?.tipo_persona === "moral" ? "moral" : "fisica",
          nombre: payload.obligado_solidario?.nombre_completo,
          razonSocial: payload.obligado_solidario?.razon_social,
          telefono: payload.obligado_solidario?.telefono,
          correo: payload.obligado_solidario?.correo,
          nombreComercial: payload.obligado_solidario?.nombre_comercial,
          representante: payload.obligado_solidario?.representante_legal,
        }
      : undefined,
    propiedad: {
      tipo: payload.propiedad?.tipo,
      cp: payload.propiedad?.codigo_postal,
      estado: String(payload.propiedad?.estado_id ?? ""),
      ciudad: String(payload.propiedad?.ciudad_id ?? ""),
      colonia: payload.propiedad?.colonia,
      calle: payload.propiedad?.calle,
      numero: payload.propiedad?.numero,
      interior: payload.propiedad?.interior,
      metros: Number(payload.propiedad?.metros_cuadrados ?? 0),
      renta: Number(payload.propiedad?.monto_renta ?? 0),
    },
    documentos: [],
  }
}

/* ───────────────────────────────
   Sub-formularios memoizados
──────────────────────────────── */
const inputCls = "placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-secondary"

type InqProps = {
  data: ManualForm["inquilino"]
  errors: ManualFormErrors
  onChange: (patch: Partial<ManualForm["inquilino"]>) => void
}
const InquilinoForm = React.memo(function InquilinoForm({ data, errors, onChange }: InqProps) {
  return (
    <section className="space-y-3">
      <h4 className="font-semibold">Inquilino</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Tipo persona</Label>
          <Select
            value={data.tipo_persona}
            onValueChange={(v: PersonaType) => onChange({ tipo_persona: v })}
          >
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fisica">Física</SelectItem>
              <SelectItem value="moral">Moral</SelectItem>
            </SelectContent>
          </Select>
          {errors.inq_tipo && <p className="text-xs text-destructive mt-1">{errors.inq_tipo}</p>}
        </div>
        <div className="md:col-span-3">
          <Label>{data.tipo_persona === "moral" ? "Razón social" : "Nombre completo"}</Label>
          <Input
            className={inputCls}
            value={data.tipo_persona === "moral" ? (data.razon_social ?? "") : (data.nombre_completo ?? "")}
            onChange={(e) => onChange(data.tipo_persona === "moral" ? { razon_social: e.target.value } : { nombre_completo: e.target.value })}
            placeholder={data.tipo_persona === "moral" ? "Inversiones XYZ SA de CV" : "Ana Patricia Hernández"}
          />
          {data.tipo_persona === "moral"
            ? (errors.inq_razon && <p className="text-xs text-destructive mt-1">{errors.inq_razon}</p>)
            : (errors.inq_nombre && <p className="text-xs text-destructive mt-1">{errors.inq_nombre}</p>)}
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input
            className={inputCls}
            value={data.telefono}
            onChange={(e) => onChange({ telefono: e.target.value })}
            placeholder="+52 55 1234 5678"
          />
          {errors.inq_telefono && <p className="text-xs text-destructive mt-1">{errors.inq_telefono}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input
            className={inputCls}
            value={data.correo}
            onChange={(e) => onChange({ correo: e.target.value })}
            placeholder="correo@dominio.com"
          />
          {errors.inq_correo && <p className="text-xs text-destructive mt-1">{errors.inq_correo}</p>}
        </div>
        {data.tipo_persona === "moral" && (
          <>
            <div>
              <Label>Nombre comercial (opcional)</Label>
              <Input
                className={inputCls}
                value={data.nombre_comercial ?? ""}
                onChange={(e) => onChange({ nombre_comercial: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Representante legal (opcional)</Label>
              <Input
                className={inputCls}
                value={data.representante_legal ?? ""}
                onChange={(e) => onChange({ representante_legal: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
})

type PropProps = {
  data: ManualForm["propietario"]
  errors: ManualFormErrors
  onChange: (patch: Partial<ManualForm["propietario"]>) => void
}
const PropietarioForm = React.memo(function PropietarioForm({ data, errors, onChange }: PropProps) {
  return (
    <section className="space-y-3">
      <h4 className="font-semibold">Propietario</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Tipo persona</Label>
          <Select
            value={data.tipo_persona}
            onValueChange={(v: PersonaType) => onChange({ tipo_persona: v })}
          >
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fisica">Física</SelectItem>
              <SelectItem value="moral">Moral</SelectItem>
            </SelectContent>
          </Select>
          {errors.prop_tipo && <p className="text-xs text-destructive mt-1">{errors.prop_tipo}</p>}
        </div>
        <div className="md:col-span-3">
          <Label>{data.tipo_persona === "moral" ? "Razón social" : "Nombre completo"}</Label>
          <Input
            className={inputCls}
            value={data.tipo_persona === "moral" ? (data.razon_social ?? "") : (data.nombre_completo ?? "")}
            onChange={(e) => onChange(data.tipo_persona === "moral" ? { razon_social: e.target.value } : { nombre_completo: e.target.value })}
          />
          {data.tipo_persona === "moral"
            ? (errors.prop_razon && <p className="text-xs text-destructive mt-1">{errors.prop_razon}</p>)
            : (errors.prop_nombre && <p className="text-xs text-destructive mt-1">{errors.prop_nombre}</p>)}
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input className={inputCls} value={data.telefono} onChange={(e) => onChange({ telefono: e.target.value })} />
          {errors.prop_telefono && <p className="text-xs text-destructive mt-1">{errors.prop_telefono}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input className={inputCls} value={data.correo} onChange={(e) => onChange({ correo: e.target.value })} />
          {errors.prop_correo && <p className="text-xs text-destructive mt-1">{errors.prop_correo}</p>}
        </div>
        {data.tipo_persona === "moral" && (
          <>
            <div>
              <Label>Nombre comercial (opcional)</Label>
              <Input className={inputCls} value={data.nombre_comercial ?? ""} onChange={(e) => onChange({ nombre_comercial: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Representante legal (opcional)</Label>
              <Input className={inputCls} value={data.representante_legal ?? ""} onChange={(e) => onChange({ representante_legal: e.target.value })} />
            </div>
          </>
        )}
      </div>
    </section>
  )
})

type PropiedadProps = {
  data: ManualForm["propiedad"]
  errors: ManualFormErrors
  onChange: (patch: Partial<ManualForm["propiedad"]>) => void
}
const PropiedadForm = React.memo(function PropiedadForm({ data, errors, onChange }: PropiedadProps) {
  return (
    <section className="space-y-3">
      <h4 className="font-semibold">Propiedad</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Tipo</Label>
          <Input className={inputCls} value={data.tipo} onChange={(e) => onChange({ tipo: e.target.value })} placeholder="casa, depto, oficina…" />
          {errors.p_tipo && <p className="text-xs text-destructive mt-1">{errors.p_tipo}</p>}
        </div>
        <div>
          <Label>CP</Label>
          <Input
            className={inputCls}
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            value={data.codigo_postal}
            onChange={(e) => onChange({ codigo_postal: e.target.value })}
            placeholder="68000"
          />
          {errors.p_cp && <p className="text-xs text-destructive mt-1">{errors.p_cp}</p>}
        </div>
        <div>
          <Label>Estado ID</Label>
          <Input
            className={inputCls}
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            value={data.estado_id}
            onChange={(e) => onChange({ estado_id: e.target.value })}
            placeholder="20"
          />
          {errors.p_estado && <p className="text-xs text-destructive mt-1">{errors.p_estado}</p>}
        </div>
        <div>
          <Label>Ciudad ID</Label>
          <Input
            className={inputCls}
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            value={data.ciudad_id}
            onChange={(e) => onChange({ ciudad_id: e.target.value })}
            placeholder="125"
          />
          {errors.p_ciudad && <p className="text-xs text-destructive mt-1">{errors.p_ciudad}</p>}
        </div>

        <div>
          <Label>Colonia</Label>
          <Input className={inputCls} value={data.colonia} onChange={(e) => onChange({ colonia: e.target.value })} />
          {errors.p_colonia && <p className="text-xs text-destructive mt-1">{errors.p_colonia}</p>}
        </div>
        <div>
          <Label>Calle</Label>
          <Input className={inputCls} value={data.calle} onChange={(e) => onChange({ calle: e.target.value })} />
          {errors.p_calle && <p className="text-xs text-destructive mt-1">{errors.p_calle}</p>}
        </div>
        <div>
          <Label>Número</Label>
          <Input
            className={inputCls}
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            value={data.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
          />
          {errors.p_numero && <p className="text-xs text-destructive mt-1">{errors.p_numero}</p>}
        </div>
        <div>
          <Label>Interior (opcional)</Label>
          <Input className={inputCls} value={data.interior ?? ""} onChange={(e) => onChange({ interior: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label>Referencia (opcional)</Label>
          <Input className={inputCls} value={data.referencia ?? ""} onChange={(e) => onChange({ referencia: e.target.value })} />
        </div>
        <div>
          <Label>Metros cuadrados (opcional)</Label>
          <Input
            className={inputCls}
            type="text"
            inputMode="decimal"
            value={data.metros_cuadrados ?? ""}
            onChange={(e) => onChange({ metros_cuadrados: e.target.value })}
          />
          {errors.p_metros && <p className="text-xs text-destructive mt-1">{errors.p_metros}</p>}
        </div>
        <div>
          <Label>Monto renta</Label>
          <Input
            className={inputCls}
            type="text"
            inputMode="decimal"
            value={data.monto_renta}
            onChange={(e) => onChange({ monto_renta: e.target.value })}
          />
          {errors.p_renta && <p className="text-xs text-destructive mt-1">{errors.p_renta}</p>}
        </div>
      </div>
    </section>
  )
})

type OblProps = {
  enabled: boolean
  data: NonNullable<ManualForm["obligado"]>
  errors: ManualFormErrors
  onToggle: (v: boolean) => void
  onChange: (patch: Partial<NonNullable<ManualForm["obligado"]>>) => void
}
const ObligadoForm = React.memo(function ObligadoForm({ enabled, data, errors, onToggle, onChange }: OblProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={onToggle} />
        <span className="font-semibold">Incluir obligado solidario</span>
      </div>

      {enabled && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Tipo persona</Label>
            <Select value={data.tipo_persona} onValueChange={(v: PersonaType) => onChange({ tipo_persona: v })}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fisica">Física</SelectItem>
                <SelectItem value="moral">Moral</SelectItem>
              </SelectContent>
            </Select>
            {errors.obl_tipo && <p className="text-xs text-destructive mt-1">{errors.obl_tipo}</p>}
          </div>
          <div className="md:col-span-3">
            <Label>{data.tipo_persona === "moral" ? "Razón social" : "Nombre completo"}</Label>
            <Input
              className={inputCls}
              value={data.tipo_persona === "moral" ? (data.razon_social ?? "") : (data.nombre_completo ?? "")}
              onChange={(e) => onChange(data.tipo_persona === "moral" ? { razon_social: e.target.value } : { nombre_completo: e.target.value })}
            />
            {data.tipo_persona === "moral"
              ? (errors.obl_razon && <p className="text-xs text-destructive mt-1">{errors.obl_razon}</p>)
              : (errors.obl_nombre && <p className="text-xs text-destructive mt-1">{errors.obl_nombre}</p>)}
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input className={inputCls} value={data.telefono} onChange={(e) => onChange({ telefono: e.target.value })} />
            {errors.obl_telefono && <p className="text-xs text-destructive mt-1">{errors.obl_telefono}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input className={inputCls} value={data.correo} onChange={(e) => onChange({ correo: e.target.value })} />
            {errors.obl_correo && <p className="text-xs text-destructive mt-1">{errors.obl_correo}</p>}
          </div>
          {data.tipo_persona === "moral" && (
            <>
              <div>
                <Label>Nombre comercial (opcional)</Label>
                <Input className={inputCls} value={data.nombre_comercial ?? ""} onChange={(e) => onChange({ nombre_comercial: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Representante legal (opcional)</Label>
                <Input className={inputCls} value={data.representante_legal ?? ""} onChange={(e) => onChange({ representante_legal: e.target.value })} />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
})

/* ───────────────────────────────
   Principal
──────────────────────────────── */
export function RentalManagement() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RentalStatus | "all">("all")
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [isNewRentalDialogOpen, setIsNewRentalDialogOpen] = useState(false)

  // wizard state
  const [mode, setMode] = useState<"menu" | "manual">("menu")
  const [step, setStep] = useState<number>(0)
  const [manualForm, setManualForm] = useState<ManualForm>(emptyManualForm)
  const [manualErrors, setManualErrors] = useState<ManualFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()
  const userPerms: string[] = (user as any)?.permissions ?? (user as any)?.permisos ?? []
  const canCreate = userPerms.includes("crear_rentas")
  const canView = userPerms.includes("ver_rentas")

  type ManualStepItem = {
    index: number
    label: string
    description: string
    icon: LucideIcon
    optional?: boolean
    disabled?: boolean
  }

  const manualSteps = useMemo<ManualStepItem[]>(() => {
    const steps: ManualStepItem[] = [
      { index: 0, label: "Inquilino", description: "Datos del solicitante principal", icon: UserRound },
      { index: 1, label: "Propietario", description: "Identificación del dueño", icon: Building2 },
      { index: 2, label: "Propiedad", description: "Características del inmueble", icon: Home },
    ]

    steps.push({
      index: 3,
      label: "Obligado solidario",
      description: manualForm.incluirObligado ? "Captura los datos del obligado" : "Puedes omitir si no aplica",
      icon: Handshake,
      optional: true,
      disabled: !manualForm.incluirObligado,
    })

    steps.push({
      index: 4,
      label: "Resumen",
      description: "Confirma la información antes de crear la renta",
      icon: ClipboardCheck,
    })

    return steps
  }, [manualForm.incluirObligado])

  const enabledManualSteps = useMemo(() => manualSteps.filter((item) => !item.disabled), [manualSteps])

  const currentManualStepIndex = useMemo(() => {
    const exact = enabledManualSteps.findIndex((item) => item.index === step)
    if (exact !== -1) return exact
    if (!manualForm.incluirObligado && step === 3) {
      const summaryIdx = enabledManualSteps.findIndex((item) => item.index === 4)
      return summaryIdx !== -1 ? summaryIdx : enabledManualSteps.length - 1
    }
    if (step > 3) {
      const summaryIdx = enabledManualSteps.findIndex((item) => item.index === 4)
      return summaryIdx !== -1 ? summaryIdx : enabledManualSteps.length - 1
    }
    return Math.max(0, Math.min(enabledManualSteps.length - 1, step))
  }, [enabledManualSteps, manualForm.incluirObligado, step])

  const displayedStepNumber = currentManualStepIndex + 1
  const totalManualSteps = enabledManualSteps.length

  const statusLabels: Record<RentalStatus, string> = {
    apartada: "Apartada",
    en_proceso: "En Proceso",
    rentada: "Rentada",
    cancelada: "Cancelada",
    rechazada: "Rechazada",
    rescindida: "Rescindida",
  }
  const statusColors: Record<RentalStatus, string> = {
    apartada: "bg-yellow-100 text-yellow-800",
    en_proceso: "bg-blue-100 text-blue-800",
    rentada: "bg-green-100 text-green-800",
    cancelada: "bg-gray-100 text-gray-800",
    rechazada: "bg-red-100 text-red-800",
    rescindida: "bg-orange-100 text-orange-800",
  }

  /* === Carga inicial UNA sola vez con cancelación para evitar timeouts === */
  const didFetchRef = useRef(false)
  useEffect(() => {
    if (!canView) return
    if (didFetchRef.current) return
    didFetchRef.current = true

    const ac = new AbortController()
    setLoading(true)

    ;(async () => {
      try {
        const raw = await api("/rentals", { method: "GET", signal: ac.signal as any })
        const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
        setRentals(list.map(toRental))
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          toast({ title: "Error al cargar", description: e?.message ?? "No se pudieron obtener las rentas", variant: "destructive" })
        }
      } finally {
        setLoading(false)
      }
    })()

    return () => ac.abort()
  }, [canView, toast])

  /* === Recarga manual desacoplada (usa AbortController) === */
  const handleManualRefresh = async () => {
    if (!canView) return
    const ac = new AbortController()
    setLoading(true)
    try {
      const raw = await api("/rentals", { method: "GET", signal: ac.signal as any })
      const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.result ?? [])
      setRentals(list.map(toRental))
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        toast({ title: "Error al cargar", description: e?.message ?? "No se pudieron obtener las rentas", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredRentals = rentals.filter((r) => {
    const q = searchTerm.toLowerCase()
    const inq = (r.inquilino.nombre ?? r.inquilino.razonSocial ?? "").toLowerCase()
    const calle = (r.propiedad.calle ?? "").toLowerCase()
    return (inq.includes(q) || calle.includes(q)) && (statusFilter === "all" || r.status === statusFilter)
  })

  const stats = useMemo(() => ([
    { title: "Total Rentas", value: rentals.length.toString(), icon: Home, color: "text-blue-600" },
    { title: "En Proceso", value: rentals.filter((r) => r.status === "en_proceso").length.toString(), icon: Calendar, color: "text-yellow-600" },
    { title: "Rentadas", value: rentals.filter((r) => r.status === "rentada").length.toString(), icon: DollarSign, color: "text-green-600" },
    { title: "Pendientes", value: rentals.filter((r) => r.status === "apartada").length.toString(), icon: FileText, color: "text-orange-600" },
  ]), [rentals])

  const openProcess = (r: Rental) => { setSelectedRental(r); setIsProcessDialogOpen(true) }

  const resetModal = () => {
    setMode("menu")
    setStep(0)
    setManualForm({
      ...emptyManualForm,
      creadoPorUserId: (user as any)?.id ?? (user as any)?.userId ?? 1,
    })
    setManualErrors({})
  }

  const handleNewRental = () => { resetModal(); setIsNewRentalDialogOpen(true) }

  /* handlers memo para no romper input */
  const updateInq = useCallback((patch: Partial<ManualForm["inquilino"]>) => {
    setManualForm((f) => ({ ...f, inquilino: { ...f.inquilino, ...patch } }))
  }, [])
  const updatePropietario = useCallback((patch: Partial<ManualForm["propietario"]>) => {
    setManualForm((f) => ({ ...f, propietario: { ...f.propietario, ...patch } }))
  }, [])
  const updatePropiedad = useCallback((patch: Partial<ManualForm["propiedad"]>) => {
    setManualForm((f) => ({ ...f, propiedad: { ...f.propiedad, ...patch } }))
  }, [])
  const updateObligado = useCallback((patch: Partial<NonNullable<ManualForm["obligado"]>>) => {
    setManualForm((f) => ({ ...f, obligado: { ...(f.obligado ?? { tipo_persona: "fisica", telefono: "", correo: "" }), ...patch } }))
  }, [])
  const toggleObligado = useCallback((v: boolean) => {
    setManualForm((f) => ({ ...f, incluirObligado: v }))
    if (!v) {
      setStep((current) => (current === 3 ? 4 : current))
    }
  }, [])

  function nextStep() {
    const errs = validateManualForm(manualForm)
    setManualErrors(errs)
    if (!isStepValidPure(manualForm, step)) return
    if (step === 3 || (step === 2 && !manualForm.incluirObligado)) setStep(4)
    else setStep((s) => Math.min(4, s + 1))
  }
  function prevStep() {
    if (step === 4 && !manualForm.incluirObligado) setStep(2)
    else setStep((s) => Math.max(0, s - 1))
  }

  async function submitManual() {
    const errs = validateManualForm(manualForm)
    setManualErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast({ title: "Revisa el formulario", description: "Hay campos con errores.", variant: "destructive" })
      return
    }
    if (!canCreate) {
      toast({ title: "Permisos", description: "No tienes permiso para crear rentas.", variant: "destructive" })
      return
    }

    const payload: any = {
      tipo_origen: "manual",
      creado_por_user_id: toPositiveInt(String(manualForm.creadoPorUserId)) ?? 1,
      inquilino: {
        tipo_persona: manualForm.inquilino.tipo_persona,
        nombre_completo: manualForm.inquilino.nombre_completo?.trim() || undefined,
        telefono: manualForm.inquilino.telefono.trim(),
        correo: manualForm.inquilino.correo.trim(),
        razon_social: manualForm.inquilino.razon_social?.trim() || undefined,
        nombre_comercial: manualForm.inquilino.nombre_comercial?.trim() || undefined,
        representante_legal: manualForm.inquilino.representante_legal?.trim() || undefined,
      },
      propietario: {
        tipo_persona: manualForm.propietario.tipo_persona,
        nombre_completo: manualForm.propietario.nombre_completo?.trim() || undefined,
        telefono: manualForm.propietario.telefono.trim(),
        correo: manualForm.propietario.correo.trim(),
        razon_social: manualForm.propietario.razon_social?.trim() || undefined,
        nombre_comercial: manualForm.propietario.nombre_comercial?.trim() || undefined,
        representante_legal: manualForm.propietario.representante_legal?.trim() || undefined,
      },
      propiedad: {
        tipo: manualForm.propiedad.tipo.trim(),
        codigo_postal: manualForm.propiedad.codigo_postal.trim(),
        estado_id: toPositiveInt(manualForm.propiedad.estado_id)!,
        ciudad_id: toPositiveInt(manualForm.propiedad.ciudad_id)!,
        colonia: manualForm.propiedad.colonia.trim(),
        calle: manualForm.propiedad.calle.trim(),
        numero: manualForm.propiedad.numero.trim(),
        interior: manualForm.propiedad.interior?.trim() || undefined,
        referencia: manualForm.propiedad.referencia?.trim() || undefined,
        metros_cuadrados: manualForm.propiedad.metros_cuadrados ? Number(manualForm.propiedad.metros_cuadrados) : undefined,
        monto_renta: Number(manualForm.propiedad.monto_renta),
      },
    }
    if (manualForm.incluirObligado && manualForm.obligado) {
      payload.obligado_solidario = {
        tipo_persona: manualForm.obligado.tipo_persona,
        nombre_completo: manualForm.obligado.nombre_completo?.trim() || undefined,
        telefono: manualForm.obligado.telefono.trim(),
        correo: manualForm.obligado.correo.trim(),
        razon_social: manualForm.obligado.razon_social?.trim() || undefined,
        nombre_comercial: manualForm.obligado.nombre_comercial?.trim() || undefined,
        representante_legal: manualForm.obligado.representante_legal?.trim() || undefined,
      }
    }

    setSubmitting(true)
    try {
      await api("/rentals/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      // Refrescar desde backend evitando múltiples disparos:
      await handleManualRefresh()

      toast({ title: "Renta creada", description: "Se inició el proceso manual correctamente." })
      setIsNewRentalDialogOpen(false)
      resetModal()
    } catch (e: any) {
      toast({ title: "Error al crear", description: e?.message ?? "No se pudo crear la renta", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions and Filters */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Rentas</CardTitle>
              <CardDescription>Administra todos los procesos de renta</CardDescription>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleManualRefresh} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Cargando..." : "Recargar"}
              </Button>

              <Dialog open={isNewRentalDialogOpen} onOpenChange={setIsNewRentalDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewRental} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proceso
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[860px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nuevo Proceso de Renta</DialogTitle>
                    <DialogDescription>
                      {mode === "menu"
                        ? "Elige cómo deseas iniciar el proceso de renta"
                        : "Sigue el asistente paso a paso para registrar una renta manual"}
                    </DialogDescription>
                  </DialogHeader>

                  {mode === "menu" ? (
                    <div className="grid gap-4 py-4">
                      <Button
                        variant="secondary"
                        disabled
                        className="relative flex h-auto w-full flex-col items-start space-y-2 rounded-xl border border-dashed border-muted p-5 text-left"
                      >
                        <span className="inline-flex items-center gap-2 text-sm font-semibold">
                          <FileText className="h-4 w-4" />
                          Desde oportunidad
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Conecta un interesado existente y continúa el proceso desde su expediente.
                        </span>
                        <span className="absolute right-4 top-4 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Próximamente
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setMode("manual")
                          setStep(0)
                          setManualForm((f) => ({
                            ...f,
                            creadoPorUserId: (user as any)?.id ?? (user as any)?.userId ?? 1,
                          }))
                        }}
                        className="flex h-auto w-full flex-col items-start space-y-2 rounded-xl border border-primary/40 bg-primary/5 p-5 text-left hover:bg-primary/10"
                      >
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                          <Plus className="h-4 w-4" />
                          Crear proceso manual
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Registra desde cero los datos del inquilino, propietario, propiedad y obligado solidario.
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                      <aside className="space-y-4">
                        <div className="rounded-xl border bg-background p-4 shadow-sm">
                          <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
                            <span>Progreso</span>
                            <span className="text-foreground">Paso {displayedStepNumber} de {totalManualSteps}</span>
                          </div>
                          <div className="mt-4 space-y-3">
                            {manualSteps.map((stepItem, idx) => {
                              const Icon = stepItem.icon
                              const isActive = !stepItem.disabled && step === stepItem.index
                              const isCompleted = !stepItem.disabled && step > stepItem.index
                              const baseBorder = isActive ? "border-primary bg-primary/5" : isCompleted ? "border-primary/40 bg-primary/5" : "border-transparent"
                              const baseText = isActive ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"
                              return (
                                <div
                                  key={stepItem.index}
                                  className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition ${baseBorder}`}
                                >
                                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-primary/10 text-primary" : stepItem.disabled ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {isCompleted ? <Check className="h-4 w-4" /> : String(idx + 1).padStart(2, "0")}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <Icon className={`h-4 w-4 ${baseText}`} />
                                      <span className={`text-sm font-medium ${baseText}`}>{stepItem.label}</span>
                                      {stepItem.optional && (
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Opcional</span>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">{stepItem.description}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div className="rounded-xl border bg-muted/10 p-4 text-xs text-muted-foreground">
                          Captura cuidadosamente la información. Puedes regresar a pasos anteriores antes de confirmar el resumen y generar la renta manual.
                        </div>
                      </aside>

                      <div className="space-y-6">
                        {manualErrors.creado_por && (
                          <p className="text-xs font-medium text-destructive">{manualErrors.creado_por}</p>
                        )}

                        {step === 0 && (
                          <div className="rounded-xl border bg-background p-5 shadow-sm">
                            <InquilinoForm
                              data={manualForm.inquilino}
                              errors={manualErrors}
                              onChange={updateInq}
                            />
                          </div>
                        )}
                        {step === 1 && (
                          <div className="rounded-xl border bg-background p-5 shadow-sm">
                            <PropietarioForm
                              data={manualForm.propietario}
                              errors={manualErrors}
                              onChange={updatePropietario}
                            />
                          </div>
                        )}
                        {step === 2 && (
                          <div className="rounded-xl border bg-background p-5 shadow-sm">
                            <PropiedadForm
                              data={manualForm.propiedad}
                              errors={manualErrors}
                              onChange={updatePropiedad}
                            />
                          </div>
                        )}
                        {step === 3 && (
                          <div className="rounded-xl border bg-background p-5 shadow-sm">
                            <ObligadoForm
                              enabled={manualForm.incluirObligado}
                              data={manualForm.obligado!}
                              errors={manualErrors}
                              onToggle={toggleObligado}
                              onChange={updateObligado}
                            />
                          </div>
                        )}
                        {step === 4 && (
                          <div className="space-y-4 rounded-xl border bg-background p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold">Resumen del proceso</h4>
                              <Badge variant="outline">Revisión final</Badge>
                            </div>
                            <div className="grid gap-4 text-sm md:grid-cols-2">
                              <div className="space-y-1 rounded-lg bg-muted/40 p-4">
                                <div className="font-medium">Inquilino</div>
                                <div>Tipo: {manualForm.inquilino.tipo_persona}</div>
                                <div>Nombre/Razón: {manualForm.inquilino.tipo_persona === "moral" ? (manualForm.inquilino.razon_social || "—") : (manualForm.inquilino.nombre_completo || "—")}</div>
                                <div>Teléfono: {manualForm.inquilino.telefono || "—"}</div>
                                <div>Email: {manualForm.inquilino.correo || "—"}</div>
                              </div>
                              <div className="space-y-1 rounded-lg bg-muted/40 p-4">
                                <div className="font-medium">Propietario</div>
                                <div>Tipo: {manualForm.propietario.tipo_persona}</div>
                                <div>Nombre/Razón: {manualForm.propietario.tipo_persona === "moral" ? (manualForm.propietario.razon_social || "—") : (manualForm.propietario.nombre_completo || "—")}</div>
                                <div>Teléfono: {manualForm.propietario.telefono || "—"}</div>
                                <div>Email: {manualForm.propietario.correo || "—"}</div>
                              </div>
                              <div className="space-y-1 rounded-lg bg-muted/40 p-4 md:col-span-2">
                                <div className="font-medium">Propiedad</div>
                                <div>{manualForm.propiedad.tipo || "—"}</div>
                                <div>{manualForm.propiedad.calle} {manualForm.propiedad.numero}, {manualForm.propiedad.colonia}</div>
                                <div>CP {manualForm.propiedad.codigo_postal} · Estado ID {manualForm.propiedad.estado_id} · Ciudad ID {manualForm.propiedad.ciudad_id}</div>
                                <div>Metros cuadrados: {manualForm.propiedad.metros_cuadrados || "—"}</div>
                                <div>Monto renta: ${manualForm.propiedad.monto_renta}</div>
                              </div>
                              {manualForm.incluirObligado && manualForm.obligado && (
                                <div className="space-y-1 rounded-lg bg-muted/40 p-4 md:col-span-2">
                                  <div className="font-medium">Obligado solidario</div>
                                  <div>Tipo: {manualForm.obligado.tipo_persona}</div>
                                  <div>Nombre/Razón: {manualForm.obligado.tipo_persona === "moral" ? (manualForm.obligado.razon_social || "—") : (manualForm.obligado.nombre_completo || "—")}</div>
                                  <div>Teléfono: {manualForm.obligado.telefono || "—"}</div>
                                  <div>Email: {manualForm.obligado.correo || "—"}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setMode("menu")} disabled={submitting}>Cancelar</Button>
                            {step > 0 && step <= 4 && (
                              <Button variant="outline" onClick={prevStep} disabled={submitting}>Atrás</Button>
                            )}
                          </div>

                          {step < 4 && (
                            <Button onClick={nextStep} disabled={submitting}>Siguiente</Button>
                          )}

                          {step === 4 && (
                            <Button onClick={submitManual} disabled={submitting}>
                              {submitting ? "Creando…" : "Crear renta manual"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por inquilino o propiedad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: RentalStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="apartada">Apartada</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="rentada">Rentada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="rescindida">Rescindida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Propiedad</TableHead>
                  <TableHead>Renta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {r.inquilino.type === "fisica" ? r.inquilino.nombre : r.inquilino.razonSocial}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {r.inquilino.type === "fisica" ? "Persona Física" : "Persona Moral"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {r.propiedad.tipo} - {r.propiedad.calle} {r.propiedad.numero}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {r.propiedad.colonia}, {r.propiedad.ciudad}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${(r.propiedad.renta ?? 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{r.propiedad.metros}m²</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[r.status]}>{statusLabels[r.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openProcess(r)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredRentals.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {canView ? "Sin resultados" : "No tienes permiso para ver rentas"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Proceso */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Proceso de Renta - {selectedRental?.inquilino.nombre || selectedRental?.inquilino.razonSocial}
            </DialogTitle>
          </DialogHeader>
          {selectedRental && <RentalProcess rental={selectedRental} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
