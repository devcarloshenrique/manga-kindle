"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockWeekly } from "@/lib/mock-data";

export function WeeklyChart() {
  const maxValue = Math.max(...mockWeekly.map((w) => w.value));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Conversões na Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockWeekly.map((item) => (
            <div key={item.day} className="flex items-center gap-3">
              <span className="w-8 text-sm text-muted-foreground">{item.day}</span>
              <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
