import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  children: ReactNode;
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, hasRole, loading } = useAuth();

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
        <div className="max-w-md rounded-2xl bg-bg-secondary p-8 text-center">
          <div className="text-6xl">🔒</div>
          <h1 className="mt-4 text-2xl font-semibold">403 — Нет доступа</h1>
          <p className="mt-2 text-text-secondary">У вас нет прав для просмотра этой страницы.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
