import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/admin/users")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["admin","teacher"]}>
      <AppShell section="admin">
        <PagePlaceholder title="Пользователи" description="Управление пользователями" />
      </AppShell>
    </ProtectedRoute>
  );
}
