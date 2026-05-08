import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/admin/dashboard")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["admin","teacher"]}>
      <AppShell section="admin">
        <PagePlaceholder title="Дашборд" description="Общая статистика центра" />
      </AppShell>
    </ProtectedRoute>
  );
}
