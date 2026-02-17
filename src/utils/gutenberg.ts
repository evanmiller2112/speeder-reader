import { FileType } from './textParser';

export interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  download_count: number;
  formats: Record<string, string>;
}

export interface GutenbergFormat {
  url: string;
  type: FileType;
}

/** Picks the best available download format: EPUB > PDF > plain text. */
export function bestGutenbergFormat(formats: Record<string, string>): GutenbergFormat | null {
  const entries = Object.entries(formats);
  for (const [mime, url] of entries) {
    if (mime === 'application/epub+zip') return { url, type: 'epub' };
  }
  for (const [mime, url] of entries) {
    if (mime === 'application/pdf') return { url, type: 'pdf' };
  }
  for (const [mime, url] of entries) {
    if (mime.startsWith('text/plain') && !url.endsWith('.zip')) return { url, type: 'txt' };
  }
  return null;
}

/** Searches the Gutendex API (Gutenberg metadata). Returns up to 32 results. */
export async function fetchGutenbergSearch(query: string): Promise<GutenbergBook[]> {
  const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}&languages=en&sort=popular`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gutendex HTTP ${res.status}`);
  const data = await res.json();
  return (data.results ?? []) as GutenbergBook[];
}
