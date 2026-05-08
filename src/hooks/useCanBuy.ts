import type { Product, User } from "@/types";

export type BuyReason =
  | "ok"
  | "store_closed"
  | "no_stock"
  | "level_low"
  | "insufficient_funds"
  | "limit_reached";

export interface CanBuyResult {
  canBuy: boolean;
  reason: BuyReason;
  tooltip: string;
}

export function useCanBuy(
  product: Product | null,
  user: User | null,
  storeOpen: boolean,
  nextOpenDate?: string
): CanBuyResult {
  if (!product || !user) {
    return { canBuy: false, reason: "store_closed", tooltip: "Загрузка..." };
  }

  if (!storeOpen) {
    return {
      canBuy: false,
      reason: "store_closed",
      tooltip: nextOpenDate
        ? `Магазин откроется в ${nextOpenDate}`
        : "Магазин сейчас закрыт",
    };
  }

  if (product.stock <= 0) {
    return { canBuy: false, reason: "no_stock", tooltip: "Товар закончился" };
  }

  if (user.level < product.required_level) {
    return {
      canBuy: false,
      reason: "level_low",
      tooltip: `Ваш уровень: ${user.level}. Требуется: ${product.required_level}`,
    };
  }

  if (user.balance < product.price) {
    return {
      canBuy: false,
      reason: "insufficient_funds",
      tooltip: `Нужно ещё ${product.price - user.balance} монет`,
    };
  }

  // Limit check — for mock, assume no limit reached
  return { canBuy: true, reason: "ok", tooltip: "" };
}
