import { cn } from "@/lib/utils";
import type { DownloadStatus, JobStatus } from "@/lib/mock-data";

type Status = DownloadStatus | JobStatus | "healthy" | "unhealthy";

const statusConfig: Record<Status, { label: string; className: string; dotClass: string }> = {
  queued: {
    label: "Na fila",
    className: "bg-secondary text-secondary-foreground",
    dotClass: "bg-muted-foreground",
  },
  downloading: {
    label: "Baixando",
    className: "bg-primary/20 text-primary",
    dotClass: "bg-primary",
  },
  processing: {
    label: "Processando",
    className: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  completed: {
    label: "Concluído",
    className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  failed: {
    label: "Falhou",
    className: "bg-destructive/20 text-destructive",
    dotClass: "bg-destructive",
  },
  healthy: {
    label: "Online",
    className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  unhealthy: {
    label: "Offline",
    className: "bg-destructive/20 text-destructive",
    dotClass: "bg-destructive",
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          config.dotClass,
          (status === "downloading" || status === "processing") && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}
