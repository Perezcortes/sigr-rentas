"use client"

import { toast as sonnerToast } from "sonner"

type Variant = "default" | "destructive"

interface ToastInput {
  title?: string
  description?: string
  variant?: Variant
}

export function useToast() {
  function toast({ title, description, variant = "default" }: ToastInput) {
    if (variant === "destructive") {
      if (title && description) return sonnerToast.error(title, { description })
      return sonnerToast.error(title ?? description ?? "Error")
    } else {
      if (title && description) return sonnerToast.success(title, { description })
      return sonnerToast.success(title ?? description ?? "Operación exitosa")
    }
  }

  return { toast }
}
