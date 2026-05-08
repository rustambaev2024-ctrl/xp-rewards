import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { Package } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getOrders } from "@/api/student";
import type { Order, OrderStatus } from "@/types";

export const Route = createFileRoute("/student/orders")({
  component: Page,
});

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

type StatusFilter = "all" | OrderStatus;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "new", label: "В обработке" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "delivered", label: "Выдан" },
  { value: "cancelled", label: "Отменён" },
];

const statusVariant: Record<OrderStatus, "new" | "confirmed" | "delivered" | "cancelled"> = {
  new: "new",
  confirmed: "confirmed",
  delivered: "delivered",
  cancelled: "cancelled",
};

const statusLabel: Record<OrderStatus, string> = {
  new: "В обработке",
  confirmed: "Подтверждён",
  delivered: "Выдан",
  cancelled: "Отменён",
};

function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  if (loading) {
    return (
      <ProtectedRoute roles={["student"]}>
        <AppShell section="student">
          <LoadingSkeleton variant="store-grid" count={3} />
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Мои заказы</h1>
          </motion.div>

          {/* Status filter chips */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                    statusFilter === opt.value
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-bg-elevated text-text-secondary border-border hover:bg-bg-elevated/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Orders list */}
          {filtered.length === 0 ? (
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
              <EmptyState
                icon="📦"
                title="Нет заказов"
                description={statusFilter !== "all" ? "Нет заказов с выбранным статусом." : "Ещё нет покупок. Загляни в магазин!"}
              />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((order, i) => (
                <motion.div
                  key={order.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.08 * (i + 1) }}
                >
                  <Card className="overflow-hidden h-full flex flex-col">
                    {/* Product image */}
                    <div className="relative h-36 bg-bg-elevated overflow-hidden">
                      <img
                        src={order.product.image_url}
                        alt={order.product.name}
                        className="h-full w-full object-cover opacity-80"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={statusVariant[order.status]}>
                          {statusLabel[order.status]}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="flex-1 flex flex-col gap-2 pt-4">
                      <div className="flex items-start gap-2">
                        <Package size={16} className="text-text-muted mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {order.product.name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {formatRelativeTime(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto pt-2 border-t border-border">
                        <CoinBadge amount={order.price} size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
