import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { Coins, ShoppingBag, Award, Bell as BellIcon, CheckCheck } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getNotifications, readAllNotifications } from "@/api/student";
import type { Notification } from "@/types";

export const Route = createFileRoute("/student/notifications")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  coins: { icon: <Coins size={18} />, color: "text-coin" },
  purchase: { icon: <ShoppingBag size={18} />, color: "text-status-confirmed" },
  achievement: { icon: <Award size={18} />, color: "text-xp" },
  system: { icon: <BellIcon size={18} />, color: "text-text-muted" },
};

function Page() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    getNotifications().then(setNotifications).finally(() => setLoading(false));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const handleReadAll = async () => {
    setMarkingAll(true);
    await readAllNotifications();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setMarkingAll(false);
  };

  if (loading) {
    return <ProtectedRoute roles={["student"]}><AppShell section="student"><LoadingSkeleton variant="card" count={4} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-5">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold">Уведомления</h1>
                {unreadCount > 0 && (
                  <Badge variant="spend">{unreadCount} непрочитанных</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleReadAll} loading={markingAll}>
                  <CheckCheck size={14} /> Отметить все как прочитанные
                </Button>
              )}
            </div>
          </motion.div>

          {notifications.length === 0 ? (
            <EmptyState icon="🔔" title="Нет уведомлений" description="Здесь будут появляться уведомления о монетах, покупках и достижениях." />
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {notifications.map((n, i) => {
                  const cfg = typeConfig[n.type] ?? typeConfig.system;
                  return (
                    <motion.div
                      key={n.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: 0.04 * i }}
                      className={`relative rounded-xl border transition-colors ${
                        n.is_read
                          ? "bg-bg-secondary border-border"
                          : "bg-bg-elevated border-xp/20"
                      }`}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-xp" />
                      )}
                      <div className="flex items-start gap-3 p-3 pl-4">
                        <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.is_read ? "text-text-secondary" : "text-text-primary font-medium"}`}>
                            {n.text}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">{formatRelativeTime(n.created_at)}</p>
                        </div>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-xp shrink-0 mt-1.5" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
