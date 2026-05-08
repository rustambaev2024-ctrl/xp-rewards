import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "u1",
    username: "student",
    first_name: "Aziz",
    last_name: "Karimov",
    email: "aziz@kelajak.uz",
    role: "student",
    level: 2,
    xp: 1200,
    xp_to_next: 2000,
    balance: 450,
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "u2",
    username: "teacher",
    first_name: "Dilnoza",
    last_name: "Yusupova",
    email: "dilnoza@kelajak.uz",
    role: "teacher",
    level: 1,
    xp: 0,
    xp_to_next: 1000,
    balance: 0,
    is_active: true,
    created_at: "2024-09-01T10:00:00Z",
  },
  {
    id: "u3",
    username: "admin",
    first_name: "Sardor",
    last_name: "Rahimov",
    email: "admin@kelajak.uz",
    role: "admin",
    level: 1,
    xp: 0,
    xp_to_next: 1000,
    balance: 0,
    is_active: true,
    created_at: "2024-08-01T10:00:00Z",
  },
];

export const mockPasswords: Record<string, string> = {
  student: "student",
  teacher: "teacher",
  admin: "admin",
};
