import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-bg-elevated text-text-secondary border border-border",
      coin: "bg-coin/15 text-coin border border-coin/30",
      xp: "bg-xp/15 text-xp border border-xp/30",
      earn: "bg-earn/15 text-earn border border-earn/30",
      spend: "bg-spend/15 text-spend border border-spend/30",
      penalty: "bg-penalty/15 text-penalty border border-penalty/30",
      new: "bg-status-new/15 text-status-new border border-status-new/30",
      confirmed: "bg-status-confirmed/15 text-status-confirmed border border-status-confirmed/30",
      delivered: "bg-status-delivered/15 text-status-delivered border border-status-delivered/30",
      cancelled: "bg-status-cancelled/15 text-status-cancelled border border-status-cancelled/30",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export const orderStatusVariant = (s: "new" | "confirmed" | "delivered" | "cancelled") => s;
