"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

function normalize(s: string) {
  return s.trim()
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
              <a href="#" className="text-sm text-tertiary hover:text-tertiary/80 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        {/* <Card className="border-border bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm mb-3 text-foreground">Credenciales de prueba:</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div><strong>Administrador:</strong> admin@rentas.com / admin123</div>
              <div><strong>Gerente:</strong> gerente@rentas.com / gerente123</div>
              <div><strong>Agente:</strong> agente@rentas.com / agente123</div>
            </div>
          </CardContent>
        </Card> */}

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
