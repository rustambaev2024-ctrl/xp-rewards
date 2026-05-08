import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  level: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const colorFor = (lvl: number) => {
  if (lvl >= 4) return "bg-level-4/15 text-level-4 border-level-4/40";
  if (lvl === 3) return "bg-level-3/15 text-level-3 border-level-3/40";
  if (lvl === 2) return "bg-level-2/15 text-level-2 border-level-2/40";
  return "bg-level-1/15 text-level-1 border-level-1/40";
};

const sizes = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-base px-3 py-1.5 gap-2",
};

export function LevelBadge({ level, size = "md", className }: Props) {
  return (
    <span className={cn("inline-flex items-center rounded-full border font-semibold", colorFor(level), sizes[size], className)}>
      {level >= 4 && <Crown size={size === "lg" ? 16 : 12} />}
      Level {level}
    </span>
  );
}
