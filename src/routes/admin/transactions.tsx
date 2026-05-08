import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/admin/transactions")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <PagePlaceholder title="Все транзакции" description="Журнал операций" />
      </AppShell>
    </ProtectedRoute>
  );
}
