/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HELP CENTER — madad, guide aur tutorial settings
 * ═══════════════════════════════════════════════════════════════════════════
 * Har role ke floating ❓ button se khulta hai. Is mein:
 *   • Searchable sawal-jawab (role ke hisaab se filter)
 *   • "Guide dobara chalayein" button
 *   • Tutorial + animation settings (student ke paas Settings tab nahi hai,
 *     is liye yeh control yahan bhi dena zaroori tha)
 *   • Keyboard shortcuts
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Pin,
  Rocket,
  Search,
  X,
} from 'lucide-react';
import { getNavItems, ROLE_LABELS } from '../lib/navConfig';
import {
  getTutorialPrefs,
  requestTour,
  setTutorialPrefs,
  type TutorialPrefs,
} from '../lib/tutorialPrefs';
import { clearFavorites, getFavorites } from '../lib/favorites';

interface HelpCenterProps {
  role: string;
  open: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

interface HelpTopic {
  q: string;
  a: string;
  roles: string[];
  tags: string;
}

const ALL = ['principal', 'coordinator', 'teacher', 'student', 'developer'];

const HELP_TOPICS: HelpTopic[] = [
  {
    q: 'Kisi feature tak tez pohnchne ka tareeqa?',
    a: 'Keyboard par Ctrl + K (Mac par Cmd + K) dabayein — search box khul jayega. Likhein "fee", "attendance" ya kisi student ka naam — app seedha usi jagah le jaye gi.',
    roles: ALL,
    tags: 'search command palette ctrl k tez jaldi dhoondna navigate',
  },
  {
    q: 'Roz jo kaam karta hoon woh samne kaise rahe?',
    a: 'Dashboard par "Aaj ka Kaam" panel app khud banati hai. Iske ilawa sidebar mein kisi feature par 📌 pin karein — woh Dashboard ke "Favourites" mein sab se upar aa jayega.',
    roles: ALL,
    tags: 'pin favourite aaj ka kaam dashboard rozana',
  },
  {
    q: 'Yeh guide (tour) dobara kaise dekhein?',
    a: 'Yahan Help Center mein "Guide dobara chalayein" par click karein. Settings mein "Show guided tour" ON hona zaroori hai.',
    roles: ALL,
    tags: 'tour guide tutorial dobara replay help madad',
  },
  {
    q: 'Tour har login par khud chalta hai — band kaise karein?',
    a: 'Settings (ya is Help Center) mein "Show guided tour on login" ko OFF kar dein. Tour feature bilkul band ho jayega.',
    roles: ALL,
    tags: 'tour band disable off setting login autostart',
  },
  {
    q: 'Animations tez lagti hain — slow kaise karein?',
    a: '"Reduce animations" ON kar dein. Saari animations aur smooth scrolling kam ho jayen gi — purane mobile par app tez chalegi.',
    roles: ALL,
    tags: 'animation motion slow reduce accessible tez',
  },
  {
    q: 'Dark mode kahan se badlein?',
    a: 'Top bar par ☀️ / 🌙 button se. Aap ki pasand save ho jati hai, is liye agli baar app usi theme mein khulegi.',
    roles: ALL,
    tags: 'dark light theme night mode rang',
  },
  {
    q: 'Naya student ya teacher kaise add karein?',
    a: 'Sidebar → People & Setup → "Students" ya "Teachers" tab → "+ Naya" button. Wahin se edit aur delete bhi ho jata hai.',
    roles: ['principal', 'coordinator', 'developer'],
    tags: 'add student teacher naya admission class banana',
  },
  {
    q: 'Fee collect karne ka tareeqa?',
    a: 'Dashboard → "Fee Collect Karein" (ya Tools → Fee Center). Student chunein, amount daalein — receipt khud ban jati hai aur WhatsApp par bheji ja sakti hai.',
    roles: ['principal', 'coordinator', 'developer'],
    tags: 'fee collect payment receipt paisa jama',
  },
  {
    q: 'Fee pending hai ya nahi — kaise pata chale?',
    a: 'Dashboard par "Fee Pending" tile dekhein. Tafseel ke liye uspar click karein — Fee Center khul jayega jahan har student ka mahina-war hisab hai.',
    roles: ['principal', 'coordinator', 'developer'],
    tags: 'pending dues bakaya baqi fee report',
  },
  {
    q: 'Teacher ki tankha (salary) kaise calculate hoti hai?',
    a: 'Har teacher ki hazri se khud-ba-khud: Base + (Present × Bonus) + Allowances − (Late × Deduction) − (Absent × Deduction) − Fixed. Staff Salaries tab mein mahine ka hisab aur payslip print milti hai.',
    roles: ['principal', 'coordinator', 'developer'],
    tags: 'salary tankha payslip teacher pay deductions bonus',
  },
  {
    q: 'Absent students ke parents ko message kaise bhejein?',
    a: 'Take Attendance mein absent mark karein — neeche "WhatsApp All" button aa jata hai. Har absent student ke parent ko template message chala jata hai.',
    roles: ['teacher', 'principal', 'coordinator', 'developer'],
    tags: 'whatsapp absent message parent sms bhejna',
  },
  {
    q: 'Naya student ki hazri lagane ka tareeqa?',
    a: 'Sidebar → Take Attendance. Class aur date chunein — aaj ki roster khul jayegi. Har student par Present/Absent/Late/Leave dabayein aur Save kar dein.',
    roles: ['teacher'],
    tags: 'attendance lagana hazri roll call period class',
  },
  {
    q: 'Apni (teacher) hazri GPS se kaise lagayein?',
    a: 'Sidebar → My Check-In. Phone ka location on karein aur "Check In" dabayein. Hazri sirf tab lagti hai jab aap school ke radius ke andar hon.',
    roles: ['teacher'],
    tags: 'teacher attendance gps check in location hazri',
  },
  {
    q: 'AI se exam paper kaise banayein?',
    a: 'Sidebar → AI Paper Maker. Subject, class aur questions ke marks chunein → "Generate" dabayein. Paper taiyar ho kar print ke liye aa jayega.',
    roles: ['teacher', 'principal', 'coordinator', 'developer'],
    tags: 'ai paper exam generator question banayein',
  },
  {
    q: 'Meri hazri kitni hai / percentage kya hai?',
    a: 'Sidebar → My Attendance par percentage aur mahina-war record dono hain. 75% se kam ho to app khud warning dikhati hai.',
    roles: ['student'],
    tags: 'attendance percentage hazri kitni mere',
  },
  {
    q: 'Result card ya marks kaise dekhein?',
    a: 'Sidebar → My Marks. Subject chunein — numbers, grade aur percentage dikh jayenge. Print/PDF ka button bhi wahin hai.',
    roles: ['student', 'teacher', 'principal', 'coordinator', 'developer'],
    tags: 'result marks grades numbers report card print',
  },
  {
    q: 'Meri fee ki haalat kya hai?',
    a: 'Sidebar → Fees. Wahan har mahine ki fee, jama shuda raqam aur baqi amount saaf likhi hoti hai.',
    roles: ['student'],
    tags: 'fee dues bayan baqi paisa jama',
  },
  {
    q: 'Hard copy kaise print karein (PDF banane ke liye)?',
    a: 'Jis bhi report par "Print" ka icon ho, uspar click karein — browser ka print window khulega. Wahan "Save as PDF" chunein to PDF ban jayegi.',
    roles: ALL,
    tags: 'print pdf save report certificate payslip nikalna',
  },
  {
    q: 'Ek device ka data doosre device par kaise jayega?',
    a: 'App offline-first hai. Internet hone par changes background mein cloud par chale jate hain aur doosre device par khud aa jate hain. Principal ke Settings mein "Force Sync" se foran bhej bhi sakte hain.',
    roles: ALL,
    tags: 'sync cloud device data doosra mobile save',
  },
  {
    q: 'App ko mobile par install kaise karein?',
    a: 'Sidebar mein "Install App" par click karein. Android/Chrome par "Install" ka prompt aayega; iPhone (Safari) par Share menu → "Add to Home Screen" chunein.',
    roles: ALL,
    tags: 'install pwa app mobile home screen add',
  },
];

export default function HelpCenter({ role, open, onClose, onStartTour }: HelpCenterProps) {
  const [query, setQuery] = useState('');
  const [prefs, setPrefs] = useState<TutorialPrefs>(() => getTutorialPrefs());
  const [pins, setPins] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setPrefs(getTutorialPrefs());
      setPins(getFavorites(role));
      setQuery('');
    }
  }, [open, role]);

  const navItems = useMemo(() => getNavItems(role), [role]);

  const visibleTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HELP_TOPICS.filter((t) => t.roles.includes(role)).filter((t) => {
      if (!q) return true;
      return t.q.toLowerCase().includes(q) || t.tags.includes(q) || t.a.toLowerCase().includes(q);
    });
  }, [query, role]);

  const updatePref = (patch: Partial<TutorialPrefs>) => {
    setPrefs(setTutorialPrefs(patch));
  };

  const startTour = () => {
    onClose();
    if (onStartTour) onStartTour();
    else requestTour();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pinLabels = pins
    .map((id) => navItems.find((n) => n.id === id)?.label)
    .filter(Boolean) as string[];

  return (
    <div className="modal-backdrop print:hidden" onClick={onClose}>
      <div
        className="modal-shell max-w-3xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Madad Markaz"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line bg-surface-2 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="stat-icon" aria-hidden="true">
              <Search size={16} />
            </span>
            <div>
              <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-ink">
                Madad Markaz
              </h2>
              <p className="text-[11px] text-ink-muted">
                {ROLE_LABELS[role] ?? role} portal · sawal ka jawab aur guide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Band karein"
            title="Band karein (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[68vh] space-y-5 overflow-y-auto px-5 py-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              className="input pl-9"
              placeholder="Sawal likhein — jaise 'fee', 'tour', 'print', 'attendance'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Madad dhoondein"
            />
          </div>

          {/* Quick actions */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={startTour}
              disabled={!prefs.enabled}
              className="card card-hover flex items-start gap-3 p-4 text-left disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="stat-icon shrink-0">
                <Rocket size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-ink">
                  Guide dobara chalayein
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-ink-muted">
                  Poori app ka step-by-step tour
                  {!prefs.enabled ? ' — pehle guide ko ON karein' : ''}
                </span>
              </span>
            </button>

            <div className="card flex items-start gap-3 p-4">
              <span className="stat-icon stat-icon-accent shrink-0">
                <Pin size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-ink">
                  Aap ke pinned features
                </p>
                {pinLabels.length > 0 ? (
                  <>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {pinLabels.map((l) => (
                        <span key={l} className="badge badge-accent">
                          {l}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearFavorites(role);
                        setPins([]);
                      }}
                      className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint hover:text-danger-600"
                    >
                      Sab hatayein
                    </button>
                  </>
                ) : (
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                    Abhi kuch pin nahi kiya. Sidebar mein kisi feature par 📌 dabayein — woh Dashboard par sab se upar aa jayega.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Guide + display settings */}
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Guide aur Display Settings</h3>
            </div>
            <div className="space-y-2.5">
              <HelpToggle
                label="Show guided tour"
                hint="Yeh master switch hai — OFF karne par tour aur ❓ button dono chhup jate hain."
                checked={prefs.enabled}
                onChange={(v) => updatePref({ enabled: v })}
              />
              <HelpToggle
                label="Tour khud shuru ho (login ke baad)"
                hint="Pehli baar login karne wale ko tour khud dikhe."
                checked={prefs.autostart}
                onChange={(v) => updatePref({ autostart: v })}
                disabled={!prefs.enabled}
              />
              <HelpToggle
                label="Reduce animations"
                hint="Animations aur smooth scroll kam — purane device par app tez chalti hai."
                checked={prefs.reduceMotion}
                onChange={(v) => updatePref({ reduceMotion: v })}
              />
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="card-title">Sawal aur Jawab</h3>
              <span className="badge badge-muted">{visibleTopics.length} natije</span>
            </div>

            {visibleTopics.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <Search size={20} />
                </span>
                <span className="empty-title">Kuch nahi mila</span>
                <span className="empty-text">
                  Ye lafz match nahi hua. Koi doosra lafz try karein — jaise "fee", "print",
                  "attendance" ya "sync".
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleTopics.map((t) => (
                  <details key={t.q} className="card overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 text-[12px] font-bold text-ink">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {t.q}
                    </summary>
                    <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
                      {t.a}
                    </p>
                  </details>
                ))}
              </div>
            )}
          </div>

          {/* Keyboard shortcuts */}
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title flex items-center gap-1.5">
                <Keyboard size={13} /> Keyboard Shortcuts
              </h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ShortcutRow keys="Ctrl + K" desc="Kuch bhi dhoondein / feature par jayein" />
              <ShortcutRow keys="Esc" desc="Popup ya guide band karein" />
              <ShortcutRow keys="→ ya Enter" desc="Guide mein agla step" />
              <ShortcutRow keys="←" desc="Guide mein pichhla step" />
            </div>
          </div>

          <p className="pb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">
            Demo School · Digital Management System
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Chhote helpers (sirf is file ke liye) ───────── */

function HelpToggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-control border border-line bg-surface-2 p-3 text-left transition-colors hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className="mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors"
        style={{ backgroundColor: checked ? 'var(--color-brand-600)' : 'var(--color-line-strong)' }}
        aria-hidden="true"
      >
        <span
          className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-ink">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-muted">{hint}</span>
      </span>
    </button>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-control border border-line bg-surface-2 px-3 py-2">
      <kbd className="rounded-md border border-line-strong bg-surface px-2 py-1 font-mono text-[10px] font-bold text-ink-2">
        {keys}
      </kbd>
      <span className="text-right text-[11px] text-ink-muted">{desc}</span>
    </div>
  );
}
