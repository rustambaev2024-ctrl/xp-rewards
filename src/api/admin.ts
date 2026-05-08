import { USE_MOCK, delay } from "./client";
import { mockUsers } from "@/mock/users";
import { mockSettings } from "@/mock/settings";
import type { OrderStatus, Settings, User } from "@/types";

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
