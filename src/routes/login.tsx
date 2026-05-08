import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Coins, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(username, password);
      navigate({ to: u.role === "student" ? "/student/dashboard" : "/admin/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="mb-3 rounded-2xl bg-gradient-to-br from-xp to-coin p-3 shadow-xl shadow-primary/30">
            <Coins size={32} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold">Kelajak Ta'lim</h1>
          <p className="mt-1 text-sm text-text-secondary">Coin System</p>
        </motion.div>

        <div className="rounded-2xl bg-bg-secondary border border-border p-6 shadow-2xl">
          <h2 className="mb-1 text-xl font-semibold">Вход в аккаунт</h2>
          <p className="mb-5 text-sm text-text-secondary">Используйте логин для входа</p>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Логин"
              name="username"
              autoComplete="username"
              icon={<User size={16} />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="student / teacher / admin"
              required
            />
            <Input
              label="Пароль"
              name="password"
              type="password"
              autoComplete="current-password"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="rounded-xl bg-spend/10 border border-spend/30 px-3 py-2 text-sm text-spend">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Войти
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/reset-password" className="text-text-secondary hover:text-primary">
              Забыли пароль?
            </Link>
            <Link to="/register" className="text-text-secondary hover:text-primary">
              Регистрация
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Demo: <span className="font-mono">student/student</span> · <span className="font-mono">teacher/teacher</span> · <span className="font-mono">admin/admin</span>
        </p>
      </motion.div>
    </div>
  );
}
