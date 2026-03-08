// lib/server/Article/Article-server.ts
import type { ArticleTypeResponse, Item } from '@/type/article-type';

const BASE_URL =
  'https://api.rss2json.com/v1/api.json?rss_url=https://republika.co.id/rss/khazanah';

/**
 * fetchAllArticle
 */
export async function fetchAllArticle(): Promise<Item[]> {
  const url = BASE_URL;
  const res = await fetch(url);
  ``;

  if (!res.ok) {
    throw new Error(`fetchAllArticle failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as ArticleTypeResponse | null;
  if (!json || !Array.isArray(json.items)) {
    throw new Error('fetchAllArticle: unexpected response shape');
  }

  return json.items;
}
