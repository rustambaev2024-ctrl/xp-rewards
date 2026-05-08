import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  amount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showSign?: boolean;
}

const sizes = {
  sm: { wrap: "text-xs gap-1", icon: 12 },
  md: { wrap: "text-sm gap-1.5", icon: 16 },
  lg: { wrap: "text-2xl gap-2", icon: 24 },
};

export function CoinBadge({ amount, size = "md", className, showSign = false }: Props) {
  const s = sizes[size];
  const sign = showSign && amount > 0 ? "+" : "";
  return (
    <span className={cn("inline-flex items-center font-mono font-semibold text-coin tabular-nums", s.wrap, className)}>
      <Coins size={s.icon} className="text-coin" />
      {sign}
      {amount.toLocaleString("ru-RU")}
    </span>
  );
}
