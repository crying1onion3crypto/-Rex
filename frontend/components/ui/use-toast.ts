"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from '@/components/ui/toaster'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 100000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> & { id: string } }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: string }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This could be extract into a dismissToast() function
      if (toastId) {
        const timeout = toastTimeouts.get(toastId)
        if (timeout) {
          clearTimeout(timeout)
          toastTimeouts.delete(toastId)
        }
      } else {
        toastTimeouts.forEach((timeout) => clearTimeout(timeout))
        toastTimeouts.clear()
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || !toastId ? { ...t, open: false } : t
        ),
      }
    }

    case actionTypes.REMOVE_TOAST: {
      if (action.toastId) {
        toastTimeouts.delete(action.toastId)
      } else {
        toastTimeouts.forEach((timeout) => clearTimeout(timeout))
        toastTimeouts.clear()
      }

      return {
        ...state,
        toasts: state.toasts.filter(
          (t) => t.id !== action.toastId && (!action.toastId || t.open)
        ),
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

const dispatch = (action: Action) => {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Subscribe = (callback: (state: State) => void) => () => void

const subscribe: Subscribe = (callback) => {
  listeners.push(callback)
  return () => {
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

export const toast = ({
  ...props
}: ToastProps & { id?: string; duration?: number }) => {
  const id = props.id ?? Math.random().toString(36).substring(2, 9)

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  addToRemoveQueue(id)

  return {
    id,
    dismiss,
    update,
  }
}

const useToast = () => {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    const unsubscribe = subscribe(setState)
    return () => unsubscribe()
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { useToast, toast, subscribe, actionTypes }
