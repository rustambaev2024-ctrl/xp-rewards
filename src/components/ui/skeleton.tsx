import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "row" | "avatar";
}

export function Skeleton({ variant = "row", className, ...rest }: Props) {
  const base = "animate-pulse bg-bg-elevated rounded-xl";
  if (variant === "card") return <div className={cn(base, "h-32 w-full", className)} {...rest} />;
  if (variant === "avatar") return <div className={cn(base, "h-10 w-10 rounded-full", className)} {...rest} />;
  return <div className={cn(base, "h-4 w-full", className)} {...rest} />;
}
