/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LANGUAGE TOGGLE — chhota EN | اردو pill
 * ═══════════════════════════════════════════════════════════════════════════
 * Sidebars, settings aur login screen par use hota hai. Click par poora app
 * foran doosri zaban mein badal jata hai (useLang() store ke through).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Languages } from 'lucide-react';
import { useLang, type Lang } from '../lib/i18n';

interface LanguageToggleProps {
  /** Dark/surface par use ho to ring halki rakhein. */
  className?: string;
}

const OPTIONS: Array<{ id: Lang; label: string }> = [
  { id: 'en', label: 'EN' },
  { id: 'ur', label: 'اردو' },
];

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const [lang, setLang] = useLang();

  return (
    <div
      role="group"
      aria-label="Language / زبان"
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 p-0.5 shadow-[var(--shadow-elev-1)] ${className}`}
    >
      <Languages size={13} className="ml-1.5 text-ink-faint" aria-hidden="true" />
      {OPTIONS.map((opt) => {
        const isActive = lang === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLang(opt.id)}
            aria-pressed={isActive}
            title={opt.id === 'en' ? 'English' : 'اردو'}
            className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              isActive
                ? 'text-white shadow-md'
                : 'text-ink-muted hover:text-ink'
            }`}
            style={
              opt.id === 'ur'
                ? {
                    fontFamily: 'var(--font-urdu-display)',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    fontSize: '12px',
                    ...(isActive
                      ? { backgroundImage: 'linear-gradient(120deg, #6366f1, #a855f7)' }
                      : {}),
                  }
                : isActive
                  ? { backgroundImage: 'linear-gradient(120deg, #6366f1, #a855f7)' }
                  : undefined
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
