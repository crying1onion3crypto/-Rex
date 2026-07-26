'use client';

import { useToast as useShadcnToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

export function useToast() {
  const { toast } = useShadcnToast();

  const showToast = ({
    title,
    description,
    variant = 'default',
    action,
    duration = 4000,
  }: ToastProps) => {
    toast({
      title,
      description,
      variant,
      action,
      duration,
    });
  };

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'success',
      duration: 4000,
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
      duration: 4000,
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'warning',
      duration: 4000,
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      duration: 4000,
    });
  };

  return {
    toast: showToast,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
  };
}
