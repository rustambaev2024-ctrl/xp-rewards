import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, hasRole, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !hasRole(roles)) {
    // Redirect teacher to their allowed page instead of showing 403
    if (user?.role === "teacher") {
      return <Navigate to="/admin/coins" />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md rounded-2xl bg-bg-secondary border border-border p-8 text-center"
        >
          <div className="text-6xl">🔒</div>
          <h1 className="mt-4 font-display text-2xl font-bold">Нет доступа</h1>
          <p className="mt-2 text-sm text-text-secondary">
            У вас нет прав для просмотра этой страницы.
          </p>
          <div className="mt-6">
            <Button onClick={() => window.history.back()} variant="secondary" className="mr-2">
              Назад
            </Button>
            <Button onClick={() => (window.location.href = "/")}>
              На главную
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
