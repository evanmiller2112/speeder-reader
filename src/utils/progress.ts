import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WordEntry } from './pdfParser';

export interface SavedProgress {
  wordIndex: number;
  page: number;
}

export interface SavedBook {
  words: WordEntry[];
  numPages: number;
  fileKey: string;
  fileName: string;
  wpm: number;
}

const PREFIX = 'sr_progress:';
const CURRENT_BOOK_KEY = 'sr_current_book';
const WPM_KEY = 'sr_wpm';

export async function saveWpm(wpm: number): Promise<void> {
  try {
    await AsyncStorage.setItem(WPM_KEY, String(wpm));
  } catch {}
}

export async function loadWpm(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(WPM_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

/** Normalize a filename or URL into a stable storage key. */
export function makeFileKey(nameOrUrl: string): string {
  return nameOrUrl.split('?')[0].split('#')[0].trim();
}

export async function loadProgress(fileKey: string): Promise<SavedProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + fileKey);
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

export async function saveProgress(fileKey: string, progress: SavedProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + fileKey, JSON.stringify(progress));
  } catch {}
}

export async function clearProgress(fileKey: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + fileKey);
  } catch {}
}

const MAX_BOOK_SIZE = 5 * 1024 * 1024; // 5 MB limit

export async function saveCurrentBook(book: SavedBook): Promise<void> {
  try {
    const json = JSON.stringify(book);
    if (json.length > MAX_BOOK_SIZE) return; // skip very large books
    await AsyncStorage.setItem(CURRENT_BOOK_KEY, json);
  } catch {}
}

export async function loadCurrentBook(): Promise<SavedBook | null> {
  try {
    const raw = await AsyncStorage.getItem(CURRENT_BOOK_KEY);
    return raw ? (JSON.parse(raw) as SavedBook) : null;
  } catch {
    return null;
  }
}

export async function clearCurrentBook(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CURRENT_BOOK_KEY);
  } catch {}
}
