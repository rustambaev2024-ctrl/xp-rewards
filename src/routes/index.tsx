import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { loading, isAuthenticated, isAdmin, isTeacher } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isTeacher) return <Navigate to="/admin/coins" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}
