/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANGUAGE CARD — Settings tabs ke liye bara, wazeh card
 * ═══════════════════════════════════════════════════════════════════════════
 * Do bade option buttons (English / اردو) + live preview line. Urdu option
 * Nastaliq display font mein dikhta hai taake user ko pehle se pata chale
 * app kaisi dikhegi.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Check, Languages } from 'lucide-react';
import { t, useLang, i18nCls, type Lang } from '../lib/i18n';

const OPTIONS: Array<{ id: Lang; title: string; sub: string }> = [
  { id: 'en', title: 'English', sub: 'English (default)' },
  { id: 'ur', title: 'اردو', sub: 'اردو (نستعلیق)' },
];

export default function LanguageCard() {
  const [lang, setLang] = useLang();
  const cls = i18nCls(lang);

  return (
    <section className="card card-acc-violet p-5 sm:p-6" aria-label="Language settings">
      <div className="card-head">
        <div className="flex items-center gap-3">
          <span className="stat-icon stat-icon-violet" aria-hidden="true">
            <Languages size={17} />
          </span>
          <div>
            <h2 className={`card-title title-vib ${cls}`}>{t('settings.language')}</h2>
            <p className={`card-sub ${cls}`}>{t('settings.languageDesc')}</p>
          </div>
        </div>
        <span className="badge badge-brand">
          <Languages size={11} /> EN / اردو
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const isActive = lang === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLang(opt.id)}
              aria-pressed={isActive}
              className={`flex items-center justify-between gap-3 rounded-[var(--radius-control)] border p-4 text-left transition-all hover:-translate-y-0.5 ${
                isActive
                  ? 'border-transparent text-white shadow-lg'
                  : 'border-line bg-surface-2 hover:border-line-strong'
              }`}
              style={
                isActive
                  ? { backgroundImage: 'linear-gradient(120deg, #4f46e5, #7c3aed 60%, #c026d3)' }
                  : undefined
              }
            >
              <span>
                <span
                  className={`block text-base font-extrabold ${
                    opt.id === 'ur' || lang === 'ur' ? 'i18n-ur-display' : ''
                  }`}
                >
                  {opt.title}
                </span>
                <span
                  className={`block text-[10px] font-bold uppercase tracking-widest opacity-80 ${
                    opt.id === 'ur' ? 'i18n-ur-display' : ''
                  }`}
                >
                  {opt.sub}
                </span>
              </span>
              <span
                className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 transition-all ${
                  isActive ? 'border-white bg-white/25' : 'border-line-strong'
                }`}
                aria-hidden="true"
              >
                {isActive && <Check size={14} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live preview — Urdu par naya font foran dikhta hai */}
      <p className={`mt-4 text-xs text-ink-muted ${cls}`}>
        {lang === 'ur'
          ? 'نمونہ: حاضری 96% • فیس جمع • کوئی اطلاع نہیں'
          : 'Preview: Attendance 96% • Fees paid • No new notices'}
      </p>
    </section>
  );
}
