import { USE_MOCK, delay } from "./client";
import { loadStoredUser } from "./auth";
import { mockTransactions } from "@/mock/transactions";
import { mockOrders } from "@/mock/orders";
import { mockAchievements } from "@/mock/achievements";
import { mockLeaderboard } from "@/mock/leaderboard";
import { mockNotifications } from "@/mock/notifications";
import { mockSettings } from "@/mock/settings";
import type { Achievement, LeaderboardEntry, Notification, Order, Settings, Transaction, User } from "@/types";

export async function getMe(): Promise<User> {
  if (USE_MOCK) {
    await delay(200);
    const u = loadStoredUser();
    if (!u) throw new Error("Not authenticated");
    return u;
  }
  throw new Error("Real API not implemented");
}

export async function getTransactions(params?: { limit?: number }): Promise<Transaction[]> {
  if (USE_MOCK) {
    await delay();
    return params?.limit ? mockTransactions.slice(0, params.limit) : mockTransactions;
  }
  throw new Error("Real API not implemented");
}

export async function getOrders(params?: { limit?: number }): Promise<Order[]> {
  if (USE_MOCK) {
    await delay();
    return params?.limit ? mockOrders.slice(0, params.limit) : mockOrders;
  }
  throw new Error("Real API not implemented");
}

export async function getAchievements(): Promise<Achievement[]> {
  if (USE_MOCK) {
    await delay();
    return mockAchievements;
  }
  throw new Error("Real API not implemented");
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (USE_MOCK) {
    await delay();
    return mockLeaderboard;
  }
  throw new Error("Real API not implemented");
}

export async function getNotifications(): Promise<Notification[]> {
  if (USE_MOCK) {
    await delay();
    return mockNotifications;
  }
  throw new Error("Real API not implemented");
}

export async function readAllNotifications() {
  if (USE_MOCK) {
    await delay(200);
    mockNotifications.forEach((n) => { n.is_read = true; });
    return { ok: true };
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
