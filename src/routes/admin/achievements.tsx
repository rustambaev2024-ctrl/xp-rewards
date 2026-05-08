import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/admin/achievements")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <PagePlaceholder title="Достижения" description="Управление достижениями" />
      </AppShell>
    </ProtectedRoute>
  );
}
