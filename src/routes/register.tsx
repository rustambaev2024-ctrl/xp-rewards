import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/api/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((errs) => {
      const next = { ...errs };
      delete next[k];
      if (k === "email" && v && !/.+@.+\..+/.test(v)) next.email = "Некорректный email";
      if (k === "confirm" && v && v !== form.password) next.confirm = "Пароли не совпадают";
      if (k === "password" && form.confirm && v !== form.confirm) next.confirm = "Пароли не совпадают";
      return next;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setErrors({ confirm: "Пароли не совпадают" });
      return;
    }
    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      toast.success("Регистрация успешна! Войдите в аккаунт.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-bold text-center">Регистрация</h1>
        <p className="mt-1 mb-6 text-center text-sm text-text-secondary">Создайте аккаунт студента</p>

        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-bg-secondary border border-border p-6">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Имя" value={form.first_name} onChange={set("first_name")} required />
            <Input label="Фамилия" value={form.last_name} onChange={set("last_name")} required />
          </div>
          <Input label="Логин" value={form.username} onChange={set("username")} required />
          <Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} required />
          <Input label="Пароль" type="password" value={form.password} onChange={set("password")} required />
          <Input
            label="Повторите пароль"
            type="password"
            value={form.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
            required
          />

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Зарегистрироваться
          </Button>

          <p className="text-center text-sm text-text-secondary pt-2">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-primary hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
