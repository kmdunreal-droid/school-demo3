/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOUR OVERLAY — guided tour (spotlight + tooltip)
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 *   • Spotlight — target element ke siva sab kuch dhundla ho jata hai
 *   • Smart placement — jagah na ho to card khud doosri taraf chala jata hai
 *   • Mobile-safe — off-screen target chhod kar visible match par jata hai;
 *     kuch bhi na mile to center card ban jata hai
 *   • Keyboard — Esc band, →/Enter agla, ←/Back pichhla
 *   • `reduce-motion` preference respect karta hai
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Rocket, X } from 'lucide-react';
import { getTourSteps, type TourStep } from '../lib/onboardingSteps';
import { getTutorialPrefs, markTourCompleted } from '../lib/tutorialPrefs';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourOverlayProps {
  role: string;
  open: boolean;
  onClose: () => void;
}

const PAD = 8;
const GAP = 14;
const MARGIN = 12;

const clamp = (min: number, v: number, max: number) =>
  Math.min(Math.max(v, min), Math.max(min, max));

/**
 * Selector ke saare matches mein se woh chuno jo user ko WAQAI nazar aa raha hai.
 * Isi wajah se tour mobile (bottom nav) aur desktop (sidebar) dono par chalta hai.
 */
function pickVisibleTarget(selector: string): HTMLElement | null {
  let nodes: HTMLElement[] = [];
  try {
    nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  } catch {
    return null;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (r.bottom < 0 || r.top > vh) continue;

    // Sirf tab "visible" maano jab kaafi hissa screen ke andar ho — warna
    // off-screen sidebar (mobile par -translate-x-full) pakra jata.
    const visibleW = Math.min(r.right, vw) - Math.max(r.left, 0);
    if (visibleW < Math.min(r.width, 220) * 0.5) continue;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

    return el;
  }
  return null;
}

export default function TourOverlay({ role, open, onClose }: TourOverlayProps) {
  const steps = useMemo<TourStep[]>(() => getTourSteps(role), [role]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: 1024, h: 768 });
  const [cardSize, setCardSize] = useState({ w: 340, h: 210 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useRef(false);

  const step = steps[Math.min(index, steps.length - 1)];

  /* Tour shuru hone par index reset */
  useEffect(() => {
    if (open) {
      setIndex(0);
      reduceMotion.current = getTutorialPrefs().reduceMotion;
    }
  }, [open, role]);

  /* Viewport size track karo */
  useEffect(() => {
    if (!open) return;
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  /* Target dhoondo → zaroorat ho to scroll karo → rect measure karo */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const behavior: ScrollBehavior = reduceMotion.current ? 'auto' : 'smooth';

    const measure = () => {
      if (cancelled) return;
      if (!step?.target) {
        setRect(null);
        return;
      }
      const el = pickVisibleTarget(step.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const el = step?.target ? pickVisibleTarget(step.target) : null;
    if (el) {
      const r = el.getBoundingClientRect();
      const offScreen = r.top < 70 || r.bottom > window.innerHeight - 70;
      if (offScreen) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior });
    }

    const delay = reduceMotion.current ? 20 : 340;
    const t1 = window.setTimeout(measure, delay);
    const t2 = window.setTimeout(measure, delay * 2);

    const onScrollOrResize = () => measure();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, step]);

  /* Card ka actual size naapo (taake placement sahi ho) */
  useEffect(() => {
    if (!open) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    setCardSize((prev) =>
      Math.abs(prev.w - r.width) < 2 && Math.abs(prev.h - r.height) < 2
        ? prev
        : { w: r.width, h: r.height }
    );
  }, [open, index, rect]);

  const finish = useCallback(() => {
    markTourCompleted(role);
    onClose();
  }, [role, onClose]);

  const next = useCallback(() => {
    if (index >= steps.length - 1) finish();
    else setIndex((i) => i + 1);
  }, [index, steps.length, finish]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  /* Keyboard controls */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, next, back, finish]);

  /* Tooltip ki position — smart placement + viewport clamp */
  const pos = useMemo(() => {
    const cw = cardSize.w;
    const ch = cardSize.h;
    const vw = vp.w;
    const vh = vp.h;

    if (!rect) {
      return {
        left: clamp(MARGIN, (vw - cw) / 2, vw - cw - MARGIN),
        top: clamp(MARGIN, (vh - ch) / 2 - 16, vh - ch - MARGIN),
      };
    }

    const want = step?.placement && step.placement !== 'auto' ? step.placement : 'bottom';
    const spaceTop = rect.top;
    const spaceBottom = vh - (rect.top + rect.height);
    const spaceLeft = rect.left;
    const spaceRight = vw - (rect.left + rect.width);
    const enough = (space: number, size: number) => space > size + GAP + MARGIN;

    let place = want;
    if (place === 'bottom' && !enough(spaceBottom, ch) && enough(spaceTop, ch)) place = 'top';
    else if (place === 'top' && !enough(spaceTop, ch) && enough(spaceBottom, ch)) place = 'bottom';
    else if (place === 'right' && !enough(spaceRight, cw) && enough(spaceLeft, cw)) place = 'left';
    else if (place === 'left' && !enough(spaceLeft, cw) && enough(spaceRight, cw)) place = 'right';

    let left: number;
    let top: number;
    if (place === 'top') {
      top = rect.top - ch - GAP;
      left = rect.left + rect.width / 2 - cw / 2;
    } else if (place === 'left') {
      left = rect.left - cw - GAP;
      top = rect.top + rect.height / 2 - ch / 2;
    } else if (place === 'right') {
      left = rect.left + rect.width + GAP;
      top = rect.top + rect.height / 2 - ch / 2;
    } else {
      top = rect.top + rect.height + GAP;
      left = rect.left + rect.width / 2 - cw / 2;
    }

    return {
      left: clamp(MARGIN, left, vw - cw - MARGIN),
      top: clamp(MARGIN, top, vh - ch - MARGIN),
    };
  }, [rect, cardSize, vp, step]);

  if (!open || !step) return null;

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const progress = Math.round(((index + 1) / steps.length) * 100);

  return (
    <>
      {/* Click blocker — tour ke doran page par ghalti se click na ho */}
      <div
        className="fixed inset-0 print:hidden"
        style={{ zIndex: 9990 }}
        aria-hidden="true"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Spotlight — target ke siva sab dhundla */}
      {rect ? (
        <div
          style={{
            position: 'fixed',
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 16,
            boxShadow:
              '0 0 0 9999px rgb(7 11 20 / 0.68), 0 0 0 2px var(--color-brand-400), 0 0 30px 8px rgb(99 102 241 / 0.45)',
            zIndex: 9991,
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      ) : (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9991, background: 'rgb(7 11 20 / 0.68)', pointerEvents: 'none' }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        tabIndex={-1}
        className="animate-scale-in print:hidden"
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          width: 340,
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 9992,
        }}
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-elev-4">
          {/* Progress bar */}
          <div className="h-1 w-full bg-surface-3">
            <div
              className="h-full rounded-r-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundImage:
                  'linear-gradient(90deg, var(--color-brand-500), var(--color-brand-400))',
              }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              <Rocket size={12} /> Guide · {index + 1}/{steps.length}
            </span>
            <button
              type="button"
              onClick={finish}
              className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-surface-3 hover:text-ink"
              aria-label="Tour band karein"
              title="Band karein (Esc)"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-2 px-4 py-4">
            <h3 className="font-display text-sm font-extrabold leading-snug tracking-tight text-ink">
              {step.title}
            </h3>
            <p className="text-xs leading-relaxed text-ink-muted">{step.body}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
            <button
              type="button"
              onClick={finish}
              className="text-[10px] font-black uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-ink"
            >
              {isLast ? 'Band karein' : 'Skip'}
            </button>

            <div className="flex items-center gap-1.5">
              {steps.map((s, i) => (
                <span
                  key={s.id}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 16 : 6,
                    backgroundColor:
                      i === index ? 'var(--color-brand-500)' : 'var(--color-line-strong)',
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {!isFirst && (
                <button
                  type="button"
                  onClick={back}
                  className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
                  title="Pichhla (←)"
                >
                  <ArrowLeft size={11} /> Back
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="btn btn-primary btn-sm"
                title={isLast ? 'Tour mukammal' : 'Agla (→)'}
              >
                {isLast ? (
                  <>
                    <Check size={12} /> Done
                  </>
                ) : (
                  <>
                    Next <ArrowRight size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
