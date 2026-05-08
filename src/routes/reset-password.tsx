import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/api/auth";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md rounded-2xl bg-bg-secondary border border-border p-6">
        {done ? (
          <div className="text-center">
            <CheckCircle2 size={48} className="mx-auto text-earn" />
            <h2 className="mt-4 text-xl font-semibold">Письмо отправлено</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Проверьте почту <span className="text-text-primary">{email}</span> для восстановления пароля.
            </p>
            <Link to="/login" className="mt-6 inline-block text-sm text-primary hover:underline">
              ← Вернуться ко входу
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">Восстановление пароля</h1>
            <p className="mt-1 mb-5 text-sm text-text-secondary">
              Введите email — мы отправим инструкцию.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Отправить
              </Button>
              <Link to="/login" className="block text-center text-sm text-text-secondary hover:text-primary">
                ← Вернуться ко входу
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
