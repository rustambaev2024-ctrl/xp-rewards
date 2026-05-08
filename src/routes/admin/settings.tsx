import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import { getSettings, updateSettings } from "@/api/admin";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import type { Settings } from "@/types";

export const Route = createFileRoute("/admin/settings")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const dayFullNames = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

function Page() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDays, setOpenDays] = useState<number[]>([]);
  const [xpPerCoin, setXpPerCoin] = useState("");
  const [thresholds, setThresholds] = useState<number[]>([]);
  const { isOpen } = useStoreStatus();

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setOpenDays(s.store_open_days);
      setXpPerCoin(String(s.xp_per_coin));
      setThresholds([...s.level_thresholds]);
    }).finally(() => setLoading(false));
  }, []);

  const toggleDay = (day: number) => {
    setOpenDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  };

  const addThreshold = () => setThresholds((prev) => [...prev, 0]);
  const removeThreshold = (idx: number) => setThresholds((prev) => prev.filter((_, i) => i !== idx));
  const updateThreshold = (idx: number, val: string) => setThresholds((prev) => prev.map((t, i) => i === idx ? Number(val) || 0 : t));

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch = { store_open_days: openDays, xp_per_coin: Number(xpPerCoin), level_thresholds: thresholds };
      await updateSettings(patch);
      toast.success("Настройки сохранены");
    } catch { toast.error("Ошибка сохранения"); } finally { setSaving(false); }
  };

  if (loading || !settings) {
    return <ProtectedRoute roles={["admin"]}><AppShell section="admin"><LoadingSkeleton variant="card" count={3} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <div className="space-y-5 max-w-2xl">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Настройки</h1>
          </motion.div>

          {/* Store days */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle>Дни работы магазина</CardTitle>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOpen ? "bg-earn/15 text-earn" : "bg-status-new/15 text-status-new"}`}>
                  Магазин сейчас {isOpen ? "открыт" : "закрыт"}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-medium border transition-colors ${
                        openDays.includes(day)
                          ? "bg-earn/15 text-earn border-earn/30"
                          : "bg-bg-elevated text-text-secondary border-border"
                      }`}
                    >
                      {dayNames[day]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3">
                  Открыт: {openDays.map((d) => dayFullNames[d]).join(", ") || "—"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Economy */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader><CardTitle>Экономика</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input label="XP за 1 монету (xp_per_coin)" type="number" min={1} value={xpPerCoin} onChange={(e) => setXpPerCoin(e.target.value)} />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-secondary">Пороги уровней (XP)</label>
                    <Button variant="ghost" size="sm" onClick={addThreshold}>+ Уровень</Button>
                  </div>
                  <div className="space-y-2">
                    {thresholds.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-text-muted w-20 shrink-0">Уровень {i}</span>
                        <Input type="number" min={0} value={String(t)} onChange={(e) => updateThreshold(i, e.target.value)} className="flex-1" />
                        {i > 0 && (
                          <button onClick={() => removeThreshold(i)} className="text-xs text-spend hover:underline shrink-0">Удалить</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
            <Button onClick={handleSave} loading={saving} size="lg" className="w-full">Сохранить настройки</Button>
          </motion.div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
