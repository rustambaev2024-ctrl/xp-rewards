import type { Category, Product } from "@/types";

export const mockCategories: Category[] = [
  { id: "c1", name: "Канцелярия" },
  { id: "c2", name: "Мерч" },
  { id: "c3", name: "Привилегии" },
];

export const mockProducts: Product[] = [
  { id: "p1", name: "Ручка KT", description: "Фирменная гелевая ручка центра.", image_url: "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=600", price: 50, category_id: "c1", required_level: 1, stock: 25, is_active: true },
  { id: "p2", name: "Блокнот A5", description: "Блокнот с твёрдой обложкой и логотипом.", image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600", price: 200, category_id: "c1", required_level: 1, stock: 12, is_active: true },
  { id: "p3", name: "Стикерпак", description: "Набор из 12 виниловых стикеров.", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600", price: 100, category_id: "c2", required_level: 1, stock: 40, is_active: true },
  { id: "p4", name: "Футболка KT", description: "Хлопковая футболка с принтом.", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", price: 600, category_id: "c2", required_level: 2, stock: 8, is_active: true },
  { id: "p5", name: "Худи KT", description: "Худи с вышивкой логотипа.", image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600", price: 1500, category_id: "c2", required_level: 3, stock: 4, is_active: true },
  { id: "p6", name: "Пропуск без очереди", description: "Один проход без очереди в столовую.", image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600", price: 80, category_id: "c3", required_level: 1, stock: 100, is_active: true },
  { id: "p7", name: "Доп. попытка теста", description: "Право на пересдачу одного теста.", image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600", price: 350, category_id: "c3", required_level: 2, stock: 20, is_active: true },
  { id: "p8", name: "Встреча с директором", description: "Личная 30-мин встреча и наставничество.", image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600", price: 2500, category_id: "c3", required_level: 3, stock: 2, is_active: true },
];
