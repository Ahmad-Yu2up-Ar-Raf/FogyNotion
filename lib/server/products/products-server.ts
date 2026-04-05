// lib/server/Products/Products-server.ts
import { Product, ProductResponse } from '@/type/product-type';

/**
 * fetchAllProducts
 */
export async function fetchAllProducts(base_url: string): Promise<Product[]> {
  const url = base_url;
  const res = await fetch(url);
  ``;

  if (!res.ok) {
    throw new Error(`fetchAllProducts failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as ProductResponse | null;
  if (!json || !Array.isArray(json.products)) {
    throw new Error('fetchAllProducts: unexpected response shape');
  }

  return json.products;
}
