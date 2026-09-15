import { Product, Order, Customer } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }

  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; service: string }>("/health"),

  // Products
  getProducts: () => fetchJson<Product[]>("/products"),
  createProduct: (data: Omit<Product, "id">) =>
    fetchJson<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStock: (productId: string, stockQuantity: number) =>
    fetchJson<Product>(`/products/${productId}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock_quantity: stockQuantity }),
    }),

  // Orders
  getOrders: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return fetchJson<Order[]>(`/orders${query}`);
  },
  getOrder: (orderId: string) => fetchJson<Order>(`/orders/${orderId}`),
  createDraftOrder: (customerPhone: string, items: { product_code: string; quantity: number }[]) =>
    fetchJson<Order>("/orders/draft", {
      method: "POST",
      body: JSON.stringify({ customer_phone: customerPhone, items }),
    }),
  confirmOrder: (orderId: string) =>
    fetchJson<Order>(`/orders/${orderId}/confirm`, {
      method: "POST",
    }),
  attachReceipt: (orderId: string, receiptUrl: string, receiptData: Record<string, any>) =>
    fetchJson<Order>(`/orders/${orderId}/receipt`, {
      method: "POST",
      body: JSON.stringify({ receipt_url: receiptUrl, receipt_data: receiptData }),
    }),
};
