// lib/server/Article/article-server-queries.ts

import { queryOptions } from '@tanstack/react-query';
import { fetchAllArticle } from './article-server';
import type { Category, Item } from '@/type/article-type';

// ─── Filter Shape ─────────────────────────────────────────────────────────────
// `categories` adalah array → support multi-select
//   []                          → tidak ada filter → tampilkan semua
//   ['Dunia']                   → hanya artikel ber-kategori Dunia
//   ['Dunia','Islam Nusantara'] → artikel yang punya salah satu dari keduanya
export type ArticleListFilters = {
  search?: string;
  categories?: Category[]; // ← CHANGED: was `kategori?: Category`
};

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const ArticleKeys = {
  all: ['Article'] as const,
  lists: () => [...ArticleKeys.all, 'list'] as const,

  // Normalize: sort categories array agar ['Dunia','Islam Nusantara'] === ['Islam Nusantara','Dunia']
  // Mencegah cache miss akibat urutan filter yang berbeda
  list: (filters?: ArticleListFilters) => {
    const normalized = filters
      ? { ...filters, categories: filters.categories ? [...filters.categories].sort() : undefined }
      : {};
    return [...ArticleKeys.lists(), normalized] as const;
  },

  detail: (guid: string) => [...ArticleKeys.all, 'detail', guid] as const,
};

// ─── List Query Options ───────────────────────────────────────────────────────
export function ArticleListQueryOptions(filters?: ArticleListFilters) {
  return queryOptions({
    queryKey: ArticleKeys.list(filters),

    queryFn: async (): Promise<Item[]> => {
      const all = await fetchAllArticle();
      if (!filters) return all;

      const q = filters.search?.trim().toLowerCase() ?? '';
      const hasCategoryFilter = (filters.categories?.length ?? 0) > 0;

      return all.filter((item) => {
        // Search: match title, author, atau description
        const matchSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);

        // Category filter: cek apakah item.categories (array) punya IRISAN
        // dengan filters.categories yang dipilih user
        // Contoh: item.categories = ['Dunia','Islam Nusantara']
        //         filters.categories = ['Dunia'] → match ✅
        //         filters.categories = ['Filantropi Khazanah'] → no match ❌
        const matchCategory =
          !hasCategoryFilter || item.categories.some((cat) => filters.categories!.includes(cat));

        return matchSearch && matchCategory;
      });
    },

    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
