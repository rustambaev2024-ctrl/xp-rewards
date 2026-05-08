import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getUsers, getAdminTransactions } from "@/api/admin";
import type { Transaction, User, TxType } from "@/types";
import { formatNumber, formatRelativeTime } from "@/lib/utils";

export const Route = createFileRoute("/admin/transactions")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const txVariant: Record<TxType, "earn" | "spend" | "penalty"> = { earn: "earn", spend: "spend", penalty: "penalty" };
const txLabel: Record<TxType, string> = { earn: "Начисление", spend: "Покупка", penalty: "Штраф" };
type TypeFilter = "all" | TxType;
type PeriodFilter = "7d" | "30d" | "all";
const PAGE_SIZE = 20;

function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([getUsers(), getAdminTransactions()]).then(([u, t]) => { setUsers(u); setTransactions(t); }).finally(() => setLoading(false));
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (typeFilter !== "all") result = result.filter((t) => t.type === typeFilter);
    if (periodFilter !== "all") {
      const days = periodFilter === "7d" ? 7 : 30;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((t) => new Date(t.created_at) >= cutoff);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const u = userMap.get(t.user_id);
        const name = u ? `${u.first_name} ${u.last_name}`.toLowerCase() : "";
        return name.includes(q) || t.reason.toLowerCase().includes(q);
      });
    }
    return result;
  }, [transactions, typeFilter, periodFilter, search, userMap]);

  useEffect(() => { setPage(1); }, [typeFilter, periodFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <ProtectedRoute roles={["admin"]}><AppShell section="admin"><LoadingSkeleton variant="table-row" count={5} columns={7} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Все транзакции</h1>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Поиск по имени студента..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} className="sm:max-w-xs" />
              <div className="flex flex-wrap gap-2">
                {(["all", "earn", "spend", "penalty"] as const).map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${typeFilter === t ? "bg-primary/15 text-primary border-primary/40" : "bg-bg-elevated text-text-secondary border-border"}`}>
                    {t === "all" ? "Все" : txLabel[t]}
                  </button>
                ))}
                {(["7d", "30d", "all"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriodFilter(p)} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${periodFilter === p ? "bg-primary/15 text-primary border-primary/40" : "bg-bg-elevated text-text-secondary border-border"}`}>
                    {p === "7d" ? "7д" : p === "30d" ? "30д" : "Всё время"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {filtered.length === 0 ? (
            <EmptyState icon="📋" title="Нет транзакций" description="Нет транзакций, соответствующих фильтрам." />
          ) : (
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-text-muted">
                          <th className="p-3 font-medium">Студент</th>
                          <th className="p-3 font-medium">Тип</th>
                          <th className="p-3 font-medium">Сумма</th>
                          <th className="p-3 font-medium">Причина</th>
                          <th className="p-3 font-medium">Комментарий</th>
                          <th className="p-3 font-medium">Баланс после</th>
                          <th className="p-3 font-medium">Дата</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paginated.map((t) => {
                          const u = userMap.get(t.user_id);
                          return (
                            <tr key={t.id} className="hover:bg-bg-elevated/50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Avatar name={u ? `${u.first_name} ${u.last_name}` : "?"} size="sm" />
                                  <span className="text-text-primary truncate">{u ? `${u.first_name} ${u.last_name}` : "—"}</span>
                                </div>
                              </td>
                              <td className="p-3"><Badge variant={txVariant[t.type]}>{txLabel[t.type]}</Badge></td>
                              <td className="p-3 font-mono tabular-nums"><span className={t.type === "earn" ? "text-earn" : "text-spend"}>{t.type === "earn" ? "+" : "-"}{t.amount}</span></td>
                              <td className="p-3 text-text-primary truncate max-w-[150px]">{t.reason}</td>
                              <td className="p-3 text-text-muted truncate max-w-[120px]">{t.comment ?? "—"}</td>
                              <td className="p-3 font-mono tabular-nums text-text-secondary">{formatNumber(t.balance_after)}</td>
                              <td className="p-3 text-text-muted text-xs whitespace-nowrap">{formatRelativeTime(t.created_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-3 border-t border-border">
                      <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Назад</Button>
                      <span className="text-xs text-text-muted tabular-nums">{page} / {totalPages}</span>
                      <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Далее</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
