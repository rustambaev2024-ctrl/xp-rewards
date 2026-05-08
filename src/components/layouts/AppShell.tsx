import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Coins, ShoppingBag, Package, Trophy, Bell, User, ChartBar as BarChart3, Users, Receipt, Settings, Award, ChartBar as FileBarChart, Tags } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { cn } from "@/lib/utils";
import { getNotifications } from "@/api/student";
import { useEffect, useState } from "react";

const studentNav = [
  { to: "/student/dashboard", label: "Главная", icon: LayoutDashboard },
  { to: "/student/coins", label: "Монеты", icon: Coins },
  { to: "/student/store", label: "Магазин", icon: ShoppingBag },
  { to: "/student/orders", label: "Заказы", icon: Package },
  { to: "/student/achievements", label: "Достижения", icon: Award },
  { to: "/student/leaderboard", label: "Рейтинг", icon: Trophy },
  { to: "/student/notifications", label: "Уведомления", icon: Bell },
  { to: "/student/profile", label: "Профиль", icon: User },
] as const;

const adminNav = [
  { to: "/admin/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { to: "/admin/users", label: "Пользователи", icon: Users },
  { to: "/admin/coins", label: "Монеты", icon: Coins },
  { to: "/admin/transactions", label: "Транзакции", icon: Receipt },
  { to: "/admin/store", label: "Товары", icon: ShoppingBag },
  { to: "/admin/categories", label: "Категории", icon: Tags },
  { to: "/admin/orders", label: "Заказы", icon: Package },
  { to: "/admin/achievements", label: "Достижения", icon: Award },
  { to: "/admin/reports", label: "Отчёты", icon: FileBarChart },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
] as const;

export function AppShell({ section, children }: { section: "student" | "admin"; children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [unreadCount, setUnreadCount] = useState(0);

  // Teacher can only see users and coins
  const teacherAllowedRoutes = ["/admin/users", "/admin/coins"];
  const isTeacher = user?.role === "teacher";
  const fullAdminNav = section === "admin" ? adminNav : [];
  const items = section === "student"
    ? studentNav
    : isTeacher
      ? fullAdminNav.filter((it) => teacherAllowedRoutes.includes(it.to))
      : fullAdminNav;

  useEffect(() => {
    if (section === "student") {
      getNotifications().then((n) => setUnreadCount(n.filter((x) => !x.is_read).length));
    }
  }, [section, path]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-bg-secondary">
        <div className="px-5 py-5 border-b border-border">
          <Link to={section === "student" ? "/student/dashboard" : isTeacher ? "/admin/coins" : "/admin/dashboard"} className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-xp to-coin p-1.5">
              <Coins size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sm leading-tight">Kelajak Ta'lim</div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted">{section === "admin" ? "Admin Panel" : "Coin System"}</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {items.map((it) => {
            const active = path === it.to;
            const isNotif = section === "student" && it.to === "/student/notifications";
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                )}
              >
                <it.icon size={18} />
                <span>{it.label}</span>
                {isNotif && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-spend px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="m-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-spend"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-bg-primary/80 backdrop-blur px-4">
          <div className="flex items-center gap-2 md:hidden">
            <div className="rounded-lg bg-gradient-to-br from-xp to-coin p-1.5">
              <Coins size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm">Kelajak Ta'lim</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {user && section === "student" && (
              <>
                <CoinBadge amount={user.balance} size="sm" />
                <LevelBadge level={user.level} size="sm" />
              </>
            )}
            <Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" />
            <button onClick={handleLogout} className="md:hidden text-text-secondary hover:text-spend" aria-label="Выйти">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>

        {/* Mobile bottom nav (student only) */}
        {section === "student" && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-bg-secondary">
            {[studentNav[0], studentNav[2], studentNav[3], studentNav[5], studentNav[7]].map((it) => {
              const active = path === it.to;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 text-[10px]",
                    active ? "text-primary" : "text-text-secondary"
                  )}
                >
                  <it.icon size={20} />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function PagePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
      {description && <p className="mt-1 text-text-secondary">{description}</p>}
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-bg-secondary/40 p-10 text-center text-text-muted">
        Эта страница будет реализована в следующих фазах.
      </div>
    </div>
  );
}
