import type { Transaction } from "@/types";

export const mockTransactions: Transaction[] = [
  { id: "t1", user_id: "u1", type: "earn", amount: 50, reason: "Домашнее задание", balance_after: 450, created_at: "2026-05-08T09:30:00Z" },
  { id: "t2", user_id: "u1", type: "earn", amount: 30, reason: "Активность на уроке", balance_after: 400, created_at: "2026-05-07T14:00:00Z" },
  { id: "t3", user_id: "u1", type: "spend", amount: 100, reason: "Покупка: Стикерпак", balance_after: 370, created_at: "2026-05-06T18:20:00Z" },
  { id: "t4", user_id: "u1", type: "earn", amount: 80, reason: "Тест на 5", balance_after: 470, created_at: "2026-05-05T11:00:00Z" },
  { id: "t5", user_id: "u1", type: "penalty", amount: 20, reason: "Опоздание", balance_after: 390, created_at: "2026-05-04T08:45:00Z" },
  { id: "t6", user_id: "u1", type: "earn", amount: 40, reason: "Помощь однокласснику", balance_after: 410, created_at: "2026-05-03T13:00:00Z" },
  { id: "t7", user_id: "u1", type: "earn", amount: 100, reason: "Победа в олимпиаде", balance_after: 370, created_at: "2026-05-02T16:00:00Z" },
  { id: "t8", user_id: "u1", type: "spend", amount: 200, reason: "Покупка: Блокнот", balance_after: 270, created_at: "2026-05-01T12:00:00Z" },
  { id: "t9", user_id: "u1", type: "earn", amount: 60, reason: "Контрольная", balance_after: 470, created_at: "2026-04-30T10:00:00Z" },
  { id: "t10", user_id: "u1", type: "earn", amount: 25, reason: "Активность", balance_after: 410, created_at: "2026-04-29T14:30:00Z" },
  { id: "t11", user_id: "u1", type: "penalty", amount: 15, reason: "Не сдал ДЗ", balance_after: 385, created_at: "2026-04-28T09:00:00Z" },
  { id: "t12", user_id: "u1", type: "earn", amount: 90, reason: "Проект", balance_after: 400, created_at: "2026-04-27T15:00:00Z" },
  { id: "t13", user_id: "u1", type: "spend", amount: 50, reason: "Покупка: Ручка", balance_after: 310, created_at: "2026-04-26T11:00:00Z" },
  { id: "t14", user_id: "u1", type: "earn", amount: 35, reason: "Чтение", balance_after: 360, created_at: "2026-04-25T17:00:00Z" },
  { id: "t15", user_id: "u1", type: "earn", amount: 45, reason: "Эссе", balance_after: 325, created_at: "2026-04-24T13:00:00Z" },
];
