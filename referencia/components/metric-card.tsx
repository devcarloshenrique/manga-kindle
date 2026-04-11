import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Download, Layers, BookOpen, Plug, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  download: Download,
  layers: Layers,
  book: BookOpen,
  plug: Plug,
};

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function MetricCard({ label, value, icon, trend, className }: MetricCardProps) {
  const Icon = iconMap[icon] || Download;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-success" : "text-destructive"
                )}
              >
                {trend.positive ? "+" : "-"}{trend.value}% vs última semana
              </p>
            )}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
