"use client"

import * as React from "react"
import { useToast as useShadcnToast } from '@/components/ui/use-toast'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  action?: React.ReactNode
  duration?: number
}

export function useToast() {
  const { toast } = useShadcnToast()

  return {
    toast,
    success: (title: string, description?: string) => {
      toast({ title, description, variant: 'success', duration: 4000 })
    },
    error: (title: string, description?: string) => {
      toast({ title, description, variant: 'destructive', duration: 4000 })
    },
    warning: (title: string, description?: string) => {
      toast({ title, description, variant: 'warning', duration: 4000 })
    },
    info: (title: string, description?: string) => {
      toast({ title, description, variant: 'default', duration: 4000 })
    },
  }
}
