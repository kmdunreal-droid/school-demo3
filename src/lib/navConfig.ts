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
    hint: 'Aaj ka khulasa, zaroori kaam aur quick actions',
  },
  {
    id: 'analytics',
    label: 'Insights',
    icon: TrendingUp,
    group: 'overview',
    hint: 'Hazri, fees aur performance ki rujhaanat (charts)',
    accent: 'accent',
  },

  {
    id: 'registers',
    label: 'Attendance & Marks',
    icon: Database,
    group: 'academics',
    hint: 'Rozana hazri aur numbers ke mukammal registers',
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    group: 'academics',
    hint: 'Classes aur periods ka schedule banayein',
  },
  {
    id: 'monthly_report',
    label: 'Monthly Reports',
    icon: FileText,
    group: 'academics',
    hint: 'Mahine ki report — screen par ya print/PDF',
  },

  {
    id: 'teacher_pay',
    label: 'Staff Salaries',
    icon: Banknote,
    group: 'finance',
    hint: 'Tankha ka hisab, payslip aur "Paid" marking',
  },

  {
    id: 'management_hub',
    label: 'People & Setup',
    icon: Shield,
    group: 'administration',
    hint: 'Students, teachers, classes aur coordinators ka intezam',
  },
  {
    id: 'features_hub',
    label: 'Tools',
    icon: LayoutGrid,
    group: 'administration',
    hint: 'Notices, calendar, certificates, AI paper, alerts aur settings',
  },
];

/* ─────────────────────────── TEACHER ─────────────────────────── */

export const TEACHER_NAV: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Sparkles,
    group: 'myDay',
    hint: 'Aaj ke lectures aur pending kaam ek nazar mein',
  },
  {
    id: 'attendance',
    label: 'Take Attendance',
    icon: CheckSquare,
    group: 'myDay',
    hint: 'Period-wise hazri lagayein aur absent list bhejein',
    entry: 'attendance',
  },
  {
    id: 'marks',
    label: 'Enter Marks',
    icon: Award,
    group: 'myDay',
    hint: 'Test aur exam ke numbers darj karein',
    entry: 'marks',
  },
  {
    id: 'students',
    label: 'My Students',
    icon: Users,
    group: 'myDay',
    hint: 'Apni classes ke students ki list aur profile',
  },

  {
    id: 'diary',
    label: 'Class Diary',
    icon: ClipboardList,
    group: 'teaching',
    hint: 'Rozana ka sabaq, homework aur notes',
  },
  {
    id: 'quiz',
    label: 'Quizzes',
    icon: BookOpen,
    group: 'teaching',
    hint: 'Online quiz banayein aur khud check karein',
    accent: 'accent',
  },
  {
    id: 'ai_paper',
    label: 'AI Paper Maker',
    icon: Sparkles,
    group: 'teaching',
    hint: 'AI ki madad se exam paper taiyar karein aur print karein',
  },

  {
    id: 'timetable',
    label: 'My Timetable',
    icon: Calendar,
    group: 'myWork',
    hint: 'Apne periods ka hafta-war schedule',
  },
  {
    id: 'my-attendance',
    label: 'My Check-In',
    icon: MapPin,
    group: 'myWork',
    hint: 'GPS se apni hazri lagayein (school ke radius mein)',
  },
  {
    id: 'my-pay',
    label: 'My Salary',
    icon: Wallet,
    group: 'myWork',
    hint: 'Apni tankha ka hisab aur payslip print',
  },

  {
    id: 'notices',
    label: 'Notices',
    icon: Megaphone,
    group: 'school',
    hint: 'School ke elaan aur zaroori ittila',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
    group: 'school',
    hint: 'Events, function aur chuttiyan',
  },
  {
    id: 'settings',
    label: 'My Settings',
    icon: Settings,
    group: 'school',
    hint: 'Profile, password aur app ki settings',
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
    hint: 'Aaj ka khulasa aur zaroori kaam',
  },
  {
    id: 'attendance',
    label: 'My Attendance',
    icon: CheckSquare,
    group: 'overview',
    hint: 'Apni hazri ka record aur percentage',
  },
  {
    id: 'marks',
    label: 'My Marks',
    icon: Award,
    group: 'overview',
    hint: 'Result, grades aur subject-wise numbers',
    accent: 'accent',
  },

  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    group: 'academics',
    hint: 'Periods ka schedule aur teachers',
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: ClipboardList,
    group: 'academics',
    hint: 'Homework, projects aur unki tareekhain',
  },

  {
    id: 'fees',
    label: 'Fees',
    icon: CreditCard,
    group: 'finance',
    hint: 'Fee record, bayan aur paid amounts',
  },

  {
    id: 'id_card',
    label: 'My ID Card',
    icon: Fingerprint,
    group: 'school',
    hint: 'Apna ID card dekhein aur design karein',
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
  settings: 'App Settings',
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
