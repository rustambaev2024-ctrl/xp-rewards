import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/admin/orders")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <PagePlaceholder title="Заказы" description="Kanban-доска заказов" />
      </AppShell>
    </ProtectedRoute>
  );
}
