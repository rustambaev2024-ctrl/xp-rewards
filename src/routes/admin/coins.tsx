import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import { getUsers, awardCoins, deductCoins } from "@/api/admin";
import type { User } from "@/types";

export const Route = createFileRoute("/admin/coins")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const reasonOptions = ["Посещаемость", "Домашнее задание", "Активность", "Победа в конкурсе", "Другое"];

function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"award" | "deduct">("award");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState(reasonOptions[0]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const students = useMemo(() => users.filter((u) => u.role === "student"), [users]);
  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((u) => `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  }, [students, search]);

  const handleSubmit = async () => {
    if (!selectedUser || !amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      if (tab === "award") {
        await awardCoins(selectedUser.id, Number(amount), reason, comment || undefined);
        toast.success(`Начислено ${amount} монет студенту ${selectedUser.first_name}`);
      } else {
        await deductCoins(selectedUser.id, Number(amount), reason, comment || undefined);
        toast.success(`Списано ${amount} монет у ${selectedUser.first_name}`);
      }
      setAmount(""); setComment(""); setReason(reasonOptions[0]);
    } catch {
      toast.error("Ошибка операции");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProtectedRoute roles={["admin","teacher"]}><AppShell section="admin"><LoadingSkeleton variant="card" count={3} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin","teacher"]}>
      <AppShell section="admin">
        <div className="space-y-5 max-w-2xl">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Монеты</h1>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <div className="flex gap-2">
              <button onClick={() => setTab("award")} className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${tab === "award" ? "bg-earn/15 text-earn border border-earn/30" : "bg-bg-elevated text-text-secondary border border-border"}`}>
                Начислить (Award)
              </button>
              <button onClick={() => setTab("deduct")} className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${tab === "deduct" ? "bg-spend/15 text-spend border-spend/30" : "bg-bg-elevated text-text-secondary border border-border"}`}>
                Списать (Deduct)
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="space-y-4 pt-5">
                {/* Student search */}
                <Input placeholder="Поиск студента..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />

                {/* Student list */}
                {search && !selectedUser && (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-bg-elevated divide-y divide-border">
                    {filteredStudents.map((u) => (
                      <button key={u.id} onClick={() => { setSelectedUser(u); setSearch(""); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-bg-primary transition-colors">
                        <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                        <span className="text-text-primary">{u.first_name} {u.last_name}</span>
                        <span className="text-text-muted text-xs">@{u.username}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected student card */}
                {selectedUser && (
                  <div className="flex items-center gap-3 rounded-xl bg-bg-elevated p-3">
                    <Avatar name={`${selectedUser.first_name} ${selectedUser.last_name}`} src={selectedUser.avatar_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{selectedUser.first_name} {selectedUser.last_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CoinBadge amount={selectedUser.balance} size="sm" />
                        <LevelBadge level={selectedUser.level} size="sm" />
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="text-xs text-text-muted hover:text-spend">Сменить</button>
                  </div>
                )}

                <Input label="Количество монет" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Причина</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-11 rounded-xl bg-bg-elevated border border-border px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring">
                    {reasonOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Комментарий</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} className="w-full rounded-xl bg-bg-elevated border border-border px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Необязательно" />
                </div>

                {tab === "award" && amount && selectedUser && (
                  <p className="text-xs text-text-secondary">Студент получит <span className="text-coin font-mono">{amount}</span> монет и <span className="text-xp font-mono">{Number(amount) * 10}</span> XP</p>
                )}
                {tab === "deduct" && amount && selectedUser && (
                  <p className="text-xs text-text-secondary">У студента будет списано <span className="text-spend font-mono">{amount}</span> монет. Текущий баланс: <span className="text-coin font-mono">{selectedUser.balance}</span></p>
                )}

                <Button onClick={handleSubmit} loading={saving} disabled={!selectedUser || !amount || Number(amount) <= 0} className={`w-full ${tab === "award" ? "bg-earn text-white hover:bg-earn/90" : "bg-spend text-white hover:bg-spend/90"}`}>
                  {tab === "award" ? "Начислить" : "Списать"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
