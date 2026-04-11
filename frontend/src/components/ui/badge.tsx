import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-transparent',
        outline: 'text-foreground border border-border bg-transparent',
        success: 'bg-success text-success-foreground border border-transparent hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground border border-transparent hover:bg-warning/90',
        info: 'bg-sky-500 text-white border border-transparent hover:bg-sky-600',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
