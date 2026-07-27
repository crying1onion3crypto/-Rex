"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from '@/lib/utils'

const Select = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    type="button"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <Select ref={ref} className={cn("flex gap-2", className)} {...props}>
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </Select>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    className={cn("text-ellipsis overflow-hidden whitespace-nowrap", className)}
    ref={ref}
    {...props}
  />
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      className
    )}
    ref={ref}
    {...props}
  >
    <div className="p-1">
      {children}
    </div>
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
