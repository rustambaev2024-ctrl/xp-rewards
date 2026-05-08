import type { User } from "@/types";
import { mockPasswords, mockUsers } from "@/mock/users";
import { USE_MOCK, delay, setToken } from "./client";

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    await delay();
    const user = mockUsers.find((u) => u.username === username);
    if (!user || mockPasswords[username] !== password) {
      throw new Error("Неверный логин или пароль");
    }
    const token = `mock.${user.id}.${Date.now()}`;
    setToken(token);
    localStorage.setItem("kt_user", JSON.stringify(user));
    return { token, user };
  }
  throw new Error("Real API not implemented");
}

export async function logout(): Promise<void> {
  setToken(null);
  if (typeof window !== "undefined") localStorage.removeItem("kt_user");
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<{ ok: true }> {
  if (USE_MOCK) {
    await delay();
    if (mockUsers.some((u) => u.username === payload.username)) {
      throw new Error("Пользователь с таким username уже существует");
    }
    return { ok: true };
  }
  throw new Error("Real API not implemented");
}

export async function resetPassword(email: string): Promise<{ ok: true }> {
  if (USE_MOCK) {
    await delay();
    if (!email.includes("@")) throw new Error("Некорректный email");
    return { ok: true };
  }
  throw new Error("Real API not implemented");
}

export function loadStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("kt_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
