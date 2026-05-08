import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/student/orders")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <PagePlaceholder title="Мои заказы" description="История покупок" />
      </AppShell>
    </ProtectedRoute>
  );
}
