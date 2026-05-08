import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Lock } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { getAchievements } from "@/api/student";
import type { Achievement } from "@/types";

export const Route = createFileRoute("/student/achievements")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const conditionLabel: Record<string, (v: number) => string> = {
  coins_earned: (v) => `Заработай ${v} монет`,
  purchases_count: (v) => `Соверши ${v} покупок`,
  level_reached: (v) => `Достигни Level ${v}`,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function Page() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAchievements().then(setAchievements).finally(() => setLoading(false));
  }, []);

  const unlocked = useMemo(() => achievements.filter((a) => a.unlocked), [achievements]);
  const locked = useMemo(() => achievements.filter((a) => !a.unlocked), [achievements]);
  const pct = achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0;

  if (loading || !user) {
    return <ProtectedRoute roles={["student"]}><AppShell section="student"><LoadingSkeleton variant="card" count={4} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-8">
          {/* Header */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Достижения</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {unlocked.length} из {achievements.length} разблокировано
            </p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-bg-elevated">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-xp to-coin"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Unlocked */}
          {unlocked.length > 0 && (
            <div>
              <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
                <h2 className="font-display text-lg font-semibold mb-4 text-earn">Разблокировано</h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unlocked.map((a, i) => (
                  <motion.div key={a.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.06 * i }}>
                    <Card className="h-full" style={{ boxShadow: "0 0 20px -5px var(--color-xp)" }}>
                      <CardContent className="flex flex-col items-center text-center gap-2 pt-5">
                        <span className="text-5xl">{a.icon}</span>
                        <p className="text-sm font-semibold text-text-primary">{a.name}</p>
                        <p className="text-xs text-text-muted">{a.description}</p>
                        <Badge variant="earn" className="mt-1">Получено {a.unlocked_at ? formatDate(a.unlocked_at) : ""}</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <div>
              <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                <h2 className="font-display text-lg font-semibold mb-4 text-text-muted">Ещё не получено</h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {locked.map((a, i) => {
                  const label = conditionLabel[a.condition_type]?.(a.condition_value) ?? `${a.condition_type}: ${a.condition_value}`;
                  const progress = (() => {
                    if (a.condition_type === "coins_earned") return { current: user.balance, target: a.condition_value };
                    if (a.condition_type === "level_reached") return { current: user.level, target: a.condition_value };
                    return { current: 0, target: a.condition_value };
                  })();
                  const progressPct = Math.min(100, (progress.current / progress.target) * 100);
                  return (
                    <motion.div key={a.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.06 * i }}>
                      <Card className="h-full opacity-60">
                        <CardContent className="flex flex-col items-center text-center gap-2 pt-5 relative">
                          <div className="relative">
                            <span className="text-5xl grayscale">{a.icon}</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock size={20} className="text-text-muted" />
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-text-muted">{a.name}</p>
                          <p className="text-xs text-text-muted">{label}</p>
                          <div className="w-full mt-1">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                              <div className="h-full rounded-full bg-text-muted" style={{ width: `${progressPct}%` }} />
                            </div>
                            <p className="text-[10px] text-text-muted mt-0.5">{progress.current} / {progress.target}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
