"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import Logo from "@/public/sigr_images/LogoRentas.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

// shadcn/ui
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

function normalize(s: string) {
  return s.trim()
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function strongPassword(pw: string) {
  // 8+, mayúscula, número y caracter especial
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pw)
}

type MaybeHttpError = {
  status?: number
  message?: string
  code?: string | number
  response?: {
    status?: number
    data?: any
  }
}

/** Traduce distintos formatos de error a mensajes para el usuario */
function parseAuthError(err: unknown): string {
  const e = err as MaybeHttpError
  const status =
    e?.status ??
    e?.response?.status ??
    (typeof e?.code === "number" ? e.code : undefined)

  const msg = (e?.message || "").toLowerCase()
  const serverMsg = (e?.response as any)?.data?.message
  const serverMsgNorm = (Array.isArray(serverMsg) ? serverMsg[0] : serverMsg)?.toLowerCase?.() || ""

  if (
    status === 404 ||
    msg.includes("user not found") ||
    serverMsgNorm.includes("user not found") ||
    serverMsgNorm.includes("usuario no encontrado") ||
    msg.includes("no user") ||
    serverMsgNorm.includes("no existe usuario")
  ) {
    return "No existe una cuenta con ese correo."
  }

  if (
    status === 401 ||
    msg.includes("invalid password") ||
    msg.includes("wrong password") ||
    serverMsgNorm.includes("invalid password") ||
    serverMsgNorm.includes("contraseña incorrecta") ||
    serverMsgNorm.includes("clave incorrecta")
  ) {
    return "La contraseña es incorrecta."
  }

  if (
    status === 423 ||
    msg.includes("locked") ||
    serverMsgNorm.includes("locked") ||
    serverMsgNorm.includes("bloqueada")
  ) {
    return "Tu cuenta está temporalmente bloqueada. Intenta más tarde o contacta al administrador."
  }

  if (status === 429 || msg.includes("too many") || serverMsgNorm.includes("demasiados intentos")) {
    return "Demasiados intentos. Intenta de nuevo en unos minutos."
  }

  return "No se pudo iniciar sesión. Intenta de nuevo."
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get("next") || "/dashboard"

  // ✅ Ref para enfocar el campo password después de reset exitoso
  const passwordRef = useRef<HTMLInputElement>(null)

  // Estado modal "Olvidé contraseña"
  const [openForgot, setOpenForgot] = useState(false)
  const [tab, setTab] = useState<"solicitar" | "restablecer">("solicitar")

  // Solicitar enlace
  const [fpEmail, setFpEmail] = useState("")
  const [fpLoading, setFpLoading] = useState(false)
  const [fpMsg, setFpMsg] = useState<string | null>(null)
  const [fpErr, setFpErr] = useState<string | null>(null)

  // Restablecer con token manual (para pruebas locales)
  const [rpToken, setRpToken] = useState("")
  const [rpP1, setRpP1] = useState("")
  const [rpP2, setRpP2] = useState("")
  const [rpLoading, setRpLoading] = useState(false)
  const [rpMsg, setRpMsg] = useState<string | null>(null)
  const [rpErr, setRpErr] = useState<string | null>(null)

  // Auto-ocultar la alerta después de 3.5s
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(""), 3500)
    return () => clearTimeout(t)
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setError("")

    const emailNorm = normalize(email).toLowerCase()
    const passNorm = normalize(password)

    if (!emailNorm || !passNorm) {
      setError("Por favor, completa todos los campos")
      return
    }
    if (!isValidEmail(emailNorm)) {
      setError("Ingresa un correo válido")
      return
    }

    try {
      const result = await login(emailNorm, passNorm)

      if (typeof result === "boolean") {
        if (result) {
          router.replace(next)
        } else {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.")
        }
        return
      }

      const ok = (result as any)?.ok
      if (ok) {
        router.replace(next)
        return
      }

      const maybeErrMsg = parseAuthError(result as any)
      setError(maybeErrMsg)
    } catch (err: any) {
      setError(parseAuthError(err))
    }
  }

  const canSubmit = !!email && !!password && isValidEmail(email)

  // === Handlers: Forgot Password (solicitar) ===
  async function submitForgot(e: React.FormEvent) {
    e.preventDefault()
    setFpErr(null)
    setFpMsg(null)
    const em = fpEmail.trim().toLowerCase()
    if (!isValidEmail(em)) {
      setFpErr("Ingresa un correo válido.")
      return
    }
    try {
      setFpLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      })
      // Mensaje genérico anti-enumeración
      const data = await res.json().catch(() => ({}))
      setFpMsg(data?.message || "Si tu correo está en el sistema, te enviamos un enlace. Revisa inbox/spam.")

      // ⬇️ Autocompletar token y cambiar a pestaña "restablecer" si el back lo devuelve (dev)
      if (data?.token) {
        setRpToken(data.token)
        setTab("restablecer")
      }
    } catch {
      setFpMsg("Si tu correo está en el sistema, te enviamos un enlace. Revisa inbox/spam.")
    } finally {
      setFpLoading(false)
    }
  }

  // === Handlers: Reset Password (con token manual para pruebas) ===
  async function submitReset(e: React.FormEvent) {
    e.preventDefault()
    setRpErr(null)
    setRpMsg(null)

    if (!rpToken) {
      setRpErr("Pega el token que recibiste por correo (o copiado desde BD).")
      return
    }
    if (!strongPassword(rpP1)) {
      setRpErr("La contraseña debe tener 8+ caracteres, 1 mayúscula, 1 número y 1 especial.")
      return
    }
    if (rpP1 !== rpP2) {
      setRpErr("Las contraseñas no coinciden.")
      return
    }

    try {
      setRpLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rpToken, new_password: rpP1 }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Token inválido o expirado.")

      setRpMsg("Contraseña restablecida. Ahora puedes iniciar sesión.")

      // ✅ Cierra modal y enfoca el password del login
      // Damos un pequeño tiempo para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        setOpenForgot(false)          // cierra modal -> el useEffect limpiará estados
        setTimeout(() => {
          passwordRef.current?.focus() // focus al campo password
        }, 250)
      }, 800)
    } catch (err: any) {
      setRpErr(err?.message || "No se pudo restablecer la contraseña.")
    } finally {
      setRpLoading(false)
    }
  }

  // Reset de estados al abrir/cerrar modal
  useEffect(() => {
    if (!openForgot) {
      setTab("solicitar")
      setFpEmail("")
      setFpLoading(false)
      setFpMsg(null)
      setFpErr(null)
      setRpToken("")
      setRpP1("")
      setRpP2("")
      setRpLoading(false)
      setRpMsg(null)
      setRpErr(null)
    }
  }, [openForgot])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  className="bg-input border-border focus:ring-ring placeholder:text-neutral-300"
                  disabled={isLoading}
                  aria-invalid={Boolean(error)}
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
                    className="bg-input border-border focus:border-tertiary focus:ring-ring placeholder:text-neutral-300 pr-10"
                    disabled={isLoading}
                    aria-invalid={Boolean(error)}
                    ref={passwordRef}  // ✅ ref para focus tras reset
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

              {/* Alert con animación */}
              <AnimatePresence initial={false} mode="popLayout">
                {error && (
                  <motion.div
                    key={error}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    layout
                  >
                    <Alert variant="destructive" role="alert" aria-live="polite" className="shadow-sm">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
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
            </form>

            <div className="mt-4 text-center">
              {/* Abre modal */}
              <Dialog open={openForgot} onOpenChange={setOpenForgot}>
                <DialogTrigger asChild>
                  <button className="text-sm text-tertiary hover:text-tertiary/80 transition-colors underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Recuperar / Restablecer contraseña</DialogTitle>
                    <DialogDescription>
                      Solicita el enlace por correo o usa tu token manualmente para pruebas locales.
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="solicitar">Solicitar enlace</TabsTrigger>
                      <TabsTrigger value="restablecer">Restablecer (con token)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="solicitar" className="mt-4">
                      <form onSubmit={submitForgot} className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="fp_email">Correo</Label>
                          <Input
                            id="fp_email"
                            type="email"
                            placeholder="usuario@rentas.com"
                            value={fpEmail}
                            onChange={(e) => setFpEmail(e.target.value)}
                            disabled={fpLoading}
                          />
                        </div>
                        {fpErr && <p className="text-sm text-red-600">{fpErr}</p>}
                        {fpMsg && <p className="text-sm text-muted-foreground">{fpMsg}</p>}
                        <DialogFooter>
                          <Button type="submit" disabled={fpLoading || !isValidEmail(fpEmail)}>
                            {fpLoading ? "Enviando…" : "Enviar enlace"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </TabsContent>

                    <TabsContent value="restablecer" className="mt-4">
                      <form onSubmit={submitReset} className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="rp_token">Token (para pruebas)</Label>
                          <Input
                            id="rp_token"
                            placeholder="Pega aquí el token"
                            value={rpToken}
                            onChange={(e) => setRpToken(e.target.value)}
                            disabled={rpLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rp_p1">Nueva contraseña</Label>
                          <Input
                            id="rp_p1"
                            type="password"
                            placeholder="••••••••"
                            value={rpP1}
                            onChange={(e) => setRpP1(e.target.value)}
                            disabled={rpLoading}
                          />
                          <ul className="text-xs text-muted-foreground list-disc ml-4">
                            <li>8+ caracteres</li>
                            <li>1 mayúscula</li>
                            <li>1 número</li>
                            <li>1 caracter especial</li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rp_p2">Confirmar contraseña</Label>
                          <Input
                            id="rp_p2"
                            type="password"
                            placeholder="••••••••"
                            value={rpP2}
                            onChange={(e) => setRpP2(e.target.value)}
                            disabled={rpLoading}
                          />
                        </div>

                        {rpErr && <p className="text-sm text-red-600">{rpErr}</p>}
                        {rpMsg && <p className="text-sm text-green-600">{rpMsg}</p>}

                        <DialogFooter className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={
                              rpLoading ||
                              !rpToken ||
                              !rpP1 ||
                              !rpP2 ||
                              rpP1 !== rpP2 ||
                              !strongPassword(rpP1)
                            }
                          >
                            {rpLoading ? "Guardando…" : "Restablecer"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </TabsContent>
                  </Tabs>
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
