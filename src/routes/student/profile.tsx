import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Camera, Shield, ChartBar as BarChart3, Award, Coins, Zap, User as UserIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { getMe, getAchievements } from "@/api/student";
import { toast } from "@/components/ui/Toast";

export const Route = createFileRoute("/student/profile")({
  component: Page,
});

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function Page() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Personal data form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setAvatarPreview(user.avatar_url ?? null);

    getAchievements()
      .then((a) => setAchievements(a.filter((x) => x.unlocked).length))
      .finally(() => setLoading(false));
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Профиль обновлён");
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) return;
    if (newPassword.length < 6) return;
    setPasswordSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaving(false);
    toast.success("Пароль изменён");
  };

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 6;

  if (loading || !user) {
    return (
      <ProtectedRoute roles={["student"]}>
        <AppShell section="student">
          <LoadingSkeleton variant="card" count={3} />
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-5 max-w-2xl">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Профиль</h1>
          </motion.div>

          {/* Section 1: Personal data */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon size={16} className="text-primary" />
                  Личные данные
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar
                      name={`${firstName} ${lastName}`}
                      src={avatarPreview ?? undefined}
                      size="xl"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
                      aria-label="Изменить аватар"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {firstName} {lastName}
                    </p>
                    <p className="text-sm text-text-secondary">@{user.username}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Имя"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      name="first_name"
                    />
                    <Input
                      label="Фамилия"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      name="last_name"
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                  />
                  <Input
                    label="Username"
                    value={user.username}
                    disabled
                    name="username"
                    className="opacity-60"
                  />
                  <p className="text-xs text-text-muted -mt-2">Нельзя изменить</p>

                  <Button onClick={handleSaveProfile} loading={saving}>
                    Сохранить изменения
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Security */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={16} className="text-earn" />
                  Безопасность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Текущий пароль"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    name="current_password"
                    placeholder="Введите текущий пароль"
                  />
                  <Input
                    label="Новый пароль"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    name="new_password"
                    placeholder="Минимум 6 символов"
                    error={passwordTooShort ? "Пароль должен быть не менее 6 символов" : undefined}
                  />
                  <Input
                    label="Подтверждение пароля"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    name="confirm_password"
                    placeholder="Повторите новый пароль"
                    error={passwordMismatch ? "Пароли не совпадают" : undefined}
                  />
                  <Button
                    onClick={handleSavePassword}
                    loading={passwordSaving}
                    disabled={
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      passwordMismatch ||
                      passwordTooShort
                    }
                  >
                    Сменить пароль
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3: Stats */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.24 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-coin" />
                  Моя статистика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    icon={<Zap size={18} className="text-xp" />}
                    title="Уровень"
                    value={<LevelBadge level={user.level} size="lg" />}
                  />
                  <StatCard
                    icon={<Zap size={18} className="text-xp" />}
                    title="XP"
                    value={
                      <span className="text-xp">
                        {user.xp.toLocaleString("ru-RU")}
                      </span>
                    }
                  />
                  <StatCard
                    icon={<Coins size={18} className="text-coin" />}
                    title="Баланс"
                    value={<CoinBadge amount={user.balance} size="md" />}
                  />
                  <StatCard
                    icon={<Award size={18} className="text-coin" />}
                    title="Достижения"
                    value={
                      <span className="text-coin">{achievements}</span>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
