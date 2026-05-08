import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import { getAdminCategories, createCategory, updateCategory, deleteCategory, getAdminProducts } from "@/api/admin";
import type { Category, Product } from "@/types";

export const Route = createFileRoute("/admin/categories")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminProducts()]).then(([c, p]) => { setCategories(c); setProducts(p); }).finally(() => setLoading(false));
  }, []);

  const productCount = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => (map[c.id] = 0));
    products.forEach((p) => { if (map[p.category_id] !== undefined) map[p.category_id]++; });
    return map;
  }, [categories, products]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await createCategory(newName.trim());
      toast.success("Категория добавлена");
      setNewName("");
      setModalOpen(false);
      setCategories(await getAdminCategories());
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await updateCategory(id, editName.trim());
    setEditingId(null);
    setCategories(await getAdminCategories());
    toast.success("Категория обновлена");
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setDeleteConfirm(null);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Категория удалена");
  };

  if (loading) {
    return <ProtectedRoute roles={["admin"]}><AppShell section="admin"><LoadingSkeleton variant="card" count={2} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl md:text-3xl font-bold">Категории</h1>
              <Button onClick={() => setModalOpen(true)} size="sm"><Plus size={14} /> Добавить</Button>
            </div>
          </motion.div>

          {categories.length === 0 ? (
            <EmptyState icon="🏷️" title="Нет категорий" description="Добавьте первую категорию." />
          ) : (
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-text-muted">
                        <th className="p-3 font-medium">Название</th>
                        <th className="p-3 font-medium">Товаров</th>
                        <th className="p-3 font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categories.map((c) => (
                        <tr key={c.id} className="hover:bg-bg-elevated/50 transition-colors">
                          <td className="p-3">
                            {editingId === c.id ? (
                              <div className="flex items-center gap-2">
                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="max-w-[200px]" />
                                <button onClick={() => handleUpdate(c.id)} className="p-1 text-earn"><Check size={16} /></button>
                                <button onClick={() => setEditingId(null)} className="p-1 text-spend"><X size={16} /></button>
                              </div>
                            ) : (
                              <span className="text-text-primary">{c.name}</span>
                            )}
                          </td>
                          <td className="p-3 text-text-secondary font-mono">{productCount[c.id] ?? 0}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingId(c.id); setEditName(c.name); }} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-primary"><Pencil size={14} /></button>
                              <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg hover:bg-spend/10 text-text-secondary hover:text-spend"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Добавить категорию">
            <div className="space-y-4">
              <Input label="Название" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название категории" />
              <Button onClick={handleCreate} loading={saving} disabled={!newName.trim()} className="w-full">Добавить</Button>
            </div>
          </Modal>

          <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Удалить категорию?">
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
