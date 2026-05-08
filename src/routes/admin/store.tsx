import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/admin/store")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AppShell section="admin">
        <PagePlaceholder title="Товары" description="Управление каталогом" />
      </AppShell>
    </ProtectedRoute>
  );
}
