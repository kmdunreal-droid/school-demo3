/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FAVORITES (Pin) — "mere sab se zyada use hone wale features"
 * ═══════════════════════════════════════════════════════════════════════════
 * User sidebar/command-palette se kisi bhi feature ko pin kar sakta hai.
 * Pinned features Dashboard par sab se upar "Aap ke Favourites" mein dikhte
 * hain — is se jo feature chahiye woh seedha samne hote hue milta hai.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { safeStorage } from './safeStorage';

const KEY_PREFIX = 'acadamis_pins_';
const MAX_PINS = 8;

function keyFor(role: string): string {
  return `${KEY_PREFIX}${role}`;
}

export function getFavorites(role: string): string[] {
  try {
    const raw = safeStorage.getItem(keyFor(role));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string').slice(0, MAX_PINS);
  } catch {
    return [];
  }
}

export function setFavorites(role: string, ids: string[]): string[] {
  const clean = Array.from(new Set(ids)).slice(0, MAX_PINS);
  safeStorage.setItem(keyFor(role), JSON.stringify(clean));
  return clean;
}

export function isFavorite(role: string, id: string): boolean {
  return getFavorites(role).includes(id);
}

/** Pin lagaye/hataye — nayi list return karta hai. */
export function toggleFavorite(role: string, id: string): string[] {
  const current = getFavorites(role);
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id].slice(0, MAX_PINS);
  return setFavorites(role, next);
}

export function clearFavorites(role: string): void {
  setFavorites(role, []);
}

export const MAX_FAVORITES = MAX_PINS;
