import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell, PagePlaceholder } from "@/components/layouts/AppShell";

export const Route = createFileRoute("/student/leaderboard")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <PagePlaceholder title="Рейтинг" description="Топ студентов центра" />
      </AppShell>
    </ProtectedRoute>
  );
}
