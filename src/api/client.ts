export const USE_MOCK = true;
export const API_BASE_URL = "/api";

export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms + Math.random() * 150));

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kt_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("kt_token", token);
  else localStorage.removeItem("kt_token");
}
