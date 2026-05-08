import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/context/AuthContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md text-center"
      >
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="font-display text-4xl font-bold text-text-primary">404</h1>
        <h2 className="mt-3 text-xl font-semibold text-text-primary">Страница не найдена</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Похоже, такой страницы не существует. Проверьте адрес или вернитесь на главную.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            На главную
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md text-center"
      >
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-xl font-semibold text-text-primary">Что-то пошло не так</h1>
        <p className="mt-2 text-sm text-text-secondary">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Повторить
        </button>
      </motion.div>
    </div>
  );
}

function SuspenseFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <Spinner size="lg" className="text-primary" />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kelajak Ta'lim — Coin System" },
      { name: "description", content: "Геймифицированная платформа учебного центра Kelajak Ta'lim" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg-primary text-text-primary">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<SuspenseFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={useRouter().state.location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
        <Toaster
          theme="dark"
          position="bottom-right"
          richColors
          duration={3000}
          toastOptions={{
            className: "text-sm",
            success: { duration: 3000 },
            error: { duration: 5000 },
            info: { duration: 3000 },
            warning: { duration: 4000 },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
