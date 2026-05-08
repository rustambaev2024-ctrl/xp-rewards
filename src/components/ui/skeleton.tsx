import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "row" | "avatar" | "hero" | "table-row" | "chart" | "podium";
  columns?: number;
}

export function Skeleton({ variant = "row", className, columns, ...rest }: Props) {
  const base = "animate-pulse bg-bg-elevated rounded-xl";

  if (variant === "card") return <div className={cn(base, "h-32 w-full", className)} {...rest} />;
  if (variant === "avatar") return <div className={cn(base, "h-10 w-10 rounded-full", className)} {...rest} />;
  if (variant === "hero") {
    return (
      <div className={cn("flex items-center gap-4", className)} {...rest}>
        <div className={cn(base, "h-14 w-14 rounded-full shrink-0")} />
        <div className="flex-1 space-y-2">
          <div className={cn(base, "h-4 w-3/4")} />
          <div className={cn(base, "h-3 w-1/2")} />
        </div>
      </div>
    );
  }
  if (variant === "table-row") {
    const cols = columns ?? 4;
    return (
      <div className={cn("flex items-center gap-3 py-3 px-4", className)} {...rest}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={cn(base, "h-4 flex-1", i === 0 ? "max-w-[120px]" : "")} />
        ))}
      </div>
    );
  }
  if (variant === "chart") {
    return <div className={cn(base, "h-56 w-full", className)} {...rest} />;
  }
  if (variant === "podium") {
    return (
      <div className={cn("flex items-end justify-center gap-4 pt-4", className)} {...rest}>
        <div className={cn(base, "w-28 h-32 rounded-2xl")} />
        <div className={cn(base, "w-32 h-40 rounded-2xl")} />
        <div className={cn(base, "w-28 h-28 rounded-2xl")} />
      </div>
    );
  }
  return <div className={cn(base, "h-4 w-full", className)} {...rest} />;
}
