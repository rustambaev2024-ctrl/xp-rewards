import { useEffect, useState } from "react";
import { getSettings } from "@/api/student";
import type { Settings } from "@/types";

const DAY_NAMES: Record<number, string> = {
  1: "понедельник",
  2: "вторник",
  3: "среду",
  4: "четверг",
  5: "пятницу",
  6: "субботу",
  0: "воскресенье",
};

export function useStoreStatus() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().getDay();
  // JS getDay: 0=Sun, 1=Mon..6=Sat — matches our store_open_days convention
  const isOpen = settings ? settings.store_open_days.includes(today) : false;

  const nextOpenDay = (() => {
    if (!settings) return null;
    const openDays = settings.store_open_days.sort((a, b) => a - b);
    // Find next open day from today
    const future = openDays.filter((d) => d > today);
    const next = future.length > 0 ? future[0] : openDays[0];
    const daysUntil = next > today ? next - today : 7 - today + next;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysUntil);
    return {
      dayName: DAY_NAMES[next],
      date: nextDate,
    };
  })();

  return { isOpen, nextOpenDay, loading };
}
