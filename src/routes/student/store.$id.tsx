import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Calendar, Coins, Ban } from "lucide-react";
import confetti from "canvas-confetti";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layouts/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CoinBadge } from "@/components/shared/CoinBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { useCanBuy, type BuyReason } from "@/hooks/useCanBuy";
import { getProductById, buyProduct, getCategories } from "@/api/store";
import { toast } from "@/components/ui/Toast";
import type { Product, Category } from "@/types";

export const Route = createFileRoute("/student/store/$id")({
  component: Page,
});

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const btnConfig: Record<BuyReason, { label: string; icon: React.ReactNode; className: string }> = {
  ok: { label: "", icon: null, className: "bg-coin text-bg-primary hover:bg-coin/90 font-semibold" },
  store_closed: { label: "Магазин закрыт", icon: <Calendar size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  no_stock: { label: "Нет в наличии", icon: <Ban size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  level_low: { label: "Нужен Level", icon: <Lock size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  insufficient_funds: { label: "Недостаточно монет", icon: <Coins size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
  limit_reached: { label: "Лимит исчерпан", icon: <Ban size={14} />, className: "bg-bg-elevated text-text-muted cursor-not-allowed" },
};

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isOpen, nextOpenDay, loading: statusLoading } = useStoreStatus();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    Promise.all([getProductById(id), getCategories()])
      .then(([p, c]) => {
        setProduct(p);
        setCategories(c);
      })
      .catch(() => navigate({ to: "/student/store" }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const categoryName = categories.find((c) => c.id === product?.category_id)?.name ?? "";
  const nextOpenDate = nextOpenDay
    ? `${nextOpenDay.dayName}, ${nextOpenDay.date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`
    : undefined;

  const canBuyResult = useCanBuy(product, user, isOpen, nextOpenDate);
  const cfg = btnConfig[canBuyResult.reason];
  const buyLabel = canBuyResult.reason === "ok" && product
    ? `Купить за ${product.price} монет`
    : cfg.label;

  const handleBuy = async () => {
    if (!product || !user) return;
    setBuying(true);

    // Optimistic balance update
    const prevBalance = user.balance;
    updateUser({ balance: user.balance - product.price });

    try {
      await buyProduct(product.id);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#8b5cf6", "#10b981", "#3b82f6"],
      });
      toast.success("Покупка успешна! Заказ создан");
      setConfirmOpen(false);
      setTimeout(() => navigate({ to: "/student/orders" }), 1500);
    } catch {
      toast.error("Ошибка при покупке. Попробуйте снова.");
      updateUser({ balance: prevBalance });
    } finally {
      setBuying(false);
    }
  };

  if (loading || statusLoading || !product || !user) {
    return (
      <ProtectedRoute roles={["student"]}>
        <AppShell section="student">
          <LoadingSkeleton variant="card" count={3} />
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["student"]}>
      <AppShell section="student">
        <div className="space-y-5 max-w-4xl">
          {/* Back link */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0 }}>
            <Link
              to="/student/store"
              className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Назад в магазин
            </Link>
          </motion.div>

          {/* Product layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
              <div className="rounded-2xl overflow-hidden bg-bg-secondary border border-border">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-64 md:h-80 object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Details */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex flex-col gap-4 pt-5">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>
                    <Badge className="mt-2">{categoryName}</Badge>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed">{product.description}</p>

                  {product.required_level > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Требуемый уровень:</span>
                      <LevelBadge level={product.required_level} size="sm" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <CoinBadge amount={product.price} size="lg" />
                  </div>

                  <div>
                    {product.stock > 0 ? (
                      <span className="text-sm text-text-secondary">
                        В наличии: <span className="text-text-primary font-medium">{product.stock} шт</span>
                      </span>
                    ) : (
                      <span className="text-sm text-spend font-medium">Нет в наличии</span>
                    )}
                  </div>

                  <div className="mt-auto pt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              onClick={() => canBuyResult.canBuy && setConfirmOpen(true)}
                              disabled={!canBuyResult.canBuy}
                              className={`w-full flex items-center justify-center gap-2 ${cfg.className}`}
                              size="lg"
                            >
                              {cfg.icon}
                              {buyLabel}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {canBuyResult.tooltip && (
                          <TooltipContent>{canBuyResult.tooltip}</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Confirm modal */}
          <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Подтвердить покупку">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div>
                  <p className="font-medium text-text-primary">{product.name}</p>
                  <CoinBadge amount={product.price} size="sm" />
                </div>
              </div>
              <div className="rounded-xl bg-bg-elevated p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Текущий баланс</span>
                  <span className="font-mono tabular-nums text-text-primary">{formatNumber(user.balance)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-text-secondary">Списание</span>
                  <span className="font-mono tabular-nums text-spend">-{formatNumber(product.price)}</span>
                </div>
                <div className="border-t border-border my-2" />
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Баланс после</span>
                  <span className="font-mono tabular-nums font-bold text-coin">
                    {formatNumber(user.balance - product.price)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
                  Отмена
                </Button>
                <Button className="flex-1 bg-coin text-bg-primary hover:bg-coin/90 font-semibold" onClick={handleBuy} loading={buying}>
                  Купить
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
