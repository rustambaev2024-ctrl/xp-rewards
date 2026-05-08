import { Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatNumber } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

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
  const [display, setDisplay] = useState(amount);
  const prevRef = useRef(amount);

  useEffect(() => {
    if (prevRef.current !== amount) {
      prevRef.current = amount;
      setDisplay(amount);
    }
  }, [amount]);

  return (
    <span className={cn("inline-flex items-center font-mono font-semibold text-coin tabular-nums", s.wrap, className)}>
      <Coins size={s.icon} className="text-coin" />
      {sign}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={amount}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
        >
          {formatNumber(display)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
