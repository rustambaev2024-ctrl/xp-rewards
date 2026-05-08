import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, TriangleAlert as AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getTransactions } from "@/api/student";
import type { Transaction, TxType } from "@/types";

export const Route = createFileRoute("/student/transactions")({
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

const txLabel: Record<TxType, string> = {
  earn: "Начисление",
  spend: "Покупка",
  penalty: "Штраф",
};

type TypeFilter = "all" | TxType;
type PeriodFilter = "7d" | "30d" | "all";

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "earn", label: "Earn" },
  { value: "spend", label: "Spend" },
  { value: "penalty", label: "Penalty" },
];

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: "7d", label: "7д" },
  { value: "30d", label: "30д" },
  { value: "all", label: "Всё время" },
];

const PAGE_SIZE = 10;

function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (periodFilter !== "all") {
      const days = periodFilter === "7d" ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((t) => new Date(t.created_at) >= cutoff);
    }

    return result;
  }, [transactions, typeFilter, periodFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <ProtectedRoute roles={["student"]}>
        <AppShell section="student">
          <LoadingSkeleton variant="table-row" count={5} columns={5} />
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">История операций</h1>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
            <Card>
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {/* Type chips */}
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTypeFilter(opt.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                          typeFilter === opt.value
                            ? "bg-primary/15 text-primary border-primary/40"
                            : "bg-bg-elevated text-text-secondary border-border hover:bg-bg-elevated/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Period chips */}
                  <div className="flex flex-wrap gap-2">
                    {periodOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPeriodFilter(opt.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                          periodFilter === opt.value
                            ? "bg-primary/15 text-primary border-primary/40"
                            : "bg-bg-elevated text-text-secondary border-border hover:bg-bg-elevated/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
            {filtered.length === 0 ? (
              <EmptyState
                icon="📋"
                title="Нет транзакций"
                description="За выбранный период операций не найдено. Попробуйте изменить фильтры."
              />
            ) : (
              <Card>
                <CardContent className="pt-5">
                  <div className="space-y-1">
                    {paginated.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-bg-elevated/50 transition-colors"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                          {txIcon[t.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary truncate">{t.reason}</p>
                            <Badge variant={txVariant[t.type]} className="shrink-0">
                              {txLabel[t.type]}
                            </Badge>
                          </div>
                          {t.comment && (
                            <p className="text-xs text-text-muted mt-0.5 truncate">{t.comment}</p>
                          )}
                          <p className="text-xs text-text-muted mt-0.5">{formatRelativeTime(t.created_at)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`font-mono text-sm font-semibold tabular-nums ${
                              t.type === "earn" ? "text-earn" : "text-spend"
                            }`}
                          >
                            {t.type === "earn" ? "+" : "-"}{t.amount}
                          </p>
                          <p className="text-xs text-text-muted tabular-nums">
                            {formatNumber(t.balance_after)}
                          </p>
                        </div>
                      </div>
                    ))}
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
            )}
          </motion.div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
