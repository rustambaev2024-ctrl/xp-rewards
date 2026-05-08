import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import { getAdminOrders, updateOrderStatus, getUsers } from "@/api/admin";
import type { Order, OrderStatus, User } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const columns: { status: OrderStatus; title: string; color: string }[] = [
  { status: "new", title: "Новые", color: "var(--color-status-new)" },
  { status: "confirmed", title: "Подтверждены", color: "var(--color-status-confirmed)" },
  { status: "delivered", title: "Выданы", color: "var(--color-status-delivered)" },
  { status: "cancelled", title: "Отменены", color: "var(--color-status-cancelled)" },
];

const statusFlow: OrderStatus[] = ["new", "confirmed", "delivered", "cancelled"];

function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminOrders(), getUsers()]).then(([o, u]) => { setOrders(o); setUsers(u); }).finally(() => setLoading(false));
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const ordersByStatus = useMemo(() => {
    const map = new Map<OrderStatus, Order[]>();
    columns.forEach((c) => map.set(c.status, []));
    orders.forEach((o) => map.get(o.status)?.push(o));
    return map;
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success("Статус обновлён");
    } catch {
      toast.error("Ошибка обновления статуса");
    }
  };

  if (loading) {
    return <ProtectedRoute roles={["admin"]}><AppShell section="admin"><LoadingSkeleton variant="podium" count={1} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Заказы</h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col, ci) => {
              const colOrders = ordersByStatus.get(col.status) ?? [];
              const statusIdx = statusFlow.indexOf(col.status);
              return (
                <motion.div key={col.status} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 * ci }}>
                  <div className="rounded-2xl border border-border bg-bg-secondary overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between" style={{ borderLeftColor: col.color, borderLeftWidth: 3 }}>
                      <h3 className="text-sm font-semibold text-text-primary">{col.title}</h3>
                      <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary">{colOrders.length}</span>
                    </div>
                    <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
                      <AnimatePresence>
                        {colOrders.map((order) => {
                          const u = userMap.get(order.user_id);
                          return (
                            <motion.div
                              key={order.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="rounded-xl bg-bg-elevated border border-border p-3"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar name={u ? `${u.first_name} ${u.last_name}` : "?"} size="sm" />
                                <span className="text-xs text-text-primary truncate">{u ? `${u.first_name} ${u.last_name}` : "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <img src={order.product.image_url} alt={order.product.name} className="h-8 w-8 rounded-lg object-cover" loading="lazy" />
                                <span className="text-xs text-text-secondary truncate flex-1">{order.product.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <CoinBadge amount={order.price} size="sm" />
                                <span className="text-[10px] text-text-muted">{formatRelativeTime(order.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                                {statusIdx > 0 && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleStatusChange(order.id, statusFlow[statusIdx - 1])}>
                                    <ChevronLeft size={12} /> Назад
                                  </Button>
                                )}
                                <div className="flex-1" />
                                {statusIdx < statusFlow.length - 1 && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleStatusChange(order.id, statusFlow[statusIdx + 1])}>
                                    Далее <ChevronRight size={12} />
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      {colOrders.length === 0 && (
                        <p className="text-xs text-text-muted text-center py-4">Пусто</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
