/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TUTORIAL PREFS — guided tour ki settings
 * ═══════════════════════════════════════════════════════════════════════════
 * Sab kuch `safeStorage` (localStorage wrapper) mein jata hai, kyunke app ka
 * poora data demo-mode mein local hi rehta hai.
 *
 * Settings se ON/OFF ho sakta hai:
 *   • enabled       → tour feature bilkul band (help button bhi chhup jata hai)
 *   • autostart     → login ke baad pehli baar khud-ba-khud chale
 *   • reduceMotion  → animations band (accessibility / slow devices)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { safeStorage } from './safeStorage';

const KEY_ENABLED = 'acadamis_tutorial_enabled';
const KEY_AUTOSTART = 'acadamis_tutorial_autostart';
const KEY_REDUCE_MOTION = 'acadamis_reduce_motion';
const KEY_DONE_PREFIX = 'acadamis_tutorial_done_';

export interface TutorialPrefs {
  /** Master switch — off karne par tour + help button dono chhup jate hain. */
  enabled: boolean;
  /** Naye user ko login ke baad khud tour dikhaye. */
  autostart: boolean;
  /** Animations band — accessibility aur purane devices ke liye. */
  reduceMotion: boolean;
}

export const DEFAULT_TUTORIAL_PREFS: TutorialPrefs = {
  enabled: true,
  autostart: true,
  reduceMotion: false,
};

function readBool(key: string, fallback: boolean): boolean {
  const raw = safeStorage.getItem(key);
  if (raw === null || raw === undefined || raw === 'null') return fallback;
  return raw === 'true';
}

export function getTutorialPrefs(): TutorialPrefs {
  return {
    enabled: readBool(KEY_ENABLED, DEFAULT_TUTORIAL_PREFS.enabled),
    autostart: readBool(KEY_AUTOSTART, DEFAULT_TUTORIAL_PREFS.autostart),
    reduceMotion: readBool(KEY_REDUCE_MOTION, DEFAULT_TUTORIAL_PREFS.reduceMotion),
  };
}

export function setTutorialPrefs(patch: Partial<TutorialPrefs>): TutorialPrefs {
  if (patch.enabled !== undefined) safeStorage.setItem(KEY_ENABLED, String(patch.enabled));
  if (patch.autostart !== undefined) safeStorage.setItem(KEY_AUTOSTART, String(patch.autostart));
  if (patch.reduceMotion !== undefined) {
    safeStorage.setItem(KEY_REDUCE_MOTION, String(patch.reduceMotion));
    applyReduceMotion(patch.reduceMotion);
  }
  return getTutorialPrefs();
}

/** Kya is role ka tour pehle mukammal ho chuka hai? */
export function isTourCompleted(role: string): boolean {
  return readBool(`${KEY_DONE_PREFIX}${role}`, false);
}

export function markTourCompleted(role: string): void {
  safeStorage.setItem(`${KEY_DONE_PREFIX}${role}`, 'true');
}

export function resetTour(role: string): void {
  safeStorage.setItem(`${KEY_DONE_PREFIX}${role}`, 'false');
}

/**
 * Tour khud se chale ya nahi?
 * - Tutorial enabled hona chahiye
 * - Autostart on hona chahiye
 * - Aur is role ka tour pehle mukammal NAHI hona chahiye
 */
export function shouldAutoStartTour(role: string): boolean {
  const prefs = getTutorialPrefs();
  if (!prefs.enabled || !prefs.autostart) return false;
  return !isTourCompleted(role);
}

/**
 * Animations globally band/chalu karta hai.
 * `.reduce-motion` rules `src/styles/base.css` mein hain, is liye React ke
 * bahar (documentElement par) class lagana hi kaafi hai.
 */
export function applyReduceMotion(on: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('reduce-motion', on);
}

/** App start par ek dafa chalana — saved preference ko apply karta hai. */
export function initMotionPreference(): void {
  applyReduceMotion(getTutorialPrefs().reduceMotion);
}

/* ─────────────── Tour ke liye window-event bus ───────────────
   Theme toggle (acadamis_toggle_theme) ki tarah hi simple pattern hai,
   taake sidebar/settings kisi bhi jagah se tour start kar sakein. */

export const TOUR_START_EVENT = 'acadamis_start_tour';
export const HELP_OPEN_EVENT = 'acadamis_open_help';

export function requestTour(): void {
  window.dispatchEvent(new Event(TOUR_START_EVENT));
}

export function requestHelp(): void {
  window.dispatchEvent(new Event(HELP_OPEN_EVENT));
}
