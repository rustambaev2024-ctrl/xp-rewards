import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Lock, Calendar, Coins, Ban } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { useCanBuy, type BuyReason } from "@/hooks/useCanBuy";
import { getProducts, getCategories } from "@/api/store";
import type { Product, Category } from "@/types";

export const Route = createFileRoute("/student/store")({
  component: Page,
});

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const btnConfig: Record<BuyReason, { label: string; icon: React.ReactNode; className: string }> = {
  ok: { label: "Купить", icon: null, className: "bg-coin text-bg-primary hover:bg-coin/90 font-semibold" },
  store_closed: { label: "Магазин закрыт", icon: <Calendar size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  no_stock: { label: "Нет в наличии", icon: <Ban size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  level_low: { label: "Нужен Level", icon: <Lock size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  insufficient_funds: { label: "Недостаточно монет", icon: <Coins size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  limit_reached: { label: "Лимит исчерпан", icon: <Ban size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
};

function ProductCard({
  product,
  user,
  storeOpen,
  nextOpenDate,
  categoryMap,
}: {
  product: Product;
  user: { level: number; balance: number };
  storeOpen: boolean;
  nextOpenDate?: string;
  categoryMap: Record<string, string>;
}) {
  const fakeUser = { id: "", username: "", first_name: "", last_name: "", email: "", role: "student" as const, avatar_url: "", level: user.level, xp: 0, xp_to_next: 0, balance: user.balance, is_active: true, created_at: "" };
  const { canBuy, reason, tooltip } = useCanBuy(product, fakeUser, storeOpen, nextOpenDate);
  const cfg = btnConfig[reason];
  const levelLocked = user.level < product.required_level;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
      <Card className="overflow-hidden flex flex-col h-full group">
        <Link to="/student/store/$id" params={{ id: product.id }} className="block relative h-40 bg-bg-elevated overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${levelLocked ? "opacity-50" : "opacity-90"}`}
            loading="lazy"
          />
          {product.required_level > 1 && (
            <div className="absolute top-2 left-2">
              <LevelBadge level={product.required_level} size="sm" />
            </div>
          )}
        </Link>
        <CardContent className="flex-1 flex flex-col gap-2 pt-4">
          <div className="flex-1">
            <Link to="/student/store/$id" params={{ id: product.id }}>
              <p className="text-sm font-medium text-text-primary hover:text-primary transition-colors truncate">
                {product.name}
              </p>
            </Link>
            <p className="text-xs text-text-muted mt-0.5">{categoryMap[product.category_id] ?? ""}</p>
          </div>
          <div className="flex items-center justify-between">
            <CoinBadge amount={product.price} size="sm" />
            {product.stock < 5 && product.stock > 0 && (
              <span className="text-[10px] text-spend font-medium">Осталось {product.stock} шт</span>
            )}
          </div>
          <button
            disabled={!canBuy}
            title={tooltip}
            className={`mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors ${cfg.className}`}
          >
            {cfg.icon}
            {cfg.label}
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Page() {
  const { user } = useAuth();
  const { isOpen, nextOpenDay, loading: statusLoading } = useStoreStatus();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.is_active);
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category_id === selectedCategory);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCategory, debouncedSearch]);

  const nextOpenDate = nextOpenDay
    ? `${nextOpenDay.dayName}, ${nextOpenDay.date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`
    : undefined;

  if (loading || statusLoading || !user) {
    return (
      <ProtectedRoute roles={["student"]}>
        <AppShell section="student">
          <LoadingSkeleton variant="store-grid" count={8} />
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-5">
          {/* Status banner */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                isOpen
                  ? "bg-earn/10 text-earn border border-earn/20"
                  : "bg-status-new/10 text-status-new border border-status-new/20"
              }`}
            >
              {isOpen ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-earn animate-pulse" />
                  Магазин открыт сегодня
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Магазин закрыт. Следующее открытие: {nextOpenDate ?? "..."}
                </>
              )}
            </div>
          </motion.div>

          {/* Search */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <Input
              placeholder="Поиск товаров..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </motion.div>

          {/* Category chips */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                  selectedCategory === "all"
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-bg-elevated text-text-secondary border-border hover:bg-bg-elevated/80"
                }`}
              >
                Все
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                    selectedCategory === c.id
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-bg-elevated text-text-secondary border-border hover:bg-bg-elevated/80"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Products grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Ничего не найдено"
              description="Попробуйте изменить фильтры или поисковый запрос"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.05 * i }}
                >
                  <ProductCard
                    product={product}
                    user={user}
                    storeOpen={isOpen}
                    nextOpenDate={nextOpenDate}
                    categoryMap={categoryMap}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
