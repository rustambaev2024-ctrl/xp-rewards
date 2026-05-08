import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Coins, Users, Package, ShoppingBag } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getUsers, getAdminTransactions, getAdminOrders, getAdminProducts } from "@/api/admin";
import type { Transaction, Order, User, Product, TxType } from "@/types";

export const Route = createFileRoute("/admin/dashboard")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const txVariant: Record<TxType, "earn" | "spend" | "penalty"> = { earn: "earn", spend: "spend", penalty: "penalty" };
const txLabel: Record<TxType, string> = { earn: "Начисление", spend: "Покупка", penalty: "Штраф" };

const statusVariant: Record<string, "new" | "confirmed" | "delivered" | "cancelled"> = {
  new: "new", confirmed: "confirmed", delivered: "delivered", cancelled: "cancelled",
};
const statusLabel: Record<string, string> = {
  new: "В обработке", confirmed: "Подтверждён", delivered: "Выдан", cancelled: "Отменён",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getAdminTransactions(), getAdminOrders(), getAdminProducts()])
      .then(([u, t, o, p]) => { setUsers(u); setTransactions(t); setOrders(o); setProducts(p); })
      .finally(() => setLoading(false));
  }, []);

  const totalAwarded = useMemo(() => transactions.filter((t) => t.type === "earn").reduce((s, t) => s + t.amount, 0), [transactions]);
  const activeStudents = useMemo(() => users.filter((u) => u.role === "student" && u.is_active).length, [users]);
  const activeOrders = useMemo(() => orders.filter((o) => o.status === "new" || o.status === "confirmed").length, [orders]);
  const activeProducts = useMemo(() => products.filter((p) => p.is_active).length, [products]);

  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    transactions.filter((t) => t.type === "earn").forEach((t) => {
      const day = t.created_at.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + t.amount);
    });
    const days: { date: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      days.push({ date: label, amount: byDay.get(key) ?? 0 });
    }
    return days;
  }, [transactions]);

  const pieData = useMemo(() => [
    { name: "Начисление", value: transactions.filter((t) => t.type === "earn").length, color: "var(--color-earn)" },
    { name: "Покупка", value: transactions.filter((t) => t.type === "spend").length, color: "var(--color-spend)" },
    { name: "Штраф", value: transactions.filter((t) => t.type === "penalty").length, color: "var(--color-penalty)" },
  ], [transactions]);

  if (loading) {
    return <ProtectedRoute roles={["admin","teacher"]}><AppShell section="admin"><LoadingSkeleton variant="card" count={4} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin","teacher"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Дашборд</h1>
          </motion.div>

          {/* KPI cards */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Coins size={18} className="text-coin" />} title="Всего выдано монет" value={<span className="text-coin">{totalAwarded.toLocaleString("ru-RU")}</span>} />
              <StatCard icon={<Users size={18} className="text-primary" />} title="Активных студентов" value={activeStudents.toString()} />
              <StatCard icon={<Package size={18} className="text-status-new" />} title="Активных заказов" value={activeOrders.toString()} />
              <StatCard icon={<ShoppingBag size={18} className="text-earn" />} title="Товаров в магазине" value={activeProducts.toString()} />
            </div>
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader><CardTitle>Выдача монет по дням</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                        <XAxis dataKey="date" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} interval={4} />
                        <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} width={50} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-text-primary)", fontSize: 13 }} />
                        <Line type="monotone" dataKey="amount" stroke="var(--color-coin)" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader><CardTitle>Транзакции по типам</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={4}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-text-primary)", fontSize: 13 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader><CardTitle>Последние транзакции</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transactions.slice(0, 10).map((t) => {
                      const u = users.find((u) => u.id === t.user_id);
                      return (
                        <div key={t.id} className="flex items-center gap-3 text-sm">
                          <Badge variant={txVariant[t.type]}>{txLabel[t.type]}</Badge>
                          <span className="font-mono tabular-nums text-text-primary">{t.type === "earn" ? "+" : "-"}{t.amount}</span>
                          <span className="text-text-muted truncate flex-1">{t.reason}</span>
                          <span className="text-text-muted text-xs shrink-0">{u ? `${u.first_name} ${u.last_name}` : "—"} · {formatDate(t.created_at)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader><CardTitle>Последние заказы</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center gap-3 text-sm">
                        <Badge variant={statusVariant[o.status]}>{statusLabel[o.status]}</Badge>
                        <span className="text-text-primary truncate flex-1">{o.product.name}</span>
                        <CoinBadge amount={o.price} size="sm" />
                        <span className="text-text-muted text-xs shrink-0">{formatDate(o.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
