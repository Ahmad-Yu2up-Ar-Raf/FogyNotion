// lib/server/Products/products-server-queries.ts
//
// ARSITEKTUR:
//   - ProductsListFilters sekarang pakai `category?: Category[]` (array) → multi-select
//   - Filter dilakukan client-side setelah fetch semua data
//   - queryKey mengandung filters → TanStack otomatis re-fetch saat filter berubah
//   - staleTime 5 menit → data di-cache, switch filter tidak re-fetch ke network
//     selama cache masih fresh (hanya re-compute filter dari cache)

import { queryOptions } from '@tanstack/react-query';
import { fetchAllProducts } from './products-server';
import { Product, Category } from '@/type/product-type';

// ─── Filter shape ─────────────────────────────────────────────────────────────
// `category` adalah array agar mendukung multi-select:
//   []            → tidak ada filter aktif → tampilkan semua
//   ['pagi']      → hanya pagi
//   ['pagi','solat'] → pagi DAN solat (union, bukan intersection)
export type ProductsListFilters = {
  search?: string;
  category?: Category[]; // ← CHANGED: was `type?: Category`, now array for multi-select
};

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Key mengandung filters object → setiap kombinasi filter punya cache entry sendiri
// Ini memungkinkan instant switching antar filter kombinasi yang sudah pernah di-fetch
export const ProductsKeys = {
  all: ['Products'] as const,
  lists: () => [...ProductsKeys.all, 'list'] as const,

  // Normalisasi key: sort category array agar ['pagi','solat'] === ['solat','pagi']
  // Ini mencegah cache miss akibat urutan filter yang berbeda
  list: (filters?: ProductsListFilters) => {
    const normalizedFilters = filters
      ? {
          ...filters,
          category: filters.category ? [...filters.category].sort() : undefined,
        }
      : {};
    return [...ProductsKeys.lists(), normalizedFilters] as const;
  },

  detail: (id: string) => [...ProductsKeys.all, 'detail', id] as const,
};

// ─── List Query Options ───────────────────────────────────────────────────────
// Reusable di seluruh app: cukup pass `filters` yang berbeda
// TanStack Query handle dedup + caching otomatis berdasarkan queryKey
export function ProductsListQueryOptions(filters?: ProductsListFilters) {
  return queryOptions({
    queryKey: ProductsKeys.list(filters),

    queryFn: async (): Promise<Product[]> => {
      // Fetch semua data sekali → di-cache oleh TanStack
      // Filter dilakukan in-memory → switch filter = instant, tanpa network call
      const all = await fetchAllProducts();
      if (!filters) return all;

      const q = filters.search?.trim().toLowerCase() ?? '';

      // `category` kosong atau undefined → tampilkan semua (no type filter)
      const hasCategoryFilter = (filters.category?.length ?? 0) > 0;

      return all.filter((item) => {
        // Search filter: match arab atau terjemahan indo
        const matchSearch =
          !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);

        // Category filter: item.type harus ada di dalam array category yang dipilih
        // Jika tidak ada filter type → semua lolos
        const matchCategory = !hasCategoryFilter || filters.category!.includes(item.category);

        return matchSearch && matchCategory;
      });
    },

    // Data dianggap fresh selama 5 menit → switch filter tidak trigger network call
    // jika data root ('Products','list',{}) masih di cache
    staleTime: 5 * 60 * 1000,

    // Data tetap di memory 30 menit sejak terakhir digunakan
    gcTime: 30 * 60 * 1000,

    retry: 1,
  });
}
