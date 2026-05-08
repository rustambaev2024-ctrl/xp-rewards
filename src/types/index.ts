export type Role = "student" | "teacher" | "admin";

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  level: number;
  xp: number;
  xp_to_next: number;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export type TxType = "earn" | "spend" | "penalty";
export interface Transaction {
  id: string;
  user_id: string;
  type: TxType;
  amount: number;
  reason: string;
  comment?: string;
  balance_after: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category_id: string;
  required_level: number;
  stock: number;
  is_active: boolean;
}

export type OrderStatus = "new" | "confirmed" | "delivered" | "cancelled";
export interface Order {
  id: string;
  user_id: string;
  product: Product;
  status: OrderStatus;
  price: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  level: number;
  xp: number;
  balance: number;
  rank: number;
}

export interface Notification {
  id: string;
  type: "achievement" | "purchase" | "coins" | "system";
  text: string;
  created_at: string;
  is_read: boolean;
}

export interface Settings {
  xp_per_coin: number;
  level_thresholds: number[];
  store_open_days: number[]; // 0=Sun..6=Sat (we use 1=Mon..7=Sun)
}
