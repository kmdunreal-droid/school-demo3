/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHOOL IDENTITY — School Name + Logo (white-label branding)
 * ═══════════════════════════════════════════════════════════════════════════
 * • Values `AppSettings.schoolName` / `AppSettings.logoSrc` mein save hoti hain
 *   (App.tsx ka wohi persistence: localStorage `acadamis_app_settings` +
 *   Supabase `app_settings/global`) — is liye Developer Portal se set karo,
 *   sab devices par khud sync ho jata hai.
 * • Yahan chhota module-store + `useSchoolIdentity()` hook hai (i18n.ts ka
 *   wohi `useSyncExternalStore` pattern) — is liye "har place" par dikhane ke
 *   liye prop drilling ki zaroorat nahi.
 * • Defaults: `DEFAULT_SCHOOL_NAME` / `DEFAULT_LOGO_SRC` — jab tak Developer
 *   Portal se kuch set na ho, purana behaviour bilkul wohi rehta hai.
 * • Legacy brand cleanup: `applySchoolBrand()` purane texts (e.g. saved WhatsApp
 *   template ya hardcoded "Demo School"/"NSB Academy") ko naye naam se badal
 *   deta hai — is liye purane templates bhi sahi naam dikhate hain.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useSyncExternalStore } from 'react';
import type { AppSettings } from '../types';
import { safeStorage } from './safeStorage';

export const DEFAULT_SCHOOL_NAME = 'Demo School';
export const DEFAULT_LOGO_SRC = '/logo.png';

export interface SchoolIdentity {
  schoolName: string;
  logoSrc: string;
}

/** Settings object → display name (blank/unset par default). */
export function getSchoolName(settings?: AppSettings | null): string {
  const n = settings?.schoolName;
  return typeof n === 'string' && n.trim() ? n.trim() : DEFAULT_SCHOOL_NAME;
}

/** Settings object → logo src (custom data-URL ya default `/logo.png`). */
export function getLogoSrc(settings?: AppSettings | null): string {
  const l = settings?.logoSrc;
  return typeof l === 'string' && l.trim() ? l.trim() : DEFAULT_LOGO_SRC;
}

/** Backup file ke liye slug: "Al-Noor Academy!" → "al-noor-academy" */
export function slugifySchoolName(name: string): string {
  const slug = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'school';
}

/**
 * Message templates / receipts ke liye brand text:
 * • `{school_name}` token ko naye naam se replace karta hai.
 * • Purane brand words (Demo School / Demo Academy / NSB Academy) ko bhi naye
 *   naam se badal deta hai — taake saved templates aur purane hard-coded texts
 *   bhi sahi school name dikhayein.
 */
export function applySchoolBrand(text: string, schoolName: string): string {
  const name = (schoolName || '').trim() || DEFAULT_SCHOOL_NAME;
  return String(text ?? '')
    .replace(/\{school_name\}/gi, name)
    .replace(/\bDemo\s+School\b/gi, name)
    .replace(/\bDemo\s+Academy\b/gi, name)
    .replace(/\bNSB\s+Academy\b/gi, name);
}


/**
 * Logo file → compressed data-URL (max 512px, webp; transparency ke liye PNG
 * fallback). WebP base64 cloud sync (Supabase `app_settings`) aur localStorage
 * ke liye chhota rehta hai.
 */
export function fileToLogoDataUrl(file: File, maxSize = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Sirf image file (PNG / JPG / WebP / SVG) chalegi.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Logo bohat bara hai — 5 MB se chhoti image use karein.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1));
          canvas.width = Math.max(1, Math.round((img.width || 1) * scale));
          canvas.height = Math.max(1, Math.round((img.height || 1) * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas support nahi mila.')); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const webp = canvas.toDataURL('image/webp', 0.9);
          resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png'));
        } catch {
          reject(new Error('Logo process nahi ho saka.'));
        }
      };
      img.onerror = () => reject(new Error('Image load nahi ho saki.'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('File read nahi ho saki.'));
    reader.readAsDataURL(file);
  });
}

/* ───────────────────── Module store (i18n.ts jaisa) ───────────────────── */
let listeners: (() => void)[] = [];
/**
 * Pehle paint se pehle hi localStorage se naam/logo le lete hain — is liye
 * reload par "Demo School" ka flash nahi hota; cloud settings load hone par
 * App.tsx `syncSchoolIdentity()` se update kar deta hai.
 */
function readInitialIdentity(): SchoolIdentity {
  try {
    const raw = safeStorage.getItem('acadamis_app_settings');
    if (raw) {
      const parsed = JSON.parse(raw) as AppSettings;
      return { schoolName: getSchoolName(parsed), logoSrc: getLogoSrc(parsed) };
    }
  } catch {
    /* corrupt/blocked storage → defaults */
  }
  return { schoolName: DEFAULT_SCHOOL_NAME, logoSrc: DEFAULT_LOGO_SRC };
}
let snapshot: SchoolIdentity = readInitialIdentity();

/**
 * App.tsx se har `appSettings` change (aur pehle render) par call hota hai.
 * Sirf tab notify karta hai jab naam/logo actually badle hon.
 */
export function syncSchoolIdentity(settings?: AppSettings | null): void {
  const next: SchoolIdentity = {
    schoolName: getSchoolName(settings),
    logoSrc: getLogoSrc(settings),
  };
  if (next.schoolName === snapshot.schoolName && next.logoSrc === snapshot.logoSrc) return;
  snapshot = next;
  listeners.forEach((fn) => fn());
}

/** Non-React code (export handlers etc.) ke liye current value. */
export function getSchoolIdentity(): SchoolIdentity {
  return snapshot;
}

function subscribe(cb: () => void): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((fn) => fn !== cb);
  };
}

function getSnapshot(): SchoolIdentity {
  return snapshot;
}

/** React hook — school ka naam + logo (kisi bhi component mein). */
export function useSchoolIdentity(): SchoolIdentity {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Sirf naam chahiye to (e.g. messages / headings). */
export function useSchoolName(): string {
  return useSchoolIdentity().schoolName;
}

/** Sirf logo chahiye to (e.g. `<img src>`). */
export function useLogoSrc(): string {
  return useSchoolIdentity().logoSrc;
}
