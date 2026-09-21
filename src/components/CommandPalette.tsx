/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMMAND PALETTE — Ctrl + K
 * ═══════════════════════════════════════════════════════════════════════════
 * App mein 20+ screens hain. Yeh "kuch bhi dhoondein" wala box hai — user
 * feature ka naam, student ka naam ya class likhta hai aur seedha wahan
 * pohnch jata hai. Isi wajah se menu yaad rakhne ki zaroorat nahi rehti.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CreditCard,
  LayoutGrid,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { L, t, useLang } from '../lib/i18n';
import { getNavItems, navHint, navLabel, type NavItem } from '../lib/navConfig';
import type { Class, Student, Teacher } from '../types';

interface CommandPaletteProps {
  role: string;
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
}

interface Dest {
  key: string;
  label: string;
  hint: string;
  group: string;
  keywords: string;
  icon: NavItem['icon'];
  run: () => void;
}

const MAX_PER_SECTION = 5;

/** Feature rows (nav + extra shortcuts) — students/teachers/classes alag hain. */
const isFeatureRow = (d: { key: string }) => d.key.startsWith('nav-') || d.key.startsWith('extra-');

export default function CommandPalette({
  role,
  open,
  onClose,
  onNavigate,
  students,
  teachers,
  classes,
}: CommandPaletteProps) {
  const [lang] = useLang();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const canSeeStudents = ['principal', 'coordinator', 'developer', 'teacher'].includes(role);
  const canSeeTeachers = ['principal', 'coordinator', 'developer'].includes(role);
  const studentTab = role === 'teacher' ? 'students' : 'management_hub';

  const destinations = useMemo<Dest[]>(() => {
    const nav = getNavItems(role);
    const list: Dest[] = nav.map((item) => ({
      key: `nav-${item.id}`,
      label: navLabel(item, role, lang),
      hint: navHint(item, role, lang),
      group: t('palette.features'),
      keywords: `${item.id} ${navLabel(item, role, 'en')} ${navLabel(item, role, 'ur')} ${navHint(item, role, 'en')} ${navHint(item, role, 'ur')}`.toLowerCase(),
      icon: item.icon,
      run: () => onNavigate(item.id),
    }));

    // Principal ke liye feature se bhi seedhe raste (jo sidebar mein hub ke andar hain)
    if (canSeeTeachers) {
      list.push(
        {
          key: 'extra-fee-center',
          label: L('Fee Center', 'فیس سینٹر'),
          hint: L('Collect fees, review dues and print receipts', 'فیس وصول کریں، باقی رقم دیکھیں اور رسید بنائیں'),
          group: t('palette.features'),
          keywords: 'fee center collect receipt dues payment paisa fees',
          icon: CreditCard,
          run: () => onNavigate('fees'),
        },
        {
          key: 'extra-new-student',
          label: L('Add New Student', 'نیا طالب علم شامل کریں'),
          hint: L('Admission — People & Setup → Students', 'داخلہ — لوگ و سیٹ اپ → طلبہ'),
          group: t('palette.features'),
          keywords: 'add student naya admission form darj enroll',
          icon: UserPlus,
          run: () => onNavigate('management_hub'),
        },
        {
          key: 'extra-new-teacher',
          label: L('Add New Teacher', 'نیا استاد شامل کریں'),
          hint: L('Add faculty — People & Setup → Teachers', 'استاد شامل کریں — لوگ و سیٹ اپ → اساتذہ'),
          group: t('palette.features'),
          keywords: 'add teacher naya faculty staff',
          icon: UserPlus,
          run: () => onNavigate('management_hub'),
        },
        {
          key: 'extra-tools',
          label: L('Tools (Notices, Calendar, Certificates, AI Paper)', 'ٹولز (اعلانات، کیلنڈر، سرٹیفکیٹ، AI پرچہ)'),
          hint: L('All supporting features in one place', 'تمام معاون فیچرز ایک جگہ'),
          group: t('palette.features'),
          keywords: 'tools notices calendar certificate ai paper alerts settings',
          icon: LayoutGrid,
          run: () => onNavigate('features_hub'),
        }
      );
    }

    if (canSeeStudents) {
      students.slice(0, 400).forEach((s) => {
        const cls = classes.find((c) => c.id === s.classId);
        const clsLabel = cls
          ? `${cls.className}${cls.section ? ` - ${cls.section}` : ''}`
          : L('Class N/A', 'کلاس معلوم نہیں');
        list.push({
          key: `student-${s.id}`,
          label: s.name,
          hint: `${clsLabel} · ${L('Roll', 'رول')} ${s.rollNumber}`,
          group: t('palette.students'),
          keywords: `${s.name} ${s.rollNumber} ${clsLabel} ${s.username ?? ''} student`.toLowerCase(),
          icon: Users,
          run: () => onNavigate(studentTab),
        });
      });
    }

    if (canSeeTeachers) {
      teachers.forEach((tc) => {
        list.push({
          key: `teacher-${tc.id}`,
          label: tc.name,
          hint: `${tc.subject} · ${tc.email || L('email N/A', 'ای میل معلوم نہیں')}`,
          group: t('palette.teachers'),
          keywords: `${tc.name} ${tc.subject} ${tc.username ?? ''} teacher faculty`.toLowerCase(),
          icon: Users,
          run: () => onNavigate('management_hub'),
        });
      });

      classes.forEach((c) => {
        const clsLabel = `${c.className}${c.section ? ` - ${c.section}` : ''}`;
        list.push({
          key: `class-${c.id}`,
          label: clsLabel,
          hint: `${t('common.class')} · ${c.subjects?.length ?? 0} ${L('subjects', 'مضامین')}`,
          group: t('palette.classes'),
          keywords: `${clsLabel} class section grade`.toLowerCase(),
          icon: LayoutGrid,
          run: () => onNavigate('management_hub'),
        });
      });
    }

    return list;
  }, [role, students, teachers, classes, onNavigate, canSeeStudents, canSeeTeachers, studentTab, lang]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Khaali query par sirf features — warna 400 students ki list bhar jati
      return destinations.filter(isFeatureRow);
    }

    const scored = destinations
      .filter((d) => d.keywords.includes(q))
      .sort((a, b) => {
        const aStart = a.label.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.label.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStart !== bStart) return aStart - bStart;
        return isFeatureRow(a) ? -1 : 1;
      });

    // Har section se max MAX_PER_SECTION, taake ek hi qism list na bhar de
    const counts: Record<string, number> = {};
    return scored.filter((d) => {
      counts[d.group] = (counts[d.group] ?? 0) + 1;
      return counts[d.group] <= MAX_PER_SECTION;
    });
  }, [destinations, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  /* Keyboard controls */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const picked = results[active];
        if (picked) {
          onClose();
          picked.run();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, active, onClose]);

  /* Active row ko nazar mein rakho */
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-row="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  if (!open) return null;

  const groups = Array.from(new Set(results.map((r) => r.group)));

  let rowIndex = -1;

  return (
    <div
      className="modal-backdrop print:hidden"
      style={{ alignItems: 'flex-start', paddingTop: '8vh' }}
      onClick={onClose}
    >
      <div
        className="modal-shell max-w-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={t('common.search')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search row */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={17} className="shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-faint"
            placeholder={t('palette.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('common.search')}
          />
          <kbd className="rounded-md border border-line-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-muted">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[12px] font-extrabold text-ink">{t('palette.noResultsFor', { q: query })}</p>
              <p className="mt-1 text-[11px] text-ink-muted">
                {t('palette.tryAnother')}
              </p>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g}>
                <p className="px-4 pb-1 pt-3 text-[9px] font-black uppercase tracking-[0.22em] text-ink-faint">
                  {g}
                </p>
                {results
                  .filter((r) => r.group === g)
                  .map((d) => {
                    rowIndex += 1;
                    const idx = rowIndex;
                    const Icon = d.icon;
                    const isActive = idx === active;
                    return (
                      <button
                        key={d.key}
                        data-row={idx}
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => {
                          onClose();
                          d.run();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{
                          backgroundColor: isActive ? 'var(--color-surface-3)' : 'transparent',
                          boxShadow: isActive
                            ? 'inset 3px 0 0 0 var(--color-brand-500)'
                            : 'none',
                        }}
                      >
                        <Icon size={15} className="shrink-0 text-ink-faint" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-bold text-ink">
                            {d.label}
                          </span>
                          <span className="block truncate text-[10px] text-ink-muted">
                            {d.hint}
                          </span>
                        </span>
                        {isActive && (
                          <span className="badge badge-brand shrink-0">Enter</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
          <span>↑ ↓ chalne ke liye · Enter kholein · Esc band</span>
          <span>{results.length} natije</span>
        </div>
      </div>
    </div>
  );
}
