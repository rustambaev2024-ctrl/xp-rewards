import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import { getAdminProducts, getAdminCategories, createProduct, updateProduct, deleteProduct } from "@/api/admin";
import type { Product, Category } from "@/types";

export const Route = createFileRoute("/admin/store")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const emptyForm = { name: "", description: "", price: "", required_level: "1", category_id: "", stock: "", image_url: "", is_active: true };

function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminProducts(), getAdminCategories()]).then(([p, c]) => { setProducts(p); setCategories(c); }).finally(() => setLoading(false));
  }, []);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [categories]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, price: String(p.price), required_level: String(p.required_level), category_id: p.category_id, stock: String(p.stock), image_url: p.image_url, is_active: p.is_active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const data = { name: form.name, description: form.description, price: Number(form.price), required_level: Number(form.required_level), category_id: form.category_id, stock: Number(form.stock), image_url: form.image_url, is_active: form.is_active };
      if (editingId) {
        await updateProduct(editingId, data);
        toast.success("Товар обновлён");
      } else {
        await createProduct(data as Omit<Product, "id">);
        toast.success("Товар добавлен");
      }
      setModalOpen(false);
      const [p] = await Promise.all([getAdminProducts()]);
      setProducts(p);
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirm(null);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Товар удалён");
  };

  if (loading) {
    return <ProtectedRoute roles={["admin"]}><AppShell section="admin"><LoadingSkeleton variant="table-row" count={5} columns={7} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl md:text-3xl font-bold">Товары</h1>
              <Button onClick={openCreate} size="sm"><Plus size={14} /> Добавить товар</Button>
            </div>
          </motion.div>

          {products.length === 0 ? (
            <EmptyState icon="🛒" title="Нет товаров" description="Добавьте первый товар в магазин." />
          ) : (
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-text-muted">
                          <th className="p-3 font-medium">Товар</th>
                          <th className="p-3 font-medium">Категория</th>
                          <th className="p-3 font-medium">Цена</th>
                          <th className="p-3 font-medium">Уровень</th>
                          <th className="p-3 font-medium">Stock</th>
                          <th className="p-3 font-medium">Статус</th>
                          <th className="p-3 font-medium">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-bg-elevated/50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                                <span className="text-text-primary truncate max-w-[150px]">{p.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-text-secondary">{categoryMap[p.category_id] ?? "—"}</td>
                            <td className="p-3"><CoinBadge amount={p.price} size="sm" /></td>
                            <td className="p-3"><LevelBadge level={p.required_level} size="sm" /></td>
                            <td className="p-3 font-mono tabular-nums text-text-secondary">{p.stock}</td>
                            <td className="p-3"><Badge variant={p.is_active ? "earn" : "spend"}>{p.is_active ? "Активен" : "Скрыт"}</Badge></td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-primary transition-colors"><Pencil size={14} /></button>
                                <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-spend/10 text-text-secondary hover:text-spend transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Create/Edit modal */}
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Редактировать товар" : "Добавить товар"}>
            <div className="space-y-4">
              <Input label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Описание</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-xl bg-bg-elevated border border-border px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Цена (монеты)" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <Input label="Уровень доступа" type="number" min={1} max={4} value={form.required_level} onChange={(e) => setForm({ ...form, required_level: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Категория</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full h-11 rounded-xl bg-bg-elevated border border-border px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <Input label="Количество (stock)" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <Input label="URL изображения" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                Активен
              </label>
              <Button onClick={handleSave} loading={saving} disabled={!form.name || !form.price} className="w-full">Сохранить</Button>
            </div>
          </Modal>

          {/* Delete confirm */}
          <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Удалить товар?">
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
