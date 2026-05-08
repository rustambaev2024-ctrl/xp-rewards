import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { getLeaderboard } from "@/api/student";
import type { LeaderboardEntry } from "@/types";

export const Route = createFileRoute("/student/leaderboard")({
  component: Page,
});

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const medals = ["🥇", "🥈", "🥉"];

function Page() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setEntries).finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);
  const myEntry = user ? entries.find((e) => e.user_id === user.id) : null;
  const isInTop10 = myEntry && myEntry.rank <= 10;

  if (loading || !user) {
    return <ProtectedRoute roles={["student"]}><AppShell section="student"><LoadingSkeleton variant="card" count={4} /></AppShell></ProtectedRoute>;
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Рейтинг</h1>
            <p className="mt-1 text-sm text-text-secondary">Топ студентов по опыту</p>
          </motion.div>

          {/* Podium */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-4 pt-4">
              {/* 2nd place */}
              {top3[1] && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }} className="flex flex-col items-center">
                  <span className="text-2xl mb-2">{medals[1]}</span>
                  <Card className="w-28 text-center">
                    <CardContent className="flex flex-col items-center gap-1.5 pt-4 pb-3">
                      <Avatar name={`${top3[1].first_name} ${top3[1].last_name}`} src={top3[1].avatar_url} size="lg" />
                      <p className="text-xs font-semibold text-text-primary truncate w-full">{top3[1].first_name}</p>
                      <LevelBadge level={top3[1].level} size="sm" />
                      <p className="text-[10px] font-mono text-xp tabular-nums">{top3[1].xp.toLocaleString("ru-RU")} XP</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 1st place */}
              {top3[0] && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }} className="flex flex-col items-center -mt-4">
                  <span className="text-3xl mb-2">{medals[0]}</span>
                  <Card className="w-32 text-center border-xp/30" style={{ boxShadow: "0 0 24px -4px var(--color-xp)" }}>
                    <CardContent className="flex flex-col items-center gap-1.5 pt-5 pb-4">
                      <Avatar name={`${top3[0].first_name} ${top3[0].last_name}`} src={top3[0].avatar_url} size="xl" />
                      <p className="text-sm font-bold text-text-primary truncate w-full">{top3[0].first_name}</p>
                      <LevelBadge level={top3[0].level} size="md" />
                      <p className="text-xs font-mono text-xp tabular-nums">{top3[0].xp.toLocaleString("ru-RU")} XP</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 3rd place */}
              {top3[2] && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="flex flex-col items-center">
                  <span className="text-2xl mb-2">{medals[2]}</span>
                  <Card className="w-28 text-center">
                    <CardContent className="flex flex-col items-center gap-1.5 pt-4 pb-3">
                      <Avatar name={`${top3[2].first_name} ${top3[2].last_name}`} src={top3[2].avatar_url} size="lg" />
                      <p className="text-xs font-semibold text-text-primary truncate w-full">{top3[2].first_name}</p>
                      <LevelBadge level={top3[2].level} size="sm" />
                      <p className="text-[10px] font-mono text-xp tabular-nums">{top3[2].xp.toLocaleString("ru-RU")} XP</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {/* Table 4-10 */}
          {rest.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
              <Card>
                <div className="divide-y divide-border">
                  {rest.map((e, i) => {
                    const isMe = e.user_id === user.id;
                    return (
                      <motion.div
                        key={e.user_id}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.05 * i }}
                        className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-xp/10" : ""}`}
                      >
                        <span className="text-sm font-mono tabular-nums text-text-muted w-8">#{e.rank}</span>
                        <Avatar name={`${e.first_name} ${e.last_name}`} src={e.avatar_url} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isMe ? "font-bold text-xp" : "text-text-primary"}`}>
                            {e.first_name} {e.last_name}
                          </p>
                        </div>
                        <LevelBadge level={e.level} size="sm" />
                        <span className="text-xs font-mono tabular-nums text-xp">{e.xp.toLocaleString("ru-RU")} XP</span>
                        <CoinBadge amount={e.balance} size="sm" />
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* My rank if not in top-10 */}
          {myEntry && !isInTop10 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
              <Card className="border-xp/30" style={{ boxShadow: "0 0 16px -4px var(--color-xp)" }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-mono tabular-nums text-xp font-bold w-8">#{myEntry.rank}</span>
                  <Avatar name={`${myEntry.first_name} ${myEntry.last_name}`} src={myEntry.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-xp truncate">{myEntry.first_name} {myEntry.last_name} <span className="text-xs text-text-muted">(Вы)</span></p>
                  </div>
                  <LevelBadge level={myEntry.level} size="sm" />
                  <span className="text-xs font-mono tabular-nums text-xp">{myEntry.xp.toLocaleString("ru-RU")} XP</span>
                  <CoinBadge amount={myEntry.balance} size="sm" />
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
