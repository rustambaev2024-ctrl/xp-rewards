import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, TriangleAlert as AlertTriangle, TrendingUp, Wallet, Hash } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { getTransactions } from "@/api/student";
import type { Transaction, TxType } from "@/types";

export const Route = createFileRoute("/student/coins")({
  component: Page,
});

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const txIcon: Record<TxType, React.ReactNode> = {
  earn: <ArrowDownLeft size={14} className="text-earn" />,
  spend: <ArrowUpRight size={14} className="text-spend" />,
  penalty: <AlertTriangle size={14} className="text-penalty" />,
};

const txVariant: Record<TxType, "earn" | "spend" | "penalty"> = {
  earn: "earn",
  spend: "spend",
  penalty: "penalty",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof requestAnimationFrame>>(0);
  const startRef = useRef(0);

  useEffect(() => {
    const duration = 1200;
    startRef.current = performance.now();
    const from = 0;
    const to = value;

    function step(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    }
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <>{display.toLocaleString("ru-RU")}</>;
}

const PAGE_SIZE = 10;

function Page() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = transactions.filter((t) => t.type === "earn").reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions
    .filter((t) => t.type === "spend" || t.type === "penalty")
    .reduce((s, t) => s + t.amount, 0);

  // Build chart data: balance by day for last 30 days
  const chartData = (() => {
    const sorted = [...transactions].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const byDay = new Map<string, number>();
    sorted.forEach((t) => {
      const day = t.created_at.slice(0, 10);
      byDay.set(day, t.balance_after);
    });
    const days: { date: string; balance: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      const balance = byDay.get(key) ?? (days.length > 0 ? days[days.length - 1].balance : 0);
      days.push({ date: label, balance });
    }
    return days;
  })();

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading || !user) {
    return (
      <ProtectedRoute roles={["student"]}>
        <AppShell section="student">
          <LoadingSkeleton variant="card" count={4} />
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-5">
          {/* Balance card */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <Card className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={20} className="text-coin" />
                <span className="text-sm text-text-secondary">Текущий баланс</span>
              </div>
              <div className="font-mono text-5xl font-bold text-coin tabular-nums">
                <AnimatedNumber value={user.balance} />
              </div>
              <CoinBadge amount={user.balance} size="sm" className="mt-2 opacity-60" />
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<TrendingUp size={18} className="text-earn" />}
                title="Всего заработано"
                value={<span className="text-earn">{totalEarned.toLocaleString("ru-RU")}</span>}
              />
              <StatCard
                icon={<ArrowUpRight size={18} className="text-spend" />}
                title="Всего потрачено"
                value={<span className="text-spend">{totalSpent.toLocaleString("ru-RU")}</span>}
              />
              <StatCard
                icon={<Hash size={18} className="text-text-secondary" />}
                title="Операций"
                value={transactions.length.toString()}
              />
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
            <Card>
              <CardHeader>
                <CardTitle>Баланс за 30 дней</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                        axisLine={{ stroke: "var(--color-border)" }}
                        tickLine={false}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                        axisLine={{ stroke: "var(--color-border)" }}
                        tickLine={false}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          color: "var(--color-text-primary)",
                          fontSize: 13,
                        }}
                        labelStyle={{ color: "var(--color-text-secondary)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="var(--color-coin)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: "var(--color-coin)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transactions table */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.24 }}>
            <Card>
              <CardHeader>
                <CardTitle>Все транзакции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-text-muted">
                        <th className="pb-3 pr-4 font-medium">Дата</th>
                        <th className="pb-3 pr-4 font-medium">Тип</th>
                        <th className="pb-3 pr-4 font-medium">Сумма</th>
                        <th className="pb-3 pr-4 font-medium">Причина</th>
                        <th className="pb-3 font-medium text-right">Баланс после</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginated.map((t) => (
                        <tr key={t.id} className="group hover:bg-bg-elevated/50 transition-colors">
                          <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                            {formatDateTime(t.created_at)}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={txVariant[t.type]} className="capitalize">
                              {t.type === "earn" ? "Начисление" : t.type === "spend" ? "Покупка" : "Штраф"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 font-mono tabular-nums">
                            <span className={t.type === "earn" ? "text-earn" : "text-spend"}>
                              {t.type === "earn" ? "+" : "-"}{t.amount}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-text-primary truncate max-w-[200px]">
                            {t.reason}
                          </td>
                          <td className="py-3 text-right font-mono tabular-nums text-text-secondary">
                            {t.balance_after.toLocaleString("ru-RU")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Назад
                    </Button>
                    <span className="text-xs text-text-muted tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Далее
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
