import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getUsers, getAdminTransactions, getAdminOrders } from "@/api/admin";
import type { Transaction, Order, User } from "@/types";

export const Route = createFileRoute("/admin/reports")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
type Period = "7d" | "30d" | "90d";

function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    Promise.all([getUsers(), getAdminTransactions(), getAdminOrders()])
      .then(([u, t, o]) => { setUsers(u); setTransactions(t); setOrders(o); })
      .finally(() => setLoading(false));
  }, []);

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - days);
    return d;
  }, [days]);

  const filteredTx = useMemo(() => transactions.filter((t) => new Date(t.created_at) >= cutoff), [transactions, cutoff]);
  const filteredOrders = useMemo(() => orders.filter((o) => new Date(o.created_at) >= cutoff), [orders, cutoff]);

  // Chart 1: Coins issued per day
  const coinsByDay = useMemo(() => {
    const byDay = new Map<string, { awarded: number; spent: number }>();
    filteredTx.forEach((t) => {
      const day = t.created_at.slice(0, 10);
      const entry = byDay.get(day) ?? { awarded: 0, spent: 0 };
      if (t.type === "earn") entry.awarded += t.amount;
      else entry.spent += t.amount;
      byDay.set(day, entry);
    });
    const result: { date: string; awarded: number; spent: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      const entry = byDay.get(key) ?? { awarded: 0, spent: 0 };
      result.push({ date: label, ...entry });
    }
    return result;
  }, [filteredTx, days]);

  // Chart 2: Top 10 students by balance
  const topStudents = useMemo(() =>
    users.filter((u) => u.role === "student").sort((a, b) => b.balance - a.balance).slice(0, 10).map((u) => ({ name: u.first_name, balance: u.balance })),
    [users]
  );

  // Chart 3: Orders by status
  const ordersByStatus = useMemo(() => [
    { name: "Новые", value: filteredOrders.filter((o) => o.status === "new").length, color: "var(--color-status-new)" },
    { name: "Подтверждены", value: filteredOrders.filter((o) => o.status === "confirmed").length, color: "var(--color-status-confirmed)" },
    { name: "Выданы", value: filteredOrders.filter((o) => o.status === "delivered").length, color: "var(--color-status-delivered)" },
    { name: "Отменены", value: filteredOrders.filter((o) => o.status === "cancelled").length, color: "var(--color-status-cancelled)" },
  ], [filteredOrders]);

  // Chart 4: Activity by day of week
  const activityByDay = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    filteredTx.forEach((t) => { const d = new Date(t.created_at).getDay(); counts[d]++; });
    return [
      { day: "Пн", count: counts[1] }, { day: "Вт", count: counts[2] }, { day: "Ср", count: counts[3] },
      { day: "Чт", count: counts[4] }, { day: "Пт", count: counts[5] }, { day: "Сб", count: counts[6] }, { day: "Вс", count: counts[0] },
    ];
  }, [filteredTx]);

  if (loading) {
    return <ProtectedRoute roles={["admin"]}><AppShell section="admin"><LoadingSkeleton variant="card" count={4} /></AppShell></ProtectedRoute>;
  }

  const tooltipStyle = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-text-primary)", fontSize: 13 };

  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h1 className="font-display text-2xl md:text-3xl font-bold">Отчёты</h1>
              <div className="flex gap-2">
                {(["7d", "30d", "90d"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${period === p ? "bg-primary/15 text-primary border-primary/40" : "bg-bg-elevated text-text-secondary border-border"}`}>
                    {p === "7d" ? "7д" : p === "30d" ? "30д" : "90д"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Coins by day */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
              <Card>
                <CardHeader><CardTitle>Начислено vs Потрачено по дням</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={coinsByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                        <XAxis dataKey="date" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} interval={Math.floor(days / 5)} />
                        <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} width={50} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="awarded" stroke="var(--color-earn)" strokeWidth={2} dot={false} name="Начислено" />
                        <Line type="monotone" dataKey="spent" stroke="var(--color-spend)" strokeWidth={2} dot={false} name="Потрачено" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chart 2: Top 10 students */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader><CardTitle>Топ-10 студентов по балансу</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topStudents} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                        <XAxis type="number" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} width={80} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="balance" fill="var(--color-coin)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chart 3: Orders by status */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader><CardTitle>Заказы по статусам</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                          {ordersByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-3 mt-2 flex-wrap">
                    {ordersByStatus.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chart 4: Activity by day of week */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader><CardTitle>Активность по дням недели</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                        <XAxis dataKey="day" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                        <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} width={40} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
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
