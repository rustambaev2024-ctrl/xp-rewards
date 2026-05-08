import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  delta?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({ icon, title, value, delta, className }: Props) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">{title}</span>
        <span className="rounded-lg bg-bg-elevated p-2 text-primary">{icon}</span>
      </div>
      <div className="font-mono text-3xl font-bold text-text-primary tabular-nums">{value}</div>
      {delta && (
        <div className={cn("text-xs font-medium", delta.positive ? "text-earn" : "text-spend")}>
          {delta.positive ? "▲" : "▼"} {delta.value}
        </div>
      )}
    </Card>
  );
}
