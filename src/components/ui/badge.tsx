import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-primary/10 text-primary',
        secondary: 'bg-muted text-muted-foreground',
        outline:   'border border-border text-ink',
        below:     'bg-attainment-below-bg text-attainment-below border border-attainment-below/30',
        border:    'bg-attainment-border-bg text-attainment-border border border-attainment-border/30',
        above:     'bg-attainment-above-bg text-attainment-above border border-attainment-above/30',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
