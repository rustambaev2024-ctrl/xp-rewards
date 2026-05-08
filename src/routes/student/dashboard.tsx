import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDownLeft, ArrowUpRight, TriangleAlert as AlertTriangle, Package, Award } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { XPBar } from "@/components/shared/XPBar";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { getTransactions, getOrders, getAchievements } from "@/api/student";
import type { Transaction, Order, Achievement, TxType } from "@/types";
import { useEffect, useState, useMemo } from "react";

export const Route = createFileRoute("/student/dashboard")({
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

const statusLabel: Record<string, string> = {
  new: "В обработке",
  confirmed: "Подтверждён",
  delivered: "Выдан",
  cancelled: "Отменён",
};

const statusVariant: Record<string, "new" | "confirmed" | "delivered" | "cancelled"> = {
  new: "new",
  confirmed: "confirmed",
  delivered: "delivered",
  cancelled: "cancelled",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function Page() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTransactions({ limit: 5 }), getOrders({ limit: 3 }), getAchievements()])
      .then(([t, o, a]) => {
        setTransactions(t);
        setOrders(o);
        setAchievements(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const todayDelta = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return transactions
      .filter((t) => t.created_at.slice(0, 10) === today && t.type === "earn")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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
          {/* Hero — My Profile */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar name={`${user.first_name} ${user.last_name}`} src={user.avatar_url} size="xl" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-display text-xl md:text-2xl font-bold truncate">
                    {user.first_name} {user.last_name}
                  </h1>
                  <LevelBadge level={user.level} size="md" />
                </div>
                <p className="text-sm text-text-secondary mb-3">@{user.username}</p>
                <XPBar current={user.xp} max={user.xp_to_next} level={user.level} />
              </div>
            </Card>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Coins widget */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
              <Card className="flex flex-col items-center justify-center text-center h-full">
                <CoinBadge amount={user.balance} size="lg" />
                {todayDelta > 0 && (
                  <p className="mt-2 text-xs font-medium text-earn">+{todayDelta} сегодня</p>
                )}
              </Card>
            </motion.div>

            {/* Recent transactions */}
            <motion.div className="md:col-span-2" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Последние транзакции</CardTitle>
                  <Link to="/student/transactions" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Все транзакции <ArrowRight size={12} />
                  </Link>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-text-muted py-4 text-center">Пока нет операций</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((t) => (
                        <div key={t.id} className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated">
                            {txIcon[t.type]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">{t.reason}</p>
                            <p className="text-xs text-text-muted">{formatDate(t.created_at)}</p>
                          </div>
                          <Badge variant={txVariant[t.type]}>
                            {t.type === "earn" ? "+" : t.type === "penalty" ? "-" : "-"}
                            {t.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent orders */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.24 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Последние заказы</CardTitle>
                  <Link to="/student/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Все заказы <ArrowRight size={12} />
                  </Link>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-sm text-text-muted py-4 text-center">Ещё нет покупок</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div key={o.id} className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated">
                            <Package size={14} className="text-text-secondary" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">{o.product.name}</p>
                            <p className="text-xs text-text-muted">{formatDate(o.created_at)}</p>
                          </div>
                          <Badge variant={statusVariant[o.status]}>{statusLabel[o.status]}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements preview */}
            <motion.div className="md:col-span-2" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.32 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award size={16} className="text-coin" />
                    Достижения
                  </CardTitle>
                  <Link to="/student/achievements" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Все достижения <ArrowRight size={12} />
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-text-secondary mb-3">
                    {unlockedCount} из {achievements.length} разблокировано
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {achievements.map((a) => (
                      <div
                        key={a.id}
                        className={`flex flex-col items-center gap-1 shrink-0 w-16 ${
                          a.unlocked ? "opacity-100" : "opacity-30 grayscale"
                        }`}
                      >
                        <span className="text-2xl">{a.icon}</span>
                        <span className="text-[10px] text-text-secondary text-center leading-tight truncate w-full">
                          {a.name}
                        </span>
                        {!a.unlocked && (
                          <span className="text-[10px] text-text-muted">🔒</span>
                        )}
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
