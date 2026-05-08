import type { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  { id: "n1", type: "coins", text: "Вам начислено 50 монет за домашнее задание", created_at: "2026-05-08T09:30:00Z", is_read: false },
  { id: "n2", type: "achievement", text: "Получено достижение «Уровень 2»", created_at: "2026-05-07T18:00:00Z", is_read: false },
  { id: "n3", type: "purchase", text: "Заказ «Стикерпак» выдан", created_at: "2026-05-06T19:00:00Z", is_read: true },
  { id: "n4", type: "system", text: "Магазин откроется в среду", created_at: "2026-05-05T20:00:00Z", is_read: true },
  { id: "n5", type: "coins", text: "Списано 20 монет за опоздание", created_at: "2026-05-04T08:50:00Z", is_read: true },
];
