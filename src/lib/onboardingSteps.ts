/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ONBOARDING STEPS — role-wise guided tour
 * ═══════════════════════════════════════════════════════════════════════════
 * Har step ka `target` ek CSS selector hai — `[data-tour="..."]` attributes
 * aur purane `id="..."` dono chalti hain.
 *
 * ⚠️ Agar target mobile par chhupa hua ho (sidebar off-screen), to overlay
 *    khud-ba-khud kisi DOOSRE visible match par chala jata hai; kuch bhi
 *    visible na ho to step ko center card ki tarah dikhata hai. Is liye tour
 *    desktop aur mobile dono par kabhi tootta nahi.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type TourPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  id: string;
  /** null = koi highlight nahi, sirf center card (welcome / done). */
  target: string | null;
  title: string;
  body: string;
  placement?: TourPlacement;
}

/* ───────────────── PRINCIPAL / COORDINATOR · 19 steps ───────────────── */

export const PRINCIPAL_TOUR: TourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Khush Aamdeed! 👋',
    body: 'Chalein 1 minute mein poori app dekh lete hain. Aap har waqt "Skip" dabaa sakte hain, aur baad mein Settings se dobara chala sakte hain.',
    placement: 'center',
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"], #sidebar-principal',
    title: 'Sab kuch tarteeb se',
    body: 'Poora intezam groups mein baanta hua hai — Overview, Academics, Finance aur Administration. Jo kaam dhoondna ho, apne group mein mil jaye ga.',
    placement: 'right',
  },
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"], #mobile-nav-dashboard',
    title: 'Dashboard',
    body: 'Aap ka ghar. Yahan aaj ka khulasa, zaroori kaam aur quick actions hain.',
    placement: 'right',
  },
  {
    id: 'today-tasks',
    target: '[data-tour="today-tasks"]',
    title: '⚡ Aaj ka Kaam',
    body: 'Sab se ahem hissa. App aap ka data dekh kar khud batati hai ke AAJ kya karna hai — kaunsi class ki hazri baqi hai, kitni fee pending hai. Kuch pending na ho to yahan "sab clear" likha aata hai.',
    placement: 'bottom',
  },
  {
    id: 'stats',
    target: '[data-tour="stats"]',
    title: 'Ek nazar mein numbers',
    body: 'Aaj ki collection, hazri, students aur teachers ke numbers. Har tile par hover karne se halka sa uchhalta hai.',
    placement: 'bottom',
  },
  {
    id: 'insights',
    target: '[data-tour="nav-analytics"]',
    title: 'Insights',
    body: 'Hazri, fees aur performance ki rujhaanat — charts ki shakl mein, taake faisla asaan ho.',
    placement: 'right',
  },
  {
    id: 'registers',
    target: '[data-tour="nav-registers"]',
    title: 'Attendance & Marks',
    body: 'Rozana ki hazri aur numbers ke mukammal registers. Yahan se CSV/Excel bhi nikaal sakte hain.',
    placement: 'right',
  },
  {
    id: 'timetable',
    target: '[data-tour="nav-timetable"]',
    title: 'Timetable',
    body: 'Classes aur periods ka schedule — class, teacher ya din ke hisaab se.',
    placement: 'right',
  },
  {
    id: 'reports',
    target: '[data-tour="nav-monthly_report"]',
    title: 'Monthly Reports',
    body: 'Mahine ki mukammal report, printable — parent meeting ya record ke liye.',
    placement: 'right',
  },
  {
    id: 'salaries',
    target: '[data-tour="nav-teacher_pay"]',
    title: 'Staff Salaries',
    body: 'Teachers ki tankha ka khud-ba-khud hisab (hazri + allowances − deductions) aur payslip print.',
    placement: 'right',
  },
  {
    id: 'people',
    target: '[data-tour="nav-management_hub"]',
    title: 'People & Setup',
    body: 'Naye students, teachers, classes aur coordinators add karein ya edit karein. Yahi app ka "setup" hai.',
    placement: 'right',
  },
  {
    id: 'tools',
    target: '[data-tour="nav-features_hub"]',
    title: 'Tools',
    body: 'Notices, Calendar, Certificates, AI Paper Maker, Alerts aur App Settings — sab yahan ek jagah.',
    placement: 'right',
  },
  {
    id: 'search',
    target: '[data-tour="search"]',
    title: '🔍 Kuch bhi dhoondein (Ctrl + K)',
    body: 'Yeh aap ka sab se tez rasta hai. Ctrl+K (Mac par Cmd+K) dabayein, phir likhein "fee", "ali" ya "marks" — app seedha wahan le jaye gi.',
    placement: 'bottom',
  },
  {
    id: 'favorites',
    target: '[data-tour="favorites"]',
    title: '📌 Pin karein',
    body: 'Jo features aap rozana use karte hain, unhe pin kar dein. Woh Dashboard par hamesha sab se upar rahenge.',
    placement: 'top',
  },
  {
    id: 'theme',
    target: '[data-tour="theme-toggle"]',
    title: '☀️ / 🌙 Light aur Dark',
    body: 'Din mein light, raat mein dark — aap ki pasand save ho jati hai.',
    placement: 'bottom',
  },
  {
    id: 'alerts',
    target: '[data-tour="notifications"], #notification-center',
    title: '🔔 Alerts',
    body: 'Fee due, hazri mukammal hone jaise zaroori messages yahan aate hain — yaad dilane ke liye.',
    placement: 'bottom',
  },
  {
    id: 'help',
    target: '[data-tour="help"]',
    title: '❓ Madad chahiye?',
    body: 'Kabhi bhi is button se guide dobara chala sakte hain, ya sawal ka jawab dhoond sakte hain. Settings se tour hamesha ke liye band bhi kar sakte hain.',
    placement: 'left',
  },
  {
    id: 'user',
    target: '[data-tour="user-card"]',
    title: 'Aap ki profile',
    body: 'Yahan aap ka naam aur role hai. "Exit" se safely bahar nikal sakte hain.',
    placement: 'right',
  },
  {
    id: 'done',
    target: null,
    title: 'Bas! Aap tayyar hain ✅',
    body: 'Yaad rakhein: Ctrl+K se kuch bhi dhoondein, aur "Aaj ka Kaam" panel dekhte rahein. Kabhi bhi ❓ button se yeh guide dobara chala sakte hain.',
    placement: 'center',
  },
];

/* ───────────────────────── TEACHER · 16 steps ───────────────────────── */

export const TEACHER_TOUR: TourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Khush Aamdeed, Ustaad! 👋',
    body: 'Chalein 1 minute mein aap ka portal dikhate hain. "Skip" se kabhi bhi nikal sakte hain.',
    placement: 'center',
  },
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"], #mobile-nav-dashboard',
    title: 'Dashboard',
    body: 'Aap ke aaj ke lectures, pending kaam aur quick actions ek jagah.',
    placement: 'right',
  },
  {
    id: 'today-tasks',
    target: '[data-tour="today-tasks"]',
    title: '⚡ Aaj ka Kaam',
    body: 'App khud batati hai ke aaj kaun sa kaam baqi hai — kaunsi class ki hazri lagani hai, kahan numbers darj karne hain.',
    placement: 'bottom',
  },
  {
    id: 'attendance',
    target: '[data-tour="nav-attendance"], #mobile-nav-attendance',
    title: 'Take Attendance',
    body: 'Period-wise hazri lagayein. Absent students ki list aik click mein WhatsApp par bhej sakte hain.',
    placement: 'right',
  },
  {
    id: 'marks',
    target: '[data-tour="nav-marks"], #mobile-nav-marks',
    title: 'Enter Marks',
    body: 'Test aur exam ke numbers darj karein — grades khud calculate ho jate hain.',
    placement: 'right',
  },
  {
    id: 'students',
    target: '[data-tour="nav-students"], #mobile-nav-students',
    title: 'My Students',
    body: 'Apni classes ke students, unki hazri aur result — ek hi jagah.',
    placement: 'right',
  },
  {
    id: 'diary',
    target: '[data-tour="nav-diary"]',
    title: 'Class Diary',
    body: 'Rozana ka sabaq aur homework likhein — students ko khud dikh jata hai.',
    placement: 'right',
  },
  {
    id: 'quiz',
    target: '[data-tour="nav-quiz"]',
    title: 'Quizzes',
    body: 'Online quiz banayein; students attempt karenge aur app khud check kar ke marks laga de gi.',
    placement: 'right',
  },
  {
    id: 'ai_paper',
    target: '[data-tour="nav-ai_paper"]',
    title: 'AI Paper Maker',
    body: 'Subject aur marks chunein — AI exam paper taiyar kar de ga, aap print kar lein.',
    placement: 'right',
  },
  {
    id: 'timetable',
    target: '[data-tour="nav-timetable"]',
    title: 'My Timetable',
    body: 'Aap ke hafte ka schedule. Jo period abhi chal raha hai woh highlight ho jata hai.',
    placement: 'right',
  },
  {
    id: 'checkin',
    target: '[data-tour="nav-my-attendance"]',
    title: 'My Check-In',
    body: 'School pohnchne par GPS se apni hazri lagayein — sirf school ke radius ke andar lagti hai.',
    placement: 'right',
  },
  {
    id: 'pay',
    target: '[data-tour="nav-my-pay"]',
    title: 'My Salary',
    body: 'Apni tankha ka hisab: base + bonus + allowances − deductions. Payslip bhi print ho jata hai.',
    placement: 'right',
  },
  {
    id: 'school',
    target: '[data-tour="nav-notices"]',
    title: 'Notices aur Calendar',
    body: 'School ke elaan aur events — chhutiyan aur functions yahan dikhte hain.',
    placement: 'right',
  },
  {
    id: 'search',
    target: '[data-tour="search"]',
    title: '🔍 Kuch bhi dhoondein (Ctrl + K)',
    body: 'Ctrl+K dabayein aur likhein — kisi bhi feature par seedha pohnch jayein.',
    placement: 'bottom',
  },
  {
    id: 'help',
    target: '[data-tour="help"]',
    title: '❓ Madad chahiye?',
    body: 'Yahan se guide dobara chalayein ya sawal ka jawab dhoondein.',
    placement: 'left',
  },
  {
    id: 'done',
    target: null,
    title: 'Aap tayyar hain ✅',
    body: 'Rozana sirf 2 kaam: "Aaj ka Kaam" dekhein aur Ctrl+K se navigate karein. Baqi app khud sambhal leti hai.',
    placement: 'center',
  },
];

/* ───────────────────────── STUDENT · 10 steps ───────────────────────── */

export const STUDENT_TOUR: TourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Khush Aamdeed! 👋',
    body: 'Chalein aap ka student portal dekh lete hain — sirf 30 second lagein ge.',
    placement: 'center',
  },
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"], #mobile-nav-dashboard',
    title: 'Dashboard',
    body: 'Aap ka khulasa — hazri, marks aur zaroori kaam.',
    placement: 'right',
  },
  {
    id: 'today-tasks',
    target: '[data-tour="today-tasks"]',
    title: '⚡ Aaj ka Kaam',
    body: 'App batati hai ke aaj kya karna hai — jaise kaunsi assignment jama karni hai, ya fee ki tareekh.',
    placement: 'bottom',
  },
  {
    id: 'attendance',
    target: '[data-tour="nav-attendance"], #mobile-nav-attendance',
    title: 'My Attendance',
    body: 'Aap ki hazri ka record. 75% se neeche ho to app warning bhi dikhati hai.',
    placement: 'right',
  },
  {
    id: 'marks',
    target: '[data-tour="nav-marks"], #mobile-nav-marks',
    title: 'My Marks',
    body: 'Har subject ke numbers, grade aur percentage — result card yahan se print hota hai.',
    placement: 'right',
  },
  {
    id: 'timetable',
    target: '[data-tour="nav-timetable"]',
    title: 'Timetable',
    body: 'Aap ke periods ka schedule — kis period mein kaun se teacher aayenge.',
    placement: 'right',
  },
  {
    id: 'assignments',
    target: '[data-tour="nav-assignments"]',
    title: 'Assignments',
    body: 'Homework aur projects, unki tareekhon ke saath.',
    placement: 'right',
  },
  {
    id: 'fees',
    target: '[data-tour="nav-fees"]',
    title: 'Fees',
    body: 'Aap ki fee ka record — kya jama ho chuka hai aur kya baqi hai.',
    placement: 'right',
  },
  {
    id: 'idcard',
    target: '[data-tour="nav-id_card"]',
    title: 'My ID Card',
    body: 'Apna ID card dekhein — colour aur theme khud badal sakte hain.',
    placement: 'right',
  },
  {
    id: 'done',
    target: null,
    title: 'Shabash! Aap tayyar hain ✅',
    body: 'Kabhi kuch samajh na aaye to ❓ button dabayein — hum madad kar denge.',
    placement: 'center',
  },
];

/** Role ke hisaab se tour steps. */
export function getTourSteps(role: string): TourStep[] {
  if (role === 'teacher') return TEACHER_TOUR;
  if (role === 'student') return STUDENT_TOUR;
  return PRINCIPAL_TOUR;
}
