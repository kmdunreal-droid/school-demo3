/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SMART ACTIONS — "AAJ KA KAAM" engine
 * ═══════════════════════════════════════════════════════════════════════════
 * Yeh asli cheez hai jo app ko "easy to use" banati hai: user ko khud dhoondna
 * nahi parta ke aaj kya karna hai — app us ke data ko dekh kar khud batati hai.
 *
 * Sab kuch pure functions hain (koi side effect nahi), is liye test karna aur
 * samajhna asaan hai. Dashboard in tasks ko panel mein render karta hai.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  getDueRemaining,
  getMonthlySummary,
  getTotalOtherFunds,
  getTotalPending,
} from './feeEngine';
import { safeStorage } from './safeStorage';
import type {
  Assignment,
  Attendance,
  Class,
  Mark,
  Notice,
  SchoolEvent,
  Student,
  StudentFeeData,
  Teacher,
  TeacherAttendance,
  TimetableEntry,
} from '../types';

/** Task ka "mood" — rang isi se aata hai. */
export type TaskTone = 'danger' | 'warn' | 'info' | 'success' | 'brand';

export type TaskIconKey =
  | 'attendance'
  | 'fee'
  | 'checkin'
  | 'event'
  | 'assignment'
  | 'marks'
  | 'notice'
  | 'celebrate';

export interface SmartTask {
  id: string;
  title: string;
  detail: string;
  /** Button ka label — seedha "kya hoga" batata hai. */
  cta: string;
  /** Kis tab par le jana hai (wajood rakhta tab id hona chahiye). */
  tab: string;
  tone: TaskTone;
  icon: TaskIconKey;
}

export interface SmartTaskInput {
  role: string;
  /** Teacher/student ke liye unka id. */
  userId?: string;
  teachers: Teacher[];
  students: Student[];
  classes: Class[];
  attendance: Attendance[];
  marks: Mark[];
  feeStudents: StudentFeeData[];
  timetable: TimetableEntry[];
  assignments: Assignment[];
  notices?: Notice[];
  events?: SchoolEvent[];
  now?: Date;
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Kitne din ka farq hai (b - a), date-only. */
function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(`${aISO}T00:00:00`);
  const b = new Date(`${bISO}T00:00:00`);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 999;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function formatMoney(n: number): string {
  return `PKR ${Math.round(n).toLocaleString('en-US')}`;
}

/** Teacher GPS attendance — demo local store (APP_DOCUMENTATION dekh lein). */
export function readTeacherAttendance(): TeacherAttendance[] {
  try {
    const raw = safeStorage.getItem('acadamis_teacher_attendance');
    if (!raw || raw === 'undefined' || raw === 'null') return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TeacherAttendance[]) : [];
  } catch {
    return [];
  }
}

/** Class ka asaan label: "Grade 10 - A" */
function classLabel(cls: Class | undefined): string {
  if (!cls) return 'N/A';
  return cls.section ? `${cls.className} - ${cls.section}` : cls.className;
}

/** List ko insani shakl mein: "Grade 10, Grade 9 aur 1 aur" */
function summarizeList(items: string[], max = 2): string {
  if (items.length === 0) return '';
  if (items.length <= max) return items.join(', ');
  return `${items.slice(0, max).join(', ')} aur ${items.length - max} aur`;
}

/**
 * Khaali state — jab sab kaam ho chuka ho.
 * "Khali card" dikhane se behtar hai ke user ko tasalli di jaye.
 */
function allClearTask(role: string): SmartTask {
  return {
    id: 'all-clear',
    title:
      role === 'teacher'
        ? 'Sab kaam mukammal ✅'
        : role === 'student'
          ? 'Sab kuch theek hai ✅'
          : 'Aaj koi pending kaam nahi ✅',
    detail:
      role === 'teacher'
        ? 'Aaj ki hazri lag chuki hai aur koi assignment bhi pending nahi. Shabash!'
        : role === 'student'
          ? 'Koi assignment ya fee ki tareekh qareeb nahi. Aaram se parhai karein.'
          : 'Hazri, fees aur check-ins sab update hain. Aaj koi kaam pending nahi.',
    cta: role === 'student' ? 'Timetable dekhein' : 'Dashboard dekhein',
    tab: role === 'student' ? 'timetable' : 'dashboard',
    tone: 'success',
    icon: 'celebrate',
  };
}

/* ───────────────────────── PRINCIPAL / COORDINATOR ───────────────────────── */

function buildPrincipalTasks(input: SmartTaskInput, now: Date): SmartTask[] {
  const tasks: SmartTask[] = [];
  const today = toISODate(now);

  /* 1 — Aaj ki hazri kahin baqi reh gayi? */
  const markedStudentIds = new Set(
    input.attendance.filter((a) => a.date === today).map((a) => String(a.studentId))
  );
  const classesMissing = input.classes.filter((cls) => {
    const roster = input.students.filter((s) => s.classId === cls.id);
    if (roster.length === 0) return false;
    return !roster.some((s) => markedStudentIds.has(String(s.id)));
  });

  if (classesMissing.length > 0) {
    tasks.push({
      id: 'attendance-pending',
      title: `Aaj ki hazri baqi hai — ${classesMissing.length} class`,
      detail: `${summarizeList(classesMissing.map(classLabel))} ki roll call abhi nahi lagi.`,
      cta: 'Attendance kholein',
      tab: 'registers',
      tone: 'warn',
      icon: 'attendance',
    });
  }

  /* 2 — Fee pending (dashboard ke "Fee Pending" tile jaisa hi formula,
         taake dono jagah number bilkul match kare) */
  let pendingAmount = 0;
  let pendingStudents = 0;
  for (const fs of input.feeStudents) {
    const pending = getTotalPending(fs) + getTotalOtherFunds(fs);
    if (pending > 0) {
      pendingAmount += pending;
      pendingStudents += 1;
    }
  }

  if (pendingStudents > 0) {
    tasks.push({
      id: 'fee-pending',
      title: `${pendingStudents} students ki fee baqi hai`,
      detail: `Kul baqi raqam ${formatMoney(pendingAmount)}. Fee Center mein har student ka mahina-war hisab mojood hai.`,
      cta: 'Fee Center kholein',
      tab: 'fees',
      tone: 'danger',
      icon: 'fee',
    });
  }

  /* 3 — Teachers ne aaj check-in kiya? */
  const teacherAttendance = readTeacherAttendance();
  const checkedInToday = new Set(
    teacherAttendance.filter((r) => r.date === today).map((r) => String(r.teacherId))
  );
  const notCheckedIn = input.teachers.filter((t) => !checkedInToday.has(String(t.id)));
  if (input.teachers.length > 0 && notCheckedIn.length > 0 && notCheckedIn.length < input.teachers.length) {
    tasks.push({
      id: 'teacher-checkin',
      title: `${notCheckedIn.length} teachers ne check-in nahi kiya`,
      detail: `${summarizeList(notCheckedIn.map((t) => t.name))}. Unki salary hazri se hi calculate hoti hai.`,
      cta: 'Staff Salaries dekhein',
      tab: 'teacher_pay',
      tone: 'warn',
      icon: 'checkin',
    });
  }

  /* 4 — Hazri 75% se kam wale students */
  const lowAttendance: string[] = [];
  const perStudent = new Map<string, { present: number; total: number }>();
  for (const a of input.attendance) {
    const key = String(a.studentId);
    const rec = perStudent.get(key) ?? { present: 0, total: 0 };
    rec.total += 1;
    if (a.status === 'present') rec.present += 1;
    perStudent.set(key, rec);
  }
  for (const s of input.students) {
    const rec = perStudent.get(String(s.id));
    if (!rec || rec.total < 10) continue;
    const pct = Math.round((rec.present / rec.total) * 100);
    if (pct < 75) lowAttendance.push(`${s.name} (${pct}%)`);
  }
  if (lowAttendance.length > 0) {
    tasks.push({
      id: 'low-attendance',
      title: `${lowAttendance.length} students ki hazri 75% se kam`,
      detail: `${summarizeList(lowAttendance)} — parents ko ittila dena behtar hoga.`,
      cta: 'Register dekhein',
      tab: 'registers',
      tone: 'info',
      icon: 'marks',
    });
  }

  /* 5 — Qareeb aa raha event */
  const upcoming = (input.events ?? [])
    .map((e) => ({ e, inDays: daysBetween(today, e.date) }))
    .filter((x) => x.inDays >= 0 && x.inDays <= 7)
    .sort((a, b) => a.inDays - b.inDays);
  if (upcoming.length > 0) {
    const first = upcoming[0];
    tasks.push({
      id: 'upcoming-event',
      title: first.inDays === 0 ? `Aaj: ${first.e.title}` : `${first.e.title} — ${first.inDays} din baad`,
      detail:
        upcoming.length > 1
          ? `Is hafte ${upcoming.length} events hain. Calendar mein poori list dekh lein.`
          : `School calendar mein tafseel mojood hai.`,
      cta: 'Calendar kholein',
      tab: 'calendar',
      tone: 'info',
      icon: 'event',
    });
  }

  return tasks.length > 0 ? tasks : [allClearTask('principal')];
}

/* ───────────────────────── TEACHER ───────────────────────── */

function buildTeacherTasks(input: SmartTaskInput, now: Date): SmartTask[] {
  const tasks: SmartTask[] = [];
  const today = toISODate(now);
  const dayName = DAY_NAMES[now.getDay()];
  const me = String(input.userId ?? '');

  /* Meri classes: jahan main class-teacher hoon YA jahan aaj mera period hai */
  const myPeriodsToday = input.timetable.filter(
    (t) => String(t.teacherId) === me && t.day === dayName
  );
  const myClassIds = new Set<string>([
    ...input.classes.filter((c) => String(c.classTeacherId) === me).map((c) => c.id),
    ...myPeriodsToday.map((t) => t.classId),
  ]);

  /* 1 — Aaj kis class ki hazri baqi hai? */
  const markedStudentIds = new Set(
    input.attendance.filter((a) => a.date === today).map((a) => String(a.studentId))
  );
  const pendingClasses: string[] = [];
  myClassIds.forEach((cid) => {
    const roster = input.students.filter((s) => s.classId === cid);
    if (roster.length === 0) return;
    if (!roster.some((s) => markedStudentIds.has(String(s.id)))) {
      pendingClasses.push(classLabel(input.classes.find((c) => c.id === cid)));
    }
  });

  if (pendingClasses.length > 0) {
    tasks.push({
      id: 'teacher-attendance',
      title: `Aaj ki hazri baqi — ${pendingClasses.length} class`,
      detail: `${summarizeList(pendingClasses)} ki roll call lagani hai. Lagane ke baad absent students ke parents ko WhatsApp bhi bhej sakte hain.`,
      cta: 'Hazri lagayein',
      tab: 'attendance',
      tone: 'warn',
      icon: 'attendance',
    });
  }

  /* 2 — Aaj ke periods */
  if (myPeriodsToday.length > 0) {
    const list = myPeriodsToday
      .slice(0, 3)
      .map((p) => `${p.period} — ${classLabel(input.classes.find((c) => c.id === p.classId))}`)
      .join(' · ');
    tasks.push({
      id: 'teacher-periods',
      title: `Aaj aap ke ${myPeriodsToday.length} periods hain`,
      detail: `${list}${myPeriodsToday.length > 3 ? ' …' : ''}`,
      cta: 'Timetable dekhein',
      tab: 'timetable',
      tone: 'info',
      icon: 'event',
    });
  }

  /* 3 — Assignment ki tareekh qareeb */
  const myAssignments = input.assignments.filter((a) => String(a.assignedById) === me);
  const soonDue = myAssignments
    .map((a) => ({ a, inDays: daysBetween(today, a.dueDate) }))
    .filter((x) => x.inDays >= 0 && x.inDays <= 3)
    .sort((x, y) => x.inDays - y.inDays);

  if (soonDue.length > 0) {
    const f = soonDue[0];
    tasks.push({
      id: 'teacher-assignment-due',
      title:
        f.inDays === 0
          ? `Aaj jama honi hai: ${f.a.title}`
          : `${f.a.title} — ${f.inDays} din mein jama`,
      detail: 'Class Diary mein check kar lein ke kis class ke liye di gayi thi.',
      cta: 'Diary kholein',
      tab: 'diary',
      tone: 'warn',
      icon: 'assignment',
    });
  }

  /* 4 — Zaroori notice */
  const urgent = (input.notices ?? []).filter(
    (n) =>
      (n.priority === 'urgent' || n.priority === 'important') &&
      (n.audience === 'all' || n.audience === 'teachers') &&
      daysBetween(n.createdAt.slice(0, 10), today) <= 7
  );
  if (urgent.length > 0) {
    tasks.push({
      id: 'teacher-notice',
      title: `Zaroori elaan: ${urgent[0].title}`,
      detail: urgent[0].message.slice(0, 120) + (urgent[0].message.length > 120 ? '…' : ''),
      cta: 'Notices kholein',
      tab: 'notices',
      tone: 'info',
      icon: 'notice',
    });
  }

  return tasks.length > 0 ? tasks : [allClearTask('teacher')];
}

/* ───────────────────────── STUDENT ───────────────────────── */

function buildStudentTasks(input: SmartTaskInput, now: Date): SmartTask[] {
  const tasks: SmartTask[] = [];
  const today = toISODate(now);
  const me = String(input.userId ?? '');
  const myClass = input.classes.find((c) =>
    input.students.some((s) => String(s.id) === me && s.classId === c.id)
  );

  /* 1 — Meri hazri */
  const mine = input.attendance.filter((a) => String(a.studentId) === me);
  if (mine.length >= 10) {
    const present = mine.filter((a) => a.status === 'present').length;
    const pct = Math.round((present / mine.length) * 100);
    if (pct < 75) {
      tasks.push({
        id: 'student-attendance',
        title: `Aap ki hazri ${pct}% hai`,
        detail: 'Requirement 75% hai. Regular classes mein aana zaroori hai warna exam mein dushwari ho sakti hai.',
        cta: 'Record dekhein',
        tab: 'attendance',
        tone: 'danger',
        icon: 'attendance',
      });
    }
  }

  /* 2 — Assignment ki tareekh qareeb ya guzar gayi */
  if (myClass) {
    const due = input.assignments
      .filter((a) => a.classId === myClass.id || a.classId === 'all')
      .map((a) => ({ a, inDays: daysBetween(today, a.dueDate) }))
      .filter((x) => x.inDays <= 7)
      .sort((x, y) => x.inDays - y.inDays);

    if (due.length > 0) {
      const f = due[0];
      const overdue = f.inDays < 0;
      tasks.push({
        id: 'student-assignment',
        title: overdue
          ? `Late ho gayi: ${f.a.title}`
          : f.inDays === 0
            ? `Aaj jama karni hai: ${f.a.title}`
            : `${f.a.title} — ${f.inDays} din baqi`,
        detail: `${f.a.subject} · ${f.a.description.slice(0, 110)}${f.a.description.length > 110 ? '…' : ''}`,
        cta: 'Assignments kholein',
        tab: 'assignments',
        tone: overdue ? 'danger' : 'warn',
        icon: 'assignment',
      });
    }
  }

  /* 3 — Meri fee */
  const myFee = input.feeStudents.find((f) => String(f.id) === me);
  if (myFee) {
    const pending = getTotalPending(myFee) + getTotalOtherFunds(myFee);
    if (pending > 0) {
      tasks.push({
        id: 'student-fee',
        title: `Fee baqi hai — ${formatMoney(pending)}`,
        detail: 'Fees tab mein mahina-war tafseel mojood hai. Adaigi ke baad receipt mil jayegi.',
        cta: 'Fees dekhein',
        tab: 'fees',
        tone: 'info',
        icon: 'fee',
      });
    }
  }

  /* 4 — Aaj ke periods */
  if (myClass) {
    const periods = input.timetable
      .filter((t) => t.classId === myClass.id && t.day === DAY_NAMES[now.getDay()])
      .sort((a, b) => a.period.localeCompare(b.period));
    if (periods.length > 0) {
      tasks.push({
        id: 'student-periods',
        title: `Aaj aap ke ${periods.length} periods hain`,
        detail: periods
          .slice(0, 3)
          .map((p) => `${p.period} — ${p.subject}`)
          .join(' · '),
        cta: 'Timetable dekhein',
        tab: 'timetable',
        tone: 'info',
        icon: 'event',
      });
    }
  }

  return tasks.length > 0 ? tasks : [allClearTask('student')];
}

/* ───────────────────────── MAIN ───────────────────────── */

/**
 * Role ke hisaab se "aaj ka kaam" banata hai.
 * Kabhi khaali array return nahi hota — jab kuch pending na ho to tasalli
 * wala task aata hai (khaali card dikhane se behtar).
 */
export function buildSmartTasks(input: SmartTaskInput): SmartTask[] {
  const now = input.now ?? new Date();

  if (input.role === 'teacher') return buildTeacherTasks(input, now);
  if (input.role === 'student') return buildStudentTasks(input, now);
  return buildPrincipalTasks(input, now);
}

/** Task ka tone → CSS classes (rang ka faisla component mein na ho). */
export const TONE_STYLES: Record<TaskTone, { dot: string; cta: string; chip: string }> = {
  danger: {
    dot: 'var(--color-danger-500)',
    cta: 'btn btn-danger btn-sm',
    chip: 'badge badge-danger',
  },
  warn: {
    dot: 'var(--color-accent-500)',
    cta: 'btn btn-accent btn-sm',
    chip: 'badge badge-accent',
  },
  info: {
    dot: 'var(--color-info-500)',
    cta: 'btn btn-ghost btn-sm',
    chip: 'badge badge-brand',
  },
  success: {
    dot: 'var(--color-success-500)',
    cta: 'btn btn-ghost btn-sm',
    chip: 'badge badge-success',
  },
  brand: {
    dot: 'var(--color-brand-500)',
    cta: 'btn btn-primary btn-sm',
    chip: 'badge badge-brand',
  },
};
