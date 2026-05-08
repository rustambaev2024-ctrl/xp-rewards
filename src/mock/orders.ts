import type { Order } from "@/types";
import { mockProducts } from "./products";

export const mockOrders: Order[] = [
  { id: "o1", user_id: "u1", product: mockProducts[2], status: "delivered", price: 100, created_at: "2026-05-06T18:20:00Z" },
  { id: "o2", user_id: "u1", product: mockProducts[1], status: "delivered", price: 200, created_at: "2026-05-01T12:00:00Z" },
  { id: "o3", user_id: "u1", product: mockProducts[0], status: "confirmed", price: 50, created_at: "2026-04-26T11:00:00Z" },
  { id: "o4", user_id: "u1", product: mockProducts[5], status: "new", price: 80, created_at: "2026-05-08T07:10:00Z" },
  { id: "o5", user_id: "u1", product: mockProducts[3], status: "cancelled", price: 600, created_at: "2026-04-20T09:00:00Z" },
  { id: "o6", user_id: "u1", product: mockProducts[6], status: "new", price: 350, created_at: "2026-05-08T08:00:00Z" },
];
