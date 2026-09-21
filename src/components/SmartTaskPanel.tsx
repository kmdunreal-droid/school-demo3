/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SMART TASK PANEL — "AAJ KA KAAM"
 * ═══════════════════════════════════════════════════════════════════════════
 * Dashboard ka sab se ahem hissa. Yeh panel app ke apne data se banaye gaye
 * tasks dikhata hai, taake user ko khud na dhoondna pare ke aaj kya karna hai.
 *
 * Tasks `src/lib/smartActions.ts` banati hai — yeh component sirf dikhata hai
 * aur "Karo →" par sahi tab par le jata hai.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { L, t } from '../lib/i18n';
import React, { useState } from 'react';
import {
  Award,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  ListChecks,
  MapPin,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import { TONE_STYLES, type SmartTask, type TaskIconKey } from '../lib/smartActions';

interface SmartTaskPanelProps {
  tasks: SmartTask[];
  onNavigate: (tab: string) => void;
  /** Shuru mein kitne tasks dikhein. */
  defaultVisible?: number;
}

const ICONS: Record<TaskIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  attendance: ListChecks,
  fee: CreditCard,
  checkin: MapPin,
  event: CalendarDays,
  assignment: ClipboardList,
  marks: Award,
  notice: BellRing,
  celebrate: PartyPopper,
};

export default function SmartTaskPanel({
  tasks,
  onNavigate,
  defaultVisible = 3,
}: SmartTaskPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const isAllClear = tasks.length === 1 && tasks[0].id === 'all-clear';
  const visible = expanded ? tasks : tasks.slice(0, defaultVisible);
  const hidden = Math.max(0, tasks.length - defaultVisible);

  return (
    <section
      data-tour="today-tasks"
      className={`card p-0 ${isAllClear ? '' : 'ring-1 ring-brand-500/10'}`}
      aria-label={t('smart.title')}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="stat-icon" aria-hidden="true">
            {isAllClear ? <PartyPopper size={16} /> : <Sparkles size={16} />}
          </span>
          <div>
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink">
              {t('smart.title')}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
              {isAllClear
                ? t('smart.allClearSub')
                : `${tasks.length} ${t('smart.waiting')}`}
            </p>
          </div>
        </div>

        {!isAllClear && (
          <span className="badge badge-brand">
            <ListChecks size={11} /> {tasks.length} {t('smart.pendingBadge')}
          </span>
        )}
      </div>

      {/* Tasks */}
      <ul className="divide-y divide-line">
        {visible.map((task) => {
          const Icon = ICONS[task.icon] ?? Sparkles;
          const tone = TONE_STYLES[task.tone];
          return (
            <li
              key={task.id}
              className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: tone.dot }}
                  aria-hidden="true"
                />
                <Icon size={16} className="mt-0.5 shrink-0 text-ink-faint" />
                <div className="min-w-0">
                  <p className="text-[12px] font-extrabold leading-snug text-ink">{task.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                    {task.detail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(task.tab)}
                className={`${tone.cta} shrink-0 self-start sm:self-auto`}
              >
                {task.cta} →
              </button>
            </li>
          );
        })}
      </ul>

      {/* Show more / less */}
      {hidden > 0 && (
        <div className="border-t border-line px-4 py-2.5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-brand-600"
          >
            {expanded ? (
              <>
                <ChevronUp size={12} /> {L('Show less', 'کم دکھائیں')}
              </>
            ) : (
              <>
                <ChevronDown size={12} /> {L(`${hidden} more`, `${hidden} مزید دکھائیں`)}
              </>
            )}
          </button>
        </div>
      )}

      {/* All clear footer */}
      {isAllClear && (
        <div className="flex items-center gap-2 border-t border-line px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-success-600">
          <CheckCircle2 size={13} /> Sab kaam mukammal
        </div>
      )}
    </section>
  );
}
