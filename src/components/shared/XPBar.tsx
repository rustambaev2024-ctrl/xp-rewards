import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  current: number;
  max: number;
  level?: number;
  className?: string;
  showLabel?: boolean;
}

export function XPBar({ current, max, level, className, showLabel = true }: Props) {
  const pct = Math.min(100, Math.max(0, (current / max) * 100));
  const remaining = Math.max(0, max - current);
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-mono text-text-secondary tabular-nums">
            {current.toLocaleString("ru-RU")} / {max.toLocaleString("ru-RU")} XP
          </span>
          {level !== undefined && (
            <span className="text-text-muted">До уровня {level + 1}: {remaining} XP</span>
          )}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-elevated">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-xp to-coin"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
