import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/student/transactions")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <PagePlaceholder title="История операций" description="Все ваши транзакции" />
      </AppShell>
    </ProtectedRoute>
  );
}
