"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import Logo from "@/public/sigr_images/LogoRentas.png"
import LogoSingle from "@/public/sigr_images/LogoRentasSingle.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

function normalize(s: string) { return s.trim() }
function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }
function hasSpecialChar(s: string) { return /[^A-Za-z0-9]/.test(s) }

type MaybeHttpError = {
  name?: string
  status?: number
  message?: string
  code?: string | number
  cause?: any
  response?: { status?: number; data?: any }
  request?: any
  data?: any
}

function asArray(x: any): string[] { if (!x) return []; if (Array.isArray(x)) return x.map(String); return [String(x)] }
function firstNonEmpty(...vals: Array<string | undefined | null>) { for (const v of vals) if (v && String(v).trim()) return String(v); return "" }
function getStatus(err: MaybeHttpError): number | undefined {
  const s = err?.status ?? err?.response?.status ?? (err as any)?.data?.statusCode ?? (typeof err?.code === "number" ? err.code : undefined)
  return typeof s === "number" ? s : undefined
}
function getServerMessage(err: MaybeHttpError) {
  const data = err?.response?.data ?? (err as any)?.data
  const msg = firstNonEmpty(Array.isArray(data?.message) ? data?.message?.[0] : data?.message, data?.error, data?.detail)
  return String(msg || "")
}
function isNetworkError(err: MaybeHttpError) {
  const m = (err?.message || "").toLowerCase()
  return m.includes("network error") || m.includes("failed to fetch") || m.includes("load failed") || (m.includes("fetch") && m.includes("typeerror"))
}
function isCorsError(err: MaybeHttpError) { const m = (err?.message || "").toLowerCase(); return m.includes("cors") || m.includes("blocked by cors") }
function isTimeout(err: MaybeHttpError) { const m = (err?.message || "").toLowerCase(); return m.includes("timeout") || m.includes("timed out") || err?.code === "ECONNABORTED" }

function parseAuthError(err: unknown): string {
  const e = (err || {}) as MaybeHttpError
  const status = getStatus(e)
  const msgLower = (e?.message || "").toLowerCase()
  const serverMsg = getServerMessage(e).toLowerCase()

  if (isTimeout(e)) return "El servidor tardó demasiado en responder. Inténtalo de nuevo en un momento."
  if (isCorsError(e)) return "No se pudo contactar al servidor por configuración CORS. Verifica la URL del API y CORS."
  if (isNetworkError(e) || (typeof navigator !== "undefined" && !navigator.onLine)) return "Sin conexión o servidor inaccesible. Revisa tu internet o que el backend esté activo."

  const notFound = ["user not found", "usuario no encontrado", "no existe usuario", "not registered"]
  if (status === 404 || notFound.some(t => msgLower.includes(t) || serverMsg.includes(t))) return "No existe una cuenta con ese correo."

  const badPass = ["invalid password", "wrong password", "contraseña incorrecta", "clave incorrecta"]
  if (status === 401 || badPass.some(t => msgLower.includes(t) || serverMsg.includes(t))) return "La contraseña es incorrecta."

  if (status === 403 || serverMsg.includes("inactive") || serverMsg.includes("inactivo")) return "Tu cuenta no tiene permiso para iniciar sesión o está inactiva."
  if (status === 409 || serverMsg.includes("unverified") || serverMsg.includes("no verificado")) return "Tu correo no está verificado. Revisa tu bandeja o solicita un nuevo enlace."
  if (status === 423 || msgLower.includes("locked") || serverMsg.includes("locked") || serverMsg.includes("bloqueada")) return "Tu cuenta está temporalmente bloqueada. Intenta más tarde o contacta al administrador."
  if (status === 429 || msgLower.includes("too many") || serverMsg.includes("demasiados intentos")) return "Demasiados intentos. Intenta de nuevo en unos minutos."

  if (status === 400 || status === 422) {
    const list = asArray((e?.response?.data ?? (e as any)?.data)?.message)
    const pretty = list.length ? list.join(" · ") : getServerMessage(e)
    return pretty || "Datos inválidos. Revisa el correo y la contraseña."
  }

  if (status && status >= 500) return "El servidor encontró un problema. Inténtalo de nuevo más tarde."
  return "No se pudo iniciar sesión. Intenta de nuevo."
}

function validateReset(tokenRaw: string, pw1Raw: string, pw2Raw: string) {
  const token = normalize(tokenRaw)
  const pw1 = normalize(pw1Raw)
  const pw2 = normalize(pw2Raw)

  const longEnough = pw1.length >= 8
  const hasUpper   = /[A-Z]/.test(pw1)
  const hasDigit   = /\d/.test(pw1)
  const hasSpecial = hasSpecialChar(pw1)
  const same       = pw1 === pw2
  const hasToken   = token.length > 0

  const ok = hasToken && longEnough && hasUpper && hasDigit && hasSpecial && same

  let firstMsg = ""
  if (!hasToken)   firstMsg ||= "Pega el token de recuperación."
  if (!longEnough) firstMsg ||= "La contraseña debe tener al menos 8 caracteres."
  if (!hasUpper)   firstMsg ||= "La contraseña debe incluir al menos 1 mayúscula."
  if (!hasDigit)   firstMsg ||= "La contraseña debe incluir al menos 1 número."
  if (!hasSpecial) firstMsg ||= "La contraseña debe incluir al menos 1 carácter especial."
  if (!same)       firstMsg ||= "Las contraseñas no coinciden."

  return { ok, flags: { hasToken, longEnough, hasUpper, hasDigit, hasSpecial, same }, firstMsg }
}

function OnlineStatusBanner() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    return () => {
      window.removeEventListener("online", on)
      window.removeEventListener("offline", off)
    }
  }, [])
  if (online) return null
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-destructive text-destructive-foreground text-center text-sm py-2">
      Sin conexión. Algunas acciones no funcionarán.
    </div>
  )
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get("next") || "/dashboard"

  const [openForgot, setOpenForgot] = useState(false)
  const [tab, setTab] = useState<"solicitar" | "restablecer">("solicitar")

  const [fpEmail, setFpEmail] = useState("")
  const [fpLoading, setFpLoading] = useState(false)
  const [fpMsg, setFpMsg] = useState<string | null>(null)
  const [fpErr, setFpErr] = useState<string | null>(null)

  const [rpToken, setRpToken] = useState("")
  const [rpP1, setRpP1] = useState("")
  const [rpP2, setRpP2] = useState("")
  const [rpLoading, setRpLoading] = useState(false)
  const [rpMsg, setRpMsg] = useState<string | null>(null)
  const [rpErr, setRpErr] = useState<string | null>(null)

  const { ok: canReset, flags, firstMsg } = useMemo(
    () => validateReset(rpToken, rpP1, rpP2),
    [rpToken, rpP1, rpP2]
  )

  const { toast } = useToast()

  function withTimeout<T>(promise: Promise<T>, ms = 12_000): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject({ message: "timeout", code: "ECONNABORTED" } as MaybeHttpError), ms)
      promise.then((v) => { clearTimeout(id); resolve(v) }, (e) => { clearTimeout(id); reject(e) })
    })
  }

  // Handler sin submit nativo
  const handleSubmit = async () => {
    if (isLoading) return

    const emailNorm = normalize(email).toLowerCase()
    const passNorm = normalize(password)

    if (!emailNorm || !passNorm) {
      toast({ title: "Campos incompletos", description: "Por favor, completa todos los campos.", variant: "destructive" })
      return
    }
    if (!isValidEmail(emailNorm)) {
      toast({ title: "Correo inválido", description: "Ingresa un correo válido.", variant: "destructive" })
      return
    }

    try {
      const result = await withTimeout(login(emailNorm, passNorm), 12_000)

      if (result === true) {
        toast({ title: "Sesión iniciada", description: "Redirigiendo al panel…" })
        router.replace(next)
        return
      }

      const errObj = (result as any)?.error ?? result
      const msg = parseAuthError(errObj) || "No se pudo iniciar sesión."
      toast({ title: "Error al iniciar sesión", description: msg, variant: "destructive" })
      if (process.env.NODE_ENV === "development") console.warn("login result ▶", result)
    } catch (err: any) {
      const msg = parseAuthError(err) || "No se pudo iniciar sesión."
      toast({ title: "Error al iniciar sesión", description: msg, variant: "destructive" })
      if (process.env.NODE_ENV === "development") console.warn("login thrown ▶", err)
    }
  }

  const canSubmit = !!email && !!password && isValidEmail(email)

  // Capturamos Enter y evitamos submit nativo
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      void handleSubmit()
    }
  }

  // Forgot password
  async function submitForgot(e: React.FormEvent) {
    e.preventDefault()
    setFpErr(null); setFpMsg(null)
    const em = fpEmail.trim().toLowerCase()
    if (!isValidEmail(em)) { setFpErr("Ingresa un correo válido."); return }
    try {
      setFpLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      })
      const data = await res.json().catch(() => ({}))
      setFpMsg(data?.message || "Si tu correo está en el sistema, te enviamos un enlace. Revisa inbox/spam.")
      if (data?.token) { setRpToken(data.token); setTab("restablecer") }
    } catch {
      setFpMsg("Si tu correo está en el sistema, te enviamos un enlace. Revisa inbox/spam.")
    } finally { setFpLoading(false) }
  }

  // Reset password
  async function submitReset(e: React.FormEvent) {
    e.preventDefault()
    setRpErr(null); setRpMsg(null)
    const em = validateReset(rpToken, rpP1, rpP2)
    if (!em.ok) { setRpErr(em.firstMsg); return }
    try {
      setRpLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: normalize(rpToken), new_password: normalize(rpP1) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = firstNonEmpty(Array.isArray(data?.message) ? data?.message?.[0] : data?.message, data?.error)
        throw { response: { status: res.status, data }, message: msg } as MaybeHttpError
      }
      setRpMsg("Contraseña restablecida. Ahora puedes iniciar sesión.")
      setTimeout(() => {
        setOpenForgot(false)
        setTimeout(() => {
          const pwInput = document.getElementById("password") as HTMLInputElement | null
          pwInput?.focus()
        }, 250)
      }, 800)
    } catch (err: any) {
      setRpErr(parseAuthError(err) || "No se pudo restablecer la contraseña.")
    } finally { setRpLoading(false) }
  }

  useEffect(() => {
    if (!openForgot) {
      setTab("solicitar")
      setFpEmail(""); setFpLoading(false); setFpMsg(null); setFpErr(null)
      setRpToken(""); setRpP1(""); setRpP2(""); setRpLoading(false); setRpMsg(null); setRpErr(null)
    }
  }, [openForgot])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <OnlineStatusBanner />
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Image
                src={Logo}
                alt="Logo Rentas"
                width={180}
                height={48}
                className="h-6 md:h-8 w-auto"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sistema de Gestión</h1>
          <p className="text-muted-foreground mt-2">Accede a tu panel de administración</p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form noValidate>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="usuario@rentas.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); void handleSubmit() }
                    }}
                    className="bg-input border-border focus:ring-ring placeholder:text-neutral-300"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); void handleSubmit() }
                      }}
                      className="bg-input border-border focus:border-tertiary focus:ring-ring placeholder:text-neutral-300 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 grid place-items-center px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Botón principal (NO submit nativo) */}
                <Button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="w-full bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground"
                  disabled={isLoading || !canSubmit}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>

                {/* Botón de prueba (solo dev) */}
                {/* {process.env.NODE_ENV === "development" && (
                  <button
                    type="button"
                    onClick={() => toast({ title: "ERROR DE PRUEBA", description: "render OK", variant: "destructive" })}
                    className="text-xs underline text-muted-foreground"
                  >
                    Probar toast (dev)
                  </button>
                )} */}
              </div>
            </form>

            {/* Forgot password */}
            <div className="mt-4 text-center">
              <Dialog open={openForgot} onOpenChange={setOpenForgot}>
                <DialogTrigger asChild>
                  <button className="text-sm text-tertiary hover:text-tertiary/80 transition-colors underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl md:max-w-2xl p-0 overflow-hidden">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Recupera tu cuenta</DialogTitle>
                    <DialogDescription>Escribe tu correo y te enviaremos instrucciones</DialogDescription>
                  </DialogHeader>

                  <div className="px-6 md:px-12 py-10">
                    <div className="mx-auto -mt-2 mb-6 grid place-items-center">
                      <Image src={LogoSingle} alt="Logo" width={64} height={64} className="h-20 w-20 object-contain" priority />
                    </div>

                    <h2 className="text-center text-3xl md:text-[20px] font-extrabold tracking-tight" style={{ color: "#161C3D" }}>
                      Recupera tu cuenta
                    </h2>
                    <p className="mt-3 text-center text-base md:text-[15px] leading-relaxed max-w-2xl mx-auto" style={{ color: "#31385B" }}>
                      Escribe tu correo electrónico y recibirás las instrucciones para recuperar tu cuenta
                    </p>

                    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-8">
                      <TabsList className="mx-auto grid grid-cols-2 w-full max-w-md">
                        <TabsTrigger value="solicitar">Solicitar enlace</TabsTrigger>
                        <TabsTrigger value="restablecer">Restablecer (token)</TabsTrigger>
                      </TabsList>

                      <TabsContent value="solicitar" className="mt-6">
                        <form onSubmit={submitForgot} className="space-y-4 max-w-2xl mx-auto">
                          <div className="relative">
                            <Input
                              id="fp_email"
                              type="email"
                              placeholder="tu@correo.com"
                              value={fpEmail}
                              onChange={(e) => setFpEmail(e.target.value)}
                              disabled={fpLoading}
                              className="h-14 md:h-8 rounded-full border-2 px-6 text-base md:text-base placeholder:text-slate-400 focus-visible:ring-2"
                              style={{ borderColor: "#171B3A", boxShadow: "0 2px 0 rgba(0,0,0,0.02)" }}
                            />
                          </div>

                          {fpErr && <p className="text-sm text-red-600 text-center">{fpErr}</p>}
                          {fpMsg && <p className="text-sm text-muted-foreground text-center">{fpMsg}</p>}

                          <div className="pt-2">
                            <Button
                              type="submit"
                              disabled={fpLoading || !isValidEmail(fpEmail)}
                              className="w-full h-14 md:h-16 text-lg md:text-xl font-bold rounded-2xl hover:brightness-95 transition"
                              style={{ backgroundColor: "#FF5A2C", color: "white" }}
                            >
                              {fpLoading ? "Enviando…" : "Restablecer contraseña"}
                            </Button>
                          </div>
                        </form>
                      </TabsContent>

                      <TabsContent value="restablecer" className="mt-6">
                        <form onSubmit={submitReset} className="space-y-3 max-w-lg mx-auto">
                          <div className="space-y-2">
                            <Label htmlFor="rp_token">Token (para pruebas)</Label>
                            <Input id="rp_token" placeholder="Pega aquí el token" value={rpToken} onChange={(e) => setRpToken(e.target.value)} disabled={rpLoading} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="rp_p1">Nueva contraseña</Label>
                            <Input id="rp_p1" type="password" placeholder="••••••••" value={rpP1} onChange={(e) => setRpP1(e.target.value)} disabled={rpLoading} />
                            <ul className="text-xs text-muted-foreground list-disc ml-4">
                              <li>8+ caracteres</li><li>1 mayúscula</li><li>1 número</li><li>1 carácter especial</li>
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="rp_p2">Confirmar contraseña</Label>
                            <Input id="rp_p2" type="password" placeholder="••••••••" value={rpP2} onChange={(e) => setRpP2(e.target.value)} disabled={rpLoading} />
                          </div>

                          {!canReset && (rpToken || rpP1 || rpP2) && (
                            <div className="text-sm text-red-600 mt-2">{firstMsg}</div>
                          )}

                          <ul className="text-xs ml-4 mt-2 space-y-1">
                            <li className={flags.hasToken ? "text-green-600" : "text-red-600"}>Token pegado</li>
                            <li className={flags.longEnough ? "text-green-600" : "text-red-600"}>8+ caracteres</li>
                            <li className={flags.hasUpper ? "text-green-600" : "text-red-600"}>1 mayúscula</li>
                            <li className={flags.hasDigit ? "text-green-600" : "text-red-600"}>1 número</li>
                            <li className={flags.hasSpecial ? "text-green-600" : "text-red-600"}>1 carácter especial</li>
                            <li className={flags.same && rpP2 ? "text-green-600" : "text-red-600"}>Coinciden</li>
                          </ul>

                          {rpErr && <p className="text-sm text-red-600">{rpErr}</p>}
                          {rpMsg && <p className="text-sm text-green-600">{rpMsg}</p>}

                          <DialogFooter className="flex gap-2">
                            <Button type="submit" disabled={rpLoading || !canReset}>
                              {rpLoading ? "Guardando…" : "Restablecer"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 Rentas.com. Todos los derechos reservados.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-accent transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-accent transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </div>
  )
}
