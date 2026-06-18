'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export const TooltipProvider = TooltipPrimitive.Provider

export function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      {children}
    </TooltipPrimitive.Root>
  )
}

export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={6}
        className={cn(
          'z-50 max-w-xs rounded-md bg-ink px-3 py-2 text-xs text-surface shadow-md',
          'animate-in fade-in-0 zoom-in-95',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-ink" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
