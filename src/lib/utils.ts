import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n < 1000) return n.toLocaleString("ru-RU");
  if (n < 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.round(n / 1000)}K`;
}

export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;

  const days = Math.floor(hours / 24);
  if (days === 1) {
    const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    return `вчера в ${time}`;
  }
  if (days < 7) return `${days} дн назад`;

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
