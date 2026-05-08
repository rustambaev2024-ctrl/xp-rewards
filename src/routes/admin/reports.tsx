import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/admin/reports")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <PagePlaceholder title="Отчёты" description="Аналитика и графики" />
      </AppShell>
    </ProtectedRoute>
  );
}
