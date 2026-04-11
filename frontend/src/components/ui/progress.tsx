import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const normalized = Math.min(max, Math.max(0, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={normalized}
        className={cn('relative h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]', className)}
        {...props}
      >
        <progress
          value={normalized}
          max={max}
          className="h-full w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-[hsl(var(--primary))] [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-300 [&::-moz-progress-bar]:bg-[hsl(var(--primary))]"
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress };
