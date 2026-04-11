import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex gap-4 p-4">
        <Skeleton className="h-48 w-32 flex-shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3 py-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChapterCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

