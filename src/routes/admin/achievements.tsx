import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import { getAdminAchievements, createAchievement, updateAchievement, deleteAchievement } from "@/api/admin";
import type { Achievement } from "@/types";

export const Route = createFileRoute("/admin/achievements")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const conditionTypes = ["coins_earned", "purchases_count", "level_reached"];
const conditionLabels: Record<string, string> = { coins_earned: "Монеты заработаны", purchases_count: "Количество покупок", level_reached: "Уровень достигнут" };

const emptyForm = { name: "", description: "", icon: "", condition_type: "coins_earned", condition_value: "1", is_active: true };

function Page() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    getAdminAchievements().then(setAchievements).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (a: Achievement) => {
    setEditingId(a.id);
    setForm({ name: a.name, description: a.description, icon: a.icon, condition_type: a.condition_type, condition_value: String(a.condition_value), is_active: a.is_active ?? true });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const data = { name: form.name, description: form.description, icon: form.icon, condition_type: form.condition_type, condition_value: Number(form.condition_value), is_active: form.is_active, unlocked: false };
      if (editingId) {
        await updateAchievement(editingId, data);
        toast.success("Достижение обновлено");
      } else {
        await createAchievement(data as Omit<Achievement, "id">);
        toast.success("Достижение добавлено");
      }
      setModalOpen(false);
      setAchievements(await getAdminAchievements());
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteAchievement(id);
    setDeleteConfirm(null);
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Достижение удалено");
  };

  const handleToggleActive = async (a: Achievement) => {
    const newVal = !(a.is_active ?? true);
    await updateAchievement(a.id, { is_active: newVal });
    setAchievements((prev) => prev.map((x) => x.id === a.id ? { ...x, is_active: newVal } : x));
  };

  if (loading) {
    return <ProtectedRoute roles={["admin"]}><AppShell section="admin"><LoadingSkeleton variant="card" count={3} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl md:text-3xl font-bold">Достижения</h1>
              <Button onClick={openCreate} size="sm"><Plus size={14} /> Добавить</Button>
            </div>
          </motion.div>

          {achievements.length === 0 ? (
            <EmptyState icon="🏅" title="Нет достижений" description="Добавьте первое достижение." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((a, i) => (
                <motion.div key={a.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 * i }}>
                  <Card className="h-full">
                    <CardContent className="flex flex-col gap-3 pt-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{a.icon || "🏅"}</span>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{a.name}</p>
                            <p className="text-xs text-text-muted">{a.description}</p>
                          </div>
                        </div>
                        <Badge variant={a.is_active ?? true ? "earn" : "spend"}>{a.is_active ?? true ? "Активно" : "Скрыто"}</Badge>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {conditionLabels[a.condition_type] ?? a.condition_type}: <span className="font-mono text-text-primary">{a.condition_value}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-auto pt-2 border-t border-border">
                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-primary"><Pencil size={14} /></button>
                        <button onClick={() => handleToggleActive(a)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-primary text-xs">
                          {a.is_active ?? true ? "Скрыть" : "Включить"}
                        </button>
                        <div className="flex-1" />
                        <button onClick={() => setDeleteConfirm(a.id)} className="p-1.5 rounded-lg hover:bg-spend/10 text-text-secondary hover:text-spend"><Trash2 size={14} /></button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Редактировать достижение" : "Добавить достижение"}>
            <div className="space-y-4">
              <Input label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input label="Иконка (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🪙" />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Тип условия</label>
                <select value={form.condition_type} onChange={(e) => setForm({ ...form, condition_type: e.target.value })} className="w-full h-11 rounded-xl bg-bg-elevated border border-border px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring">
                  {conditionTypes.map((t) => <option key={t} value={t}>{conditionLabels[t]}</option>)}
                </select>
              </div>
              <Input label="Значение условия" type="number" min={1} value={form.condition_value} onChange={(e) => setForm({ ...form, condition_value: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                Активно
              </label>
              <Button onClick={handleSave} loading={saving} disabled={!form.name} className="w-full">Сохранить</Button>
            </div>
          </Modal>

          <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Удалить достижение?">
            <p className="text-sm text-text-secondary mb-4">Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
              <Button variant="danger" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Удалить</Button>
            </div>
          </Modal>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
