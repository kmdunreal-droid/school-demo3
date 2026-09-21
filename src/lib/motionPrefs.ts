/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOTION PREFS — animations ka accessibility switch
 * ═══════════════════════════════════════════════════════════════════════════
 * Purane tutorialPrefs se sirf reduce-motion hissa bachaya gaya hai (tour
 * system remove ho gaya). localStorage key wohi hai: `acadamis_reduce_motion`
 * `.reduce-motion` CSS rules `src/styles/base.css` mein hain.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { safeStorage } from './safeStorage';

const KEY_REDUCE_MOTION = 'acadamis_reduce_motion';

export function getReduceMotion(): boolean {
  return safeStorage.getItem(KEY_REDUCE_MOTION) === 'true';
}

/** Animations globally band/chalu karta hai (documentElement par class). */
export function applyReduceMotion(on: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('reduce-motion', on);
}

export function setReduceMotion(on: boolean): void {
  safeStorage.setItem(KEY_REDUCE_MOTION, String(on));
  applyReduceMotion(on);
}

/** App start par ek dafa chalana — saved preference ko apply karta hai. */
export function initMotionPreference(): void {
  applyReduceMotion(getReduceMotion());
}
