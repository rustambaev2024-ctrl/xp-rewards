import { USE_MOCK, delay } from "./client";
import { mockUsers } from "@/mock/users";
import { mockSettings } from "@/mock/settings";
import { mockTransactions } from "@/mock/transactions";
import { mockOrders } from "@/mock/orders";
import { mockAchievements } from "@/mock/achievements";
import { mockProducts, mockCategories } from "@/mock/products";
import type { Achievement, Category, OrderStatus, Product, Settings, Transaction, User } from "@/types";

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) {
    await delay();
    return mockUsers;
  }
  throw new Error("Real API not implemented");
}

export async function awardCoins(userId: string, amount: number, reason: string, comment?: string) {
  if (USE_MOCK) {
    await delay();
    return { ok: true, userId, amount, reason, comment };
  }
  throw new Error("Real API not implemented");
}

export async function deductCoins(userId: string, amount: number, reason: string, comment?: string) {
  if (USE_MOCK) {
    await delay();
    return { ok: true, userId, amount, reason, comment };
  }
  throw new Error("Real API not implemented");
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (USE_MOCK) {
    await delay();
    const order = mockOrders.find((o) => o.id === orderId);
    if (order) order.status = status;
    return { ok: true, orderId, status };
  }
  throw new Error("Real API not implemented");
}

export async function getSettings(): Promise<Settings> {
  if (USE_MOCK) {
    await delay(200);
    return mockSettings;
  }
  throw new Error("Real API not implemented");
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  if (USE_MOCK) {
    await delay();
    Object.assign(mockSettings, patch);
    return mockSettings;
  }
  throw new Error("Real API not implemented");
}

export async function getAdminTransactions(): Promise<Transaction[]> {
  if (USE_MOCK) {
    await delay();
    return mockTransactions;
  }
  throw new Error("Real API not implemented");
}

export async function getAdminOrders() {
  if (USE_MOCK) {
    await delay();
    return mockOrders;
  }
  throw new Error("Real API not implemented");
}

export async function getAdminProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    return mockProducts;
  }
  throw new Error("Real API not implemented");
}

export async function createProduct(data: Omit<Product, "id">): Promise<Product> {
  if (USE_MOCK) {
    await delay();
    const p: Product = { ...data, id: `p${Date.now()}` };
    mockProducts.push(p);
    return p;
  }
  throw new Error("Real API not implemented");
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  if (USE_MOCK) {
    await delay();
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Товар не найден");
    Object.assign(mockProducts[idx], data);
    return mockProducts[idx];
  }
  throw new Error("Real API not implemented");
}

export async function deleteProduct(id: string) {
  if (USE_MOCK) {
    await delay();
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx !== -1) mockProducts.splice(idx, 1);
    return { ok: true };
  }
  throw new Error("Real API not implemented");
}

export async function getAdminCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    await delay(200);
    return mockCategories;
  }
  throw new Error("Real API not implemented");
}

export async function createCategory(name: string): Promise<Category> {
  if (USE_MOCK) {
    await delay();
    const c: Category = { id: `c${Date.now()}`, name };
    mockCategories.push(c);
    return c;
  }
  throw new Error("Real API not implemented");
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Категория не найдена");
    mockCategories[idx].name = name;
    return mockCategories[idx];
  }
  throw new Error("Real API not implemented");
}

export async function deleteCategory(id: string) {
  if (USE_MOCK) {
    await delay();
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx !== -1) mockCategories.splice(idx, 1);
    return { ok: true };
  }
  throw new Error("Real API not implemented");
}

export async function getAdminAchievements(): Promise<Achievement[]> {
  if (USE_MOCK) {
    await delay();
    return mockAchievements;
  }
  throw new Error("Real API not implemented");
}

export async function createAchievement(data: Omit<Achievement, "id">): Promise<Achievement> {
  if (USE_MOCK) {
    await delay();
    const a: Achievement = { ...data, id: `a${Date.now()}` };
    mockAchievements.push(a);
    return a;
  }
  throw new Error("Real API not implemented");
}

export async function updateAchievement(id: string, data: Partial<Achievement>): Promise<Achievement> {
  if (USE_MOCK) {
    await delay();
    const idx = mockAchievements.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Достижение не найдено");
    Object.assign(mockAchievements[idx], data);
    return mockAchievements[idx];
  }
  throw new Error("Real API not implemented");
}

export async function deleteAchievement(id: string) {
  if (USE_MOCK) {
    await delay();
    const idx = mockAchievements.findIndex((a) => a.id === id);
    if (idx !== -1) mockAchievements.splice(idx, 1);
    return { ok: true };
  }
  throw new Error("Real API not implemented");
}

export async function toggleUserActive(userId: string) {
  if (USE_MOCK) {
    await delay();
    const u = mockUsers.find((u) => u.id === userId);
    if (u) u.is_active = !u.is_active;
    return { ok: true };
  }
  throw new Error("Real API not implemented");
}
