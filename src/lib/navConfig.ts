/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NAV CONFIG — teenon portals ki navigation ka EK hi source of truth
 * ═══════════════════════════════════════════════════════════════════════════
 * Pehle Principal/Teacher/Student dashboards apni-apni nav list alag-alag
 * likhte the — is liye naam, tarteeb aur icons mismatch ho jate the.
 * Ab sab yahan se aate hain: naye asaan naam, mantiqi (logical) groups aur
 * ek jaisa tarteeb.
 *
 * ⚠️ ZAROORI: `id` bilkul wohi purane tab ids hain.
 *    `acadamis_active_tab` localStorage mein, browser-back history mein aur
 *    legacy migration code mein ye ids save hain — badalne se wo sab toot
 *    jata. Is liye ids waisay hi hain, sirf LABEL + ORDER + GROUP naye hain.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  Award,
  Banknote,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  Fingerprint,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Megaphone,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/** Sidebar ke groups — maqsad-based, taake dhoondna asaan ho. */
export type NavGroupId =
  | 'overview'
  | 'academics'
  | 'finance'
  | 'administration'
  | 'myDay'
  | 'teaching'
  | 'myWork'
  | 'school';

export const NAV_GROUP_LABELS: Record<NavGroupId, string> = {
  overview: 'Overview',
  myDay: 'My Day',
  academics: 'Academics',
  teaching: 'Teaching',
  finance: 'Finance',
  myWork: 'My Work',
  administration: 'Administration',
  school: 'School',
};

/** Accent = tile/badge ka rang (brand = indigo, accent = gold). */
export type NavAccent = 'brand' | 'accent' | 'danger' | 'success' | 'info';

export interface NavItem {
  /** Purana tab id — is ko KABHI na badlein. */
  id: string;
  /** Naya, asaan, plain-zubaan naam. */
  label: string;
  icon: LucideIcon;
  group: NavGroupId;
  /** Tooltip + tour ke liye chhoti wazahat. */
  hint: string;
  accent?: NavAccent;
  /**
   * Kuch tabs khulte waqt data tayyar karte hain (jaise aaj ki attendance
   * roster ya selected class ke marks). Yeh flag batata hai kaunsa "entry
   * action" chalana hai.
   */
  entry?: 'attendance' | 'marks';
}

export interface NavGroup {
  id: NavGroupId;
  label: string;
  items: NavItem[];
}

/* ─────────────────────── PRINCIPAL / COORDINATOR ─────────────────────── */

export const PRINCIPAL_NAV: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'overview',
    hint: "Today's summary, tasks and quick actions",
  },
  {
    id: 'analytics',
    label: 'Insights',
    icon: TrendingUp,
    group: 'overview',
    hint: 'Attendance, fees and performance trends (charts)',
    accent: 'accent',
  },

  {
    id: 'registers',
    label: 'Attendance & Marks',
    icon: Database,
    group: 'academics',
    hint: 'Complete registers for daily attendance and marks',
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    group: 'academics',
    hint: 'Create class and period schedules',
  },
  {
    id: 'monthly_report',
    label: 'Monthly Reports',
    icon: FileText,
    group: 'academics',
    hint: 'Monthly report — on screen or print/PDF',
  },

  {
    id: 'teacher_pay',
    label: 'Staff Salaries',
    icon: Banknote,
    group: 'finance',
    hint: 'Salary calc, payslips and paid marking',
  },

  {
    id: 'management_hub',
    label: 'People & Setup',
    icon: Shield,
    group: 'administration',
    hint: 'Manage students, teachers, classes and coordinators',
  },
  {
    id: 'features_hub',
    label: 'Tools',
    icon: LayoutGrid,
    group: 'administration',
    hint: 'Notices, calendar, certificates, AI paper and alerts',
  },

  {
    id: 'settings',
    label: 'Setting',
    icon: Settings,
    group: 'school',
    hint: 'App settings — language, theme, cloud sync',
  },
];

/* ─────────────────────────── TEACHER ─────────────────────────── */

export const TEACHER_NAV: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Sparkles,
    group: 'myDay',
    hint: "Today's lectures and pending work at a glance",
  },
  {
    id: 'attendance',
    label: 'Take Attendance',
    icon: CheckSquare,
    group: 'myDay',
    hint: 'Mark period-wise attendance and send the absent list',
    entry: 'attendance',
  },
  {
    id: 'marks',
    label: 'Enter Marks',
    icon: Award,
    group: 'myDay',
    hint: 'Enter test and exam marks',
    entry: 'marks',
  },
  {
    id: 'students',
    label: 'My Students',
    icon: Users,
    group: 'myDay',
    hint: 'Roster and profiles for your classes',
  },

  {
    id: 'diary',
    label: 'Class Diary',
    icon: ClipboardList,
    group: 'teaching',
    hint: 'Daily lessons, homework and notes',
  },
  {
    id: 'quiz',
    label: 'Quizzes',
    icon: BookOpen,
    group: 'teaching',
    hint: 'Create online quizzes and review results',
    accent: 'accent',
  },
  {
    id: 'ai_paper',
    label: 'AI Paper Maker',
    icon: Sparkles,
    group: 'teaching',
    hint: 'Generate exam papers with AI and print',
  },

  {
    id: 'timetable',
    label: 'My Timetable',
    icon: Calendar,
    group: 'myWork',
    hint: 'Your weekly period schedule',
  },
  {
    id: 'my-attendance',
    label: 'My Check-In',
    icon: MapPin,
    group: 'myWork',
    hint: 'GPS check-in within the school radius',
  },
  {
    id: 'my-pay',
    label: 'My Salary',
    icon: Wallet,
    group: 'myWork',
    hint: 'Your salary summary and payslip print',
  },

  {
    id: 'notices',
    label: 'Notices',
    icon: Megaphone,
    group: 'school',
    hint: 'School announcements and important info',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
    group: 'school',
    hint: 'Events, functions and holidays',
  },
  {
    id: 'admin_panel',
    label: 'Admin Panel',
    icon: Shield,
    group: 'administration',
    hint: 'Developer controls — toggle features on/off',
    accent: 'info',
  },
  {
    id: 'settings',
    label: 'My Settings',
    icon: Settings,
    group: 'school',
    hint: 'Profile, password and app settings',
  },
];

/* ─────────────────────────── STUDENT ───────────────────────────
   NOTE: Student portal ke tab ids fixed hain (StudentDashboard ka TabType):
   dashboard | attendance | marks | timetable | fees | id_card | assignments */

export const STUDENT_NAV: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Sparkles,
    group: 'overview',
    hint: "Today's summary and tasks",
  },
  {
    id: 'attendance',
    label: 'My Attendance',
    icon: CheckSquare,
    group: 'overview',
    hint: 'Your attendance record and percentage',
  },
  {
    id: 'marks',
    label: 'My Marks',
    icon: Award,
    group: 'overview',
    hint: 'Results, grades and subject-wise marks',
    accent: 'accent',
  },

  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    group: 'academics',
    hint: 'Period schedule and teachers',
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: ClipboardList,
    group: 'academics',
    hint: 'Homework, projects and due dates',
  },

  {
    id: 'fees',
    label: 'Fees',
    icon: CreditCard,
    group: 'finance',
    hint: 'Fee record and paid amounts',
  },

  {
    id: 'id_card',
    label: 'My ID Card',
    icon: Fingerprint,
    group: 'school',
    hint: 'View and design your ID card',
  },
];

/* ─────────────────────────── HELPERS ─────────────────────────── */

/** Role ke hisaab se nav list. Coordinator ko principal jaisa pura access. */
export function getNavItems(role: string): NavItem[] {
  if (role === 'teacher') return TEACHER_NAV;
  if (role === 'student') return STUDENT_NAV;
  return PRINCIPAL_NAV;
}

/**
 * Flat list ko groups mein tarteeb-waise badalta hai.
 * Khaali groups result mein nahi aate.
 */
export function groupNavItems(items: NavItem[]): NavGroup[] {
  const order: NavGroupId[] = [
    'overview',
    'myDay',
    'academics',
    'teaching',
    'finance',
    'myWork',
    'administration',
    'school',
  ];

  return order
    .map((gid) => ({
      id: gid,
      label: NAV_GROUP_LABELS[gid],
      items: items.filter((i) => i.group === gid),
    }))
    .filter((g) => g.items.length > 0);
}

/** Tab id se asaan label nikaalo (breadcrumb, page title, command palette). */
export function getTabLabel(items: NavItem[], tabId: string): string {
  const found = items.find((i) => i.id === tabId);
  if (found) return found.label;
  return TAB_LABELS[tabId] ?? tabId;
}

/** Tab ka group label — breadcrumb ke liye. */
export function getTabGroupLabel(items: NavItem[], tabId: string): string | null {
  const found = items.find((i) => i.id === tabId);
  if (!found) return null;
  return NAV_GROUP_LABELS[found.group];
}

/**
 * Woh labels jo sidebar mein nahi hain lekin breadcrumb / command palette /
 * tour mein chahiye — jaise hub ke sub-tabs aur legacy tabs.
 */
export const TAB_LABELS: Record<string, string> = {
  // Principal hub sub-tabs
  alerts: 'Alert Center',
  settings: 'Setting',
  notices: 'Notices',
  calendar: 'Calendar',
  certificates: 'Certificates',
  ai_paper: 'AI Paper Maker',
  // Principal: People & Setup ke sub-tabs
  teachers: 'Teachers',
  students: 'Students',
  classes: 'Classes',
  coordinators: 'Coordinators',
  // Teacher extras
  diary: 'Class Diary',
  quiz: 'Quizzes',
  'my-attendance': 'My Check-In',
  'my-pay': 'My Salary',
  fees: 'Fee Center',
  // Student extras
  id_card: 'My ID Card',
  assignments: 'Assignments',
  // Shared tab ids
  dashboard: 'Dashboard',
  attendance: 'Attendance',
  marks: 'Marks',
  timetable: 'Timetable',
  analytics: 'Insights',
  registers: 'Attendance & Marks',
  monthly_report: 'Monthly Reports',
  teacher_pay: 'Staff Salaries',
  management_hub: 'People & Setup',
  features_hub: 'Tools',
};

/** Har role ke liye tour ka pehla step / help center ka default topic. */
export const ROLE_LABELS: Record<string, string> = {
  principal: 'Principal',
  coordinator: 'Coordinator',
  teacher: 'Teacher',
  student: 'Student',
  developer: 'Developer',
};

/* ═══════════════════════════════════════════════════════════════════════════
   اردو LABELS — two-language navigation (English labels upar wale hi hain)
   ═══════════════════════════════════════════════════════════════════════════
   • Group headings: NAV_GROUP_LABELS_UR
   • Sidebar items:  NAV_UR[roleFamily][id].label / .hint
   • Hub sub-tabs:   TAB_LABELS_UR
   Helpers navLabel()/navHint()/tabLabel() lang ke saath sahi value dete hain —
   dashboards inhi ko call karte hain, is liye har jagah consistent rehta hai.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Lang } from './i18n';

export const NAV_GROUP_LABELS_UR: Record<NavGroupId, string> = {
  overview: 'خلاصہ',
  myDay: 'آج کا دن',
  academics: 'تعلیم',
  teaching: 'تدریس',
  finance: 'مالیات',
  myWork: 'میرا کام',
  administration: 'انتظام',
  school: 'اسکول',
};

interface UrEntry {
  label: string;
  hint: string;
}

const PRINCIPAL_UR: Record<string, UrEntry> = {
  dashboard: { label: 'ڈیش بورڈ', hint: 'آج کا خلاصہ، ضروری کام اور فوری ایکشنز' },
  analytics: { label: 'تجزیات', hint: 'حاضری، فیس اور کارکردگی کے رجحانات (چارٹس)' },
  registers: { label: 'حاضری و نمبر', hint: 'روزانہ حاضری اور نمبروں کے مکمل رجسٹر' },
  timetable: { label: 'ٹائم ٹیبل', hint: 'کلاسوں اور پیریڈز کا شیڈول بنائیں' },
  monthly_report: { label: 'ماہانہ رپورٹس', hint: 'مہینے کی رپورٹ — اسکرین پر یا پرنٹ/PDF' },
  teacher_pay: { label: 'عملہ تنخواہیں', hint: 'تنخواہ کا حساب، پے سلپ اور "ادا شدہ" نشان' },
  management_hub: { label: 'افراد و ترتیب', hint: 'طلبہ، اساتذہ اور کلاسوں کا انتظام' },
  features_hub: { label: 'ٹولز', hint: 'اعلانات، کیلنڈر، اسناد، AI پرچہ اور الرٹس' },
  settings: { label: 'ترتیبات', hint: 'زبان، تھیم اور کلاؤڈ سنک کی ترتیبات' },
};

const TEACHER_UR: Record<string, UrEntry> = {
  dashboard: { label: 'ڈیش بورڈ', hint: 'آج کے لیکچرز اور زیرِ التوا کام ایک نظر میں' },
  attendance: { label: 'حاضری لگائیں', hint: 'پیریڈ وار حاضری لگائیں اور غیر حاضر فہرست بھیجیں' },
  marks: { label: 'نمبر درج کریں', hint: 'ٹیسٹ اور امتحان کے نمبر درج کریں' },
  students: { label: 'میرے طلبہ', hint: 'اپنی کلاسوں کے طلبہ کی فہرست اور پروفائل' },
  diary: { label: 'کلاس ڈائری', hint: 'روزانہ کا سبق، ہوم ورک اور نوٹس' },
  quiz: { label: 'کوئز', hint: 'آن لائن کوئز بنائیں اور جانچ کریں' },
  ai_paper: { label: 'AI پرچہ ساز', hint: 'AI کی مدد سے امتحانی پرچہ تیار کریں اور پرنٹ کریں' },
  timetable: { label: 'میرا ٹائم ٹیبل', hint: 'اپنے پیریڈز کا ہفتہ وار شیڈول' },
  'my-attendance': { label: 'میری حاضری', hint: 'GPS سے اپنی حاضری لگائیں (اسکول کے رداس میں)' },
  'my-pay': { label: 'میری تنخواہ', hint: 'اپنی تنخواہ کا حساب اور پے سلپ پرنٹ' },
  notices: { label: 'اعلانات', hint: 'اسکول کے اعلانات اور ضروری اطلاع' },
  calendar: { label: 'کیلنڈر', hint: 'ایونٹس، فنکشنز اور چھٹیاں' },
  settings: { label: 'میری ترتیبات', hint: 'پروفائل، پاس ورڈ اور ایپ کی ترتیبات' },
};

const STUDENT_UR: Record<string, UrEntry> = {
  dashboard: { label: 'ڈیش بورڈ', hint: 'آج کا خلاصہ اور ضروری کام' },
  attendance: { label: 'میری حاضری', hint: 'اپنی حاضری کا ریکارڈ اور فیصد' },
  marks: { label: 'میرے نمبر', hint: 'رزلٹ، گریڈ اور مضامین کے نمبر' },
  timetable: { label: 'ٹائم ٹیبل', hint: 'پیریڈز کا شیڈول اور اساتذہ' },
  assignments: { label: 'ہوم ورک', hint: 'ہوم ورک، پروجیکٹس اور ان کی تاریخیں' },
  fees: { label: 'فیس', hint: 'فیس ریکارڈ اور ادا شدہ رقم' },
  id_card: { label: 'شناختی کارڈ', hint: 'اپنا شناختی کارڈ دیکھیں اور ڈیزائن کریں' },
};

export const NAV_UR: Record<string, Record<string, UrEntry>> = {
  principal: PRINCIPAL_UR,
  coordinator: PRINCIPAL_UR,
  developer: PRINCIPAL_UR,
  teacher: TEACHER_UR,
  student: STUDENT_UR,
};

/** Sidebar item ka label — language ke mutabiq. */
export function navLabel(item: NavItem, role: string, lang: Lang): string {
  if (lang !== 'ur') return item.label;
  return NAV_UR[role]?.[item.id]?.label ?? item.label;
}

/** Sidebar item ka hint (tooltip / palette). */
export function navHint(item: NavItem, role: string, lang: Lang): string {
  if (lang !== 'ur') return item.hint;
  return NAV_UR[role]?.[item.id]?.hint ?? item.hint;
}

export const TAB_LABELS_UR: Record<string, string> = {
  alerts: 'الرٹ سینٹر',
  settings: 'ایپ کی ترتیبات',
  notices: 'اعلانات',
  calendar: 'کیلنڈر',
  certificates: 'اسناد',
  ai_paper: 'AI پرچہ ساز',
  teachers: 'اساتذہ',
  students: 'طلبہ',
  classes: 'کلاسیں',
  coordinators: 'کارڈینیٹرز',
  diary: 'کلاس ڈائری',
  quiz: 'کوئز',
  'my-attendance': 'میری حاضری',
  'my-pay': 'میری تنخواہ',
  fees: 'فیس سینٹر',
  id_card: 'شناختی کارڈ',
  assignments: 'ہوم ورک',
  dashboard: 'ڈیش بورڈ',
  attendance: 'حاضری',
  marks: 'نمبر',
  timetable: 'ٹائم ٹیبل',
  analytics: 'تجزیات',
  registers: 'حاضری و نمبر',
  monthly_report: 'ماہانہ رپورٹس',
  teacher_pay: 'عملہ تنخواہیں',
  management_hub: 'افراد و ترتیب',
  features_hub: 'ٹولز',
};

/** Tab id se label — language ke hisaab se (breadcrumb / page title). */
export function getTabLabelL(items: NavItem[], tabId: string, role: string, lang: Lang): string {
  const found = items.find((i) => i.id === tabId);
  if (found) return navLabel(found, role, lang);
  if (lang === 'ur') return TAB_LABELS_UR[tabId] ?? tabId;
  return TAB_LABELS[tabId] ?? tabId;
}

/** Group ka label — language ke hisaab se. */
export function groupLabel(gid: NavGroupId, lang: Lang): string {
  return lang === 'ur' ? NAV_GROUP_LABELS_UR[gid] : NAV_GROUP_LABELS[gid];
}
