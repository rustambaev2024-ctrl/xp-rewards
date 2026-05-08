import { cn } from "@/lib/utils";

interface Props {
  variant?: "card" | "row" | "avatar";
  className?: string;
}

export function Skeleton({ variant = "row", className }: Props) {
  const base = "animate-pulse bg-bg-elevated rounded-xl";
  if (variant === "card") return <div className={cn(base, "h-32 w-full", className)} />;
  if (variant === "avatar") return <div className={cn(base, "h-10 w-10 rounded-full", className)} />;
  return <div className={cn(base, "h-4 w-full", className)} />;
}
