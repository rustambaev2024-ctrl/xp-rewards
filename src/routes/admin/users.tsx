import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Minus, ToggleLeft, ToggleRight } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/avatar";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import { getUsers, awardCoins, deductCoins, toggleUserActive } from "@/api/admin";
import type { User, Role } from "@/types";

export const Route = createFileRoute("/admin/users")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const roleVariant: Record<Role, "coin" | "xp" | "earn"> = { student: "coin", teacher: "xp", admin: "earn" };
const roleLabel: Record<Role, string> = { student: "Студент", teacher: "Преподаватель", admin: "Администратор" };
const reasonOptions = ["Посещаемость", "Домашнее задание", "Активность", "Победа в конкурсе", "Другое"];
const PAGE_SIZE = 15;

function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "blocked">("all");
  const [page, setPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"award" | "deduct">("award");
  const [modalAmount, setModalAmount] = useState("");
  const [modalReason, setModalReason] = useState(reasonOptions[0]);
  const [modalComment, setModalComment] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...users];
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (activeFilter === "active") list = list.filter((u) => u.is_active);
    if (activeFilter === "blocked") list = list.filter((u) => !u.is_active);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    }
    return list;
  }, [users, roleFilter, activeFilter, search]);

  useEffect(() => { setPage(1); }, [roleFilter, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCoinModal = (user: User, mode: "award" | "deduct") => {
    setModalUser(user);
    setModalMode(mode);
    setModalAmount("");
    setModalReason(reasonOptions[0]);
    setModalComment("");
    setModalOpen(true);
  };

  const handleCoinSubmit = async () => {
    if (!modalUser || !modalAmount || Number(modalAmount) <= 0) return;
    setModalSaving(true);
    try {
      if (modalMode === "award") {
        await awardCoins(modalUser.id, Number(modalAmount), modalReason, modalComment || undefined);
        toast.success(`Начислено ${modalAmount} монет студенту ${modalUser.first_name}`);
      } else {
        await deductCoins(modalUser.id, Number(modalAmount), modalReason, modalComment || undefined);
        toast.success(`Списано ${modalAmount} монет у ${modalUser.first_name}`);
      }
      setModalOpen(false);
    } catch {
      toast.error("Ошибка операции");
    } finally {
      setModalSaving(false);
    }
  };

  const handleToggleActive = async (userId: string) => {
    await toggleUserActive(userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !u.is_active } : u));
  };

  if (loading) {
    return <ProtectedRoute roles={["admin","teacher"]}><AppShell section="admin"><LoadingSkeleton variant="card" count={3} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin","teacher"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Пользователи</h1>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Поиск по имени или username..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} className="sm:max-w-xs" />
              <div className="flex flex-wrap gap-2">
                {(["all", "student", "teacher", "admin"] as const).map((r) => (
                  <button key={r} onClick={() => setRoleFilter(r)} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${roleFilter === r ? "bg-primary/15 text-primary border-primary/40" : "bg-bg-elevated text-text-secondary border-border"}`}>
                    {r === "all" ? "Все" : roleLabel[r]}
                  </button>
                ))}
                <button onClick={() => setActiveFilter(activeFilter === "active" ? "all" : "active")} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${activeFilter === "active" ? "bg-earn/15 text-earn border-earn/40" : "bg-bg-elevated text-text-secondary border-border"}`}>
                  Активные
                </button>
                <button onClick={() => setActiveFilter(activeFilter === "blocked" ? "all" : "blocked")} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${activeFilter === "blocked" ? "bg-spend/15 text-spend border-spend/40" : "bg-bg-elevated text-text-secondary border-border"}`}>
                  Заблокированные
                </button>
              </div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
            {filtered.length === 0 ? (
              <EmptyState icon="👥" title="Нет пользователей" description="Нет пользователей, соответствующих фильтрам." />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-text-muted">
                          <th className="p-3 font-medium">Пользователь</th>
                          <th className="p-3 font-medium">Роль</th>
                          <th className="p-3 font-medium">Уровень</th>
                          <th className="p-3 font-medium">Баланс</th>
                          <th className="p-3 font-medium">Статус</th>
                          <th className="p-3 font-medium">Дата</th>
                          <th className="p-3 font-medium">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paginated.map((u) => (
                          <tr key={u.id} className="hover:bg-bg-elevated/50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Avatar name={`${u.first_name} ${u.last_name}`} src={u.avatar_url} size="sm" />
                                <div className="min-w-0">
                                  <p className="text-text-primary truncate">{u.first_name} {u.last_name}</p>
                                  <p className="text-xs text-text-muted">@{u.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3"><Badge variant={roleVariant[u.role]}>{roleLabel[u.role]}</Badge></td>
                            <td className="p-3"><LevelBadge level={u.level} size="sm" /></td>
                            <td className="p-3"><CoinBadge amount={u.balance} size="sm" /></td>
                            <td className="p-3">
                              <Badge variant={u.is_active ? "earn" : "spend"}>{u.is_active ? "Активен" : "Заблокирован"}</Badge>
                            </td>
                            <td className="p-3 text-text-muted text-xs">{new Date(u.created_at).toLocaleDateString("ru-RU")}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => openCoinModal(u, "award")} className="p-1.5 rounded-lg hover:bg-earn/10 text-earn transition-colors" title="Начислить монеты"><Plus size={14} /></button>
                                <button onClick={() => openCoinModal(u, "deduct")} className="p-1.5 rounded-lg hover:bg-spend/10 text-spend transition-colors" title="Списать монеты"><Minus size={14} /></button>
                                <button onClick={() => handleToggleActive(u.id)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary transition-colors" title={u.is_active ? "Заблокировать" : "Разблокировать"}>
                                  {u.is_active ? <ToggleRight size={14} className="text-earn" /> : <ToggleLeft size={14} className="text-spend" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
            )}
          </motion.div>

          {/* Coin modal */}
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${modalMode === "award" ? "Начислить" : "Списать"} монеты — ${modalUser?.first_name} ${modalUser?.last_name}`}>
            <div className="space-y-4">
              <Input label="Количество монет" type="number" min={1} value={modalAmount} onChange={(e) => setModalAmount(e.target.value)} />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Причина</label>
                <select value={modalReason} onChange={(e) => setModalReason(e.target.value)} className="w-full h-11 rounded-xl bg-bg-elevated border border-border px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring">
                  {reasonOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Комментарий</label>
                <textarea value={modalComment} onChange={(e) => setModalComment(e.target.value)} rows={2} className="w-full rounded-xl bg-bg-elevated border border-border px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Необязательно" />
              </div>
              <Button onClick={handleCoinSubmit} loading={modalSaving} className={`w-full ${modalMode === "award" ? "bg-earn text-white hover:bg-earn/90" : "bg-spend text-white hover:bg-spend/90"}`}>
                {modalMode === "award" ? "Начислить" : "Списать"}
              </Button>
            </div>
          </Modal>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
