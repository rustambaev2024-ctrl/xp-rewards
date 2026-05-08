import { USE_MOCK, delay } from "./client";
import { mockCategories, mockProducts } from "@/mock/products";
import type { Category, Product } from "@/types";

export async function getProducts(params?: { category?: string; q?: string }): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    let list = mockProducts;
    if (params?.category) list = list.filter((p) => p.category_id === params.category);
    if (params?.q) {
      const q = params.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }
  throw new Error("Real API not implemented");
}

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    await delay(200);
    return mockCategories;
  }
  throw new Error("Real API not implemented");
}

export async function getProductById(id: string): Promise<Product> {
  if (USE_MOCK) {
    await delay();
    const p = mockProducts.find((x) => x.id === id);
    if (!p) throw new Error("Товар не найден");
    return p;
  }
  throw new Error("Real API not implemented");
}

export async function buyProduct(id: string): Promise<{ ok: true }> {
  if (USE_MOCK) {
    await delay();
    return { ok: true };
  }
  throw new Error("Real API not implemented");
}
