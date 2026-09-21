/**
 * ═══════════════════════════════════════════════════════════════════════════
 * I18N — English + اردو (two-language system)
 * ═══════════════════════════════════════════════════════════════════════════
 * • Store: localStorage `acadamis_lang` ('en' | 'ur') + window event
 *   `acadamis_lang_change` — theme toggle ka wohi proven pattern.
 * • `t(key)` → current-language text (fallback: English, phir key khud).
 * • `useLang()` → React hook (useSyncExternalStore) — language badalte hi
 *   sab jagah re-render.
 * • Urdu display: `html.lang-ur` class + `.i18n-ur` CSS (components.css) —
 *   layout LTR hi rehta hai, sirf text Urdu font/RTL mein render hota hai.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useSyncExternalStore } from 'react';
import { safeStorage } from './safeStorage';

export type Lang = 'en' | 'ur';

const KEY_LANG = 'acadamis_lang';
export const LANG_EVENT = 'acadamis_lang_change';

type Entry = [en: string, ur: string];

/* ─────────────── Dictionary (key: [English, اردو]) ─────────────── */
export const DICT: Record<string, Entry> = {
  /* ── Common actions ── */
  'common.save': ['Save', 'محفوظ کریں'],
  'common.cancel': ['Cancel', 'منسوخ کریں'],
  'common.add': ['Add', 'شامل کریں'],
  'common.delete': ['Delete', 'حذف کریں'],
  'common.edit': ['Edit', 'ترمیم'],
  'common.close': ['Close', 'بند کریں'],
  'common.search': ['Search', 'تلاش'],
  'common.print': ['Print', 'پرنٹ'],
  'common.download': ['Download', 'ڈاؤن لوڈ'],
  'common.collect': ['Collect', 'وصول'],
  'common.update': ['Update', 'اپ ڈیٹ'],
  'common.confirm': ['Confirm', 'تصدیق'],
  'common.yes': ['Yes', 'ہاں'],
  'common.no': ['No', 'نہیں'],
  'common.back': ['Back', 'واپس'],
  'common.view': ['View', 'دیکھیں'],
  'common.more': ['More', 'مزید'],
  'common.all': ['All', 'سب'],
  'common.total': ['Total', 'کل'],
  'common.today': ['Today', 'آج'],
  'common.thisMonth': ['This Month', 'یہ مہینہ'],
  'common.actions': ['Actions', 'کارروائیاں'],
  'common.status': ['Status', 'صورتحال'],
  'common.date': ['Date', 'تاریخ'],
  'common.name': ['Name', 'نام'],
  'common.class': ['Class', 'کلاس'],
  'common.section': ['Section', 'سیکشن'],
  'common.subject': ['Subject', 'مضمون'],
  'common.teacher': ['Teacher', 'استاد'],
  'common.student': ['Student', 'طالب علم'],
  'common.phone': ['Phone', 'فون'],
  'common.fatherName': ['Father Name', 'والد کا نام'],
  'common.fee': ['Fee', 'فیس'],
  'common.amount': ['Amount', 'رقم'],
  'common.paid': ['Paid', 'ادا شدہ'],
  'common.pending': ['Pending', 'باقی'],
  'common.percentage': ['Percentage', 'فیصد'],
  'common.average': ['Average', 'اوسط'],
  'common.grade': ['Grade', 'گریڈ'],
  'common.month': ['Month', 'مہینہ'],
  'common.year': ['Year', 'سال'],
  'common.notes': ['Notes', 'نوٹس'],
  'common.remarks': ['Remarks', 'تاثرات'],
  'common.present': ['Present', 'حاضر'],
  'common.absent': ['Absent', 'غیر حاضر'],
  'common.late': ['Late', 'تاخیر'],
  'common.leave': ['Leave', 'رخصت'],
  'common.loading': ['Loading…', 'لوڈ ہو رہا ہے…'],

  /* ── Sidebar / portal chrome ── */
  'portal.principal': ['Principal Office', 'پرنسپل آفس'],
  'portal.teacher': ['Teacher Portal', 'استاد پورٹل'],
  'portal.student': ['Student Portal', 'طلبہ پورٹل'],
  'portal.coordinator': ['Coordinator Desk', 'کارڈینیٹر ڈیسک'],
  'sidebar.install': ['Install App', 'ایپ انسٹال کریں'],
  'sidebar.logout': ['Logout', 'لاگ آؤٹ'],
  'sidebar.logoutPrincipal': ['Exit Admin Portal', 'انتظامی پورٹل سے نکلیں'],
  'sidebar.logoutTeacher': ['Exit Faculty Portal', 'فیکلٹی پورٹل سے نکلیں'],
  'sidebar.logoutStudent': ['Logout', 'لاگ آؤٹ'],
  'sidebar.favourites': ['Favourites', 'پسندیدہ'],
  'sidebar.menu': ['Menu', 'مینو'],
  'sidebar.language': ['Language', 'زبان'],
  /* ── Home / dashboard chrome ── */
  'home.welcome': ['Welcome back', 'خوش آمدید'],
  'home.hello': ['Hello', 'سلام'],
  'home.attendanceRate': ['Attendance Rate', 'حاضری کی شرح'],
  'home.marksLogged': ['Marks Logged', 'درج شدہ نمبر'],
  'home.totalStudents': ['Total Students', 'کل طلبہ'],
  'home.totalTeachers': ['Total Teachers', 'کل اساتذہ'],
  'home.totalClasses': ['Total Classes', 'کل کلاسیں'],
  'home.todayCollection': ["Today's Collection", 'آج کی وصولی'],
  'home.todayAttendance': ["Today's Attendance", 'آج کی حاضری'],
  'home.feePending': ['Fee Pending', 'فیس باقی'],
  'home.attAvg': ['Attendance Avg', 'اوسط حاضری'],
  'home.monthProgress': ['Month Progress', 'مہینے کی رفتار'],
  'home.enrolledIn': ['Enrolled in', 'ان رولڈ'],
  'home.advisoryTeacher': ['Advisory Teacher', 'مشاورتی استاد'],
  'home.quickActions': ['Quick Actions', 'فوری کام'],
  'home.pendingRollCall': ['Pending Roll Call', 'حاضری باقی'],
  'home.pendingRollCalls': ['Pending Roll Calls', 'حاضریاں باقی'],
  'home.readyCleared': ['Ready & Cleared', 'تیار و مکمل'],
  'home.todayLectures': ["Today's Lectures", 'آج کے لیکچرز'],
  'home.dailyAgenda': ['Daily Reminder & Agenda', 'روزانہ یاد دہانی و ایجنڈا'],
  'home.attGauge': ['My Attendance Gauge', 'میری حاضری'],
  'home.swipeToOpen': ['(Swipe to open)', '》(کھولنے کے لیے سوائپ)《'],
  'home.facultyMember': ['Faculty Member', 'عملہ'],
  'home.classIncharge': ['Class Incharge', 'کلاس انچارج'],
  'home.designatedClass': ['My Designated Class', 'نامزد کلاس'],
  'home.operationalChecklist': ['Operational checklist for', 'آپریشنل چیک لسٹ —'],
  'home.basedOnActiveDate': ['based on active date:', 'منتخب تاریخ:'],
  'home.schedule': ['Schedule', 'شیڈول'],
  'home.viewAll': ['View All', 'سب دیکھیں'],
  'home.events': ['Upcoming Events', 'آنے والے ایونٹس'],
  'home.latestNotices': ['Latest Notices', 'تازہ اعلانات'],
  'home.feeStatus': ['Fee Status', 'فیس کی صورتحال'],
  'home.assignments': ['Assignments', 'ہوم ورک'],
  'home.myTimetable': ['My Timetable', 'میرا ٹائم ٹیبل'],
  'home.noActiveLecture': ['No Active Lecture Right Now', 'اس وقت کوئی لیکچر جاری نہیں'],
  'home.live': ['LIVE', 'جاری'],
  'home.schoolOverview': ['School Overview', 'اسکول کا خلاصہ'],

  /* ── Smart Task Panel (Today's Tasks) ── */
  'smart.title': ["Today's Tasks", 'آج کا کام'],
  'smart.allClearSub': ['All clear — nothing pending', 'سب کلئیر ہے — کچھ باقی نہیں'],
  'smart.waiting': ['task(s) waiting for you', 'کام آپ کے انتظار میں ہیں'],
  'smart.pendingBadge': ['pending', 'باقی'],
  'smart.do': ['Start', 'شروع کریں'],

  /* ── Settings ── */
  'settings.language': ['Language', 'زبان'],
  'settings.languageDesc': ['App language — switches instantly', 'ایپ کی زبان — فوراً بدل جاتی ہے'],
  'settings.english': ['English', 'انگریزی'],
  'settings.urdu': ['Urdu', 'اردو'],
  'settings.security': ['Security & Profile Settings', 'سیکیورٹی و پروفائل ترتیبات'],
  'settings.securityDesc': ['Update your portal login identity and password credentials below.', 'اپنا پورٹل لاگ اِن اور پاس ورڈ نیچے اپ ڈیٹ کریں۔'],
  'settings.username': ['Portal Login ID / Username', 'پورٹل لاگ اِن آئی ڈی'],
  'settings.newPassword': ['New Password', 'نیا پاس ورڈ'],
  'settings.confirmPassword': ['Confirm Password', 'پاس ورڈ دوبارہ'],
  'settings.schoolTitle': ['School Settings & Configuration', 'اسکول کی ترتیبات'],
  'settings.schoolDesc': ['AI • Attendance • WhatsApp • Theme — all in one place', 'اے آئی • حاضری • واٹس ایپ • تھیم — سب یہاں سے']
  ,
  /* ── Command Palette (Ctrl+K) ── */
  'palette.placeholder': ['Search anything — feature, student, teacher…', 'کچھ بھی تلاش کریں — فیچر، طالب علم، استاد…'],
  'palette.features': ['Features', 'فیچرز'],
  'palette.students': ['Students', 'طلبہ'],
  'palette.teachers': ['Teachers', 'اساتذہ'],
  'palette.classes': ['Classes', 'کلاسیں'],
  'palette.noResults': ['No results — try another word', 'کوئی نتیجہ نہیں — دوسرا لفظ آزمائیں'],
  'palette.noResultsFor': ['Nothing found for "{q}"', '"{q}" کے لیے کچھ نہیں ملا'],
  'palette.tryAnother': ['Try another word — e.g. "fee", "marks", "student" or a name.', 'کوئی دوسرا لفظ آزمائیں — جیسے "fee"، "marks"، "student" یا کوئی نام۔'],
  'palette.hint': ['navigate', 'نیویگیٹ'],
  'palette.open': ['open', 'کھولیں'],
  'palette.close': ['close', 'بند کریں'],

  /* ── Login ── */
  'login.welcome': ['Welcome Back', 'خوش آمدید'],
  'login.subtitle': ['Sign in to your portal', 'اپنے پورٹل میں داخل ہوں'],
  'login.username': ['Login ID', 'لاگ اِن آئی ڈی'],
  'login.password': ['Password', 'پاس ورڈ'],
  'login.signin': ['Sign In', 'داخل ہوں'],
  'login.signing': ['Signing in…', 'داخل ہو رہا ہے…'],
  'login.errBoth': ['Login ID and password are both required.', 'لاگ اِن آئی ڈی اور پاس ورڈ دونوں ضروری ہیں۔'],
  'login.errWrong': ['Incorrect login ID or password.', 'غلط لاگ اِن آئی ڈی یا پاس ورڈ۔'],
  'login.demoAccounts': ['Demo Accounts', 'ڈیمو اکاؤنٹس'],
  'login.principal': ['Principal', 'پرنسپل'],
  'login.teacher': ['Teacher', 'استاد'],
  'login.student': ['Student', 'طالب علم'],

  /* ── Landing ── */
  'landing.home': ['Home', 'ہوم'],
  'landing.academics': ['Academics', 'تعلیم'],
  'landing.mentors': ['Mentors', 'اساتذہ'],
  'landing.admissions': ['Admissions', 'داخلے'],
  'landing.cta': ['Get Started', 'شروع کریں'],
  'landing.login': ['Login', 'داخل ہوں'],
};

/* ─────────────────────────── Store ─────────────────────────── */

let listeners: Array<() => void> = [];

export function getLang(): Lang {
  return safeStorage.getItem(KEY_LANG) === 'ur' ? 'ur' : 'en';
}

/** Urdu par `html.lang-ur` + `lang` attribute — CSS isi se font lagati hai. */
export function applyLangClass(l: Lang): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('lang-ur', l === 'ur');
  document.documentElement.lang = l === 'ur' ? 'ur' : 'en';
}

/** App start par ek dafa — saved language ko DOM par apply karta hai. */
export function initLang(): void {
  applyLangClass(getLang());
}

export function setLang(l: Lang): void {
  safeStorage.setItem(KEY_LANG, l);
  applyLangClass(l);
  window.dispatchEvent(new Event(LANG_EVENT));
  listeners.forEach((fn) => fn());
}

/** Current language ka text — fallback: English, phir key khud. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  if (!entry) return key;
  let out = getLang() === 'ur' ? entry[1] : entry[0];
  if (vars) {
    for (const k of Object.keys(vars)) {
      out = out.split(`{${k}}`).join(String(vars[k]));
    }
  }
  return out;
}

/**
 * Inline bilingual helper — one-off strings (toasts etc.) ke liye.
 * L('Attendance saved!', 'حاضری محفوظ ہو گئی!')
 */
export function L(en: string, ur: string): string {
  return getLang() === 'ur' ? ur : en;
}

function subscribe(cb: () => void): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((fn) => fn !== cb);
  };
}

/** React hook — `[lang, setLang]`. Language badalne par re-render. */
export function useLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, getLang, getLang);
  return [lang, setLang];
}

/** Urdu text ke liye CSS class (font + RTL isolate + letter-spacing reset). */
export function i18nCls(lang: Lang): string {
  return lang === 'ur' ? 'i18n-ur' : '';
}

