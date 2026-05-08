import type { Achievement } from "@/types";

export const mockAchievements: Achievement[] = [
  { id: "a1", name: "Первая монета", description: "Заработай первую монету", icon: "🪙", condition_type: "coins_earned", condition_value: 1, unlocked: true, unlocked_at: "2025-01-16" },
  { id: "a2", name: "Сотня в кармане", description: "Накопи 100 монет", icon: "💰", condition_type: "coins_earned", condition_value: 100, unlocked: true, unlocked_at: "2025-02-02" },
  { id: "a3", name: "Шопоголик", description: "Соверши 3 покупки", icon: "🛒", condition_type: "purchases_count", condition_value: 3, unlocked: true, unlocked_at: "2025-03-15" },
  { id: "a4", name: "Уровень 2", description: "Достигни 2-го уровня", icon: "⭐", condition_type: "level", condition_value: 2, unlocked: true, unlocked_at: "2025-03-20" },
  { id: "a5", name: "Тысячник", description: "Накопи 1000 монет", icon: "💎", condition_type: "coins_earned", condition_value: 1000, unlocked: false },
  { id: "a6", name: "Уровень 3", description: "Достигни 3-го уровня", icon: "🏆", condition_type: "level", condition_value: 3, unlocked: false },
  { id: "a7", name: "Коллекционер", description: "Соверши 10 покупок", icon: "🎁", condition_type: "purchases_count", condition_value: 10, unlocked: false },
  { id: "a8", name: "Легенда KT", description: "Достигни 4-го уровня", icon: "👑", condition_type: "level", condition_value: 4, unlocked: false },
];
