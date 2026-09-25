# Demo School Management System - Technical Documentation

## Overview
A comprehensive school management PWA built with React 19, TypeScript, Vite, Supabase (PostgreSQL), and Tailwind CSS. Features role-based portals for Principal, Coordinator, Teacher, and Student with real-time cross-device synchronization.

## Demos & Modes

### Demo Mode (default)
- `.env` → `VITE_DATA_MODE=demo` set hai
- App **100% local** chalti hai (browser `localStorage`); Supabase client initialized hota hai magar **koi network request nahi** hoti (`src/lib/supabaseSync.ts` mein har function gated hai)
- Neon (backup/migration) scripts hata diye gaye hain; `@neondatabase/serverless` + `pg` deps remove
- **Nayi API/backend jab mile**: `.env` mein `VITE_DATA_MODE` hatana ya `live` karna + `src/supabase.ts` mein endpoint update karna — baqi sync layer pehle se tayyar hai

### Teacher Attendance (GPS) — "My Attendance"
- Teacher portal mein `My Attendance` tab (sidebar)
- **Check-In** = browser location + Haversine distance → school radius ke andar ho to hi hota hai
- "Demo GPS (School Location)" checkbox — jab device GPS na mile demo ke liye
- `src/lib/geoUtils.ts` (distance) + `src/lib/payEngine.ts` (hisab)

### Teacher Pay — "My Pay" & Principal "Teacher Pay"
- Har teacher ka monthly hisab: Base + (Present × Bonus) + Allowances − (Late × Docking) − (Absent × Docking) − Fixed
- Teacher: monthly payslip + print (PDF ke liye browser print)
- Principal: salary config editor, monthly table, Mark Paid
- Storage keys: `acadamis_teacher_attendance`, `acadamis_teacher_pay_configs`, `acadamis_teacher_pay_slips`, `acadamis_school_location`

### Supabase Keep-Alive
- `npm run keepalive` → ek ping (project ko pause hone se bachata hai)
- `npm run keepalive:watch` → har 6 ghante auto-ping
- Windows Task Scheduler setup `scripts/supabase-keepalive.cjs` header mein documented hai

### ID + Password Auth (Supabase Auth) — 2026 redesign
- Login ab **ID + Password** se hota hai (email nahi): ID internally `<id>@app.school` fake-email par map hoti hai
- Role **sirf** `public.profiles` table se aata hai (RLS: apni row) — purana "koi bhi authenticated = principal" hole band
- Hardcoded credentials (`km/6016`, `ali/111222`) hata diye gaye; logout par `supabase.auth.signOut()`
- Naye teacher/student/coordinator add karne par auth user Edge Function `create-auth-user` banata hai (service key server-side)
- Password cloud par jaata hi nahi (`src/lib/supabaseSync.ts` mein strip); bulk setup `scripts/provision-users.cjs`
- Setup verify: `npm run auth:check` (GoTrue settings + Edge Function + DB health, read-only)
- Poori tafseel + troubleshooting: **`AUTH_SETUP.md`**

### Theme (purana — 2026 redesign se badal gaya, upar "Design System & Onboarding" dekhein)
- Pehle: Teal `#0d9488` + Amber. Ab: **Midnight Indigo** (`--color-brand-600: #4f46e5`) + **Amber Gold** accent
- PWA `theme_color: #4f46e5` (index.html + vite.config.ts manifest dono)

---

## Design System & Onboarding (2026 Redesign)

### Theme — "Midnight Indigo + Amber Gold"
- **Single source of truth:** `src/styles/tokens.css` (`@theme` blocks → Tailwind v4 utilities).
- **Legacy remap:** purani `teal-*` classes → brand indigo, `amber-*` → gold accent. Is liye
  600+ purani class usages bina .tsx edit ke naye rang mein aa gaye.
- **Semantic tokens:** `surface / line / ink` (dark mode mein `src/styles/dark-mode.css` override karta hai),
  status ke liye `success / warn / info / danger` ramps.
- **Component classes** (`src/styles/components.css`): `.card` `.stat-tile` `.btn-primary` `.input`
  `.badge` `.nav-item` `.nav-group` `.data-table` `.modal-shell` `.empty-state` etc.
- **Animations** (`src/styles/animations.css`): `staggerIn`, `shimmer`, `scaleIn`, `slideFade`
  + `prefers-reduced-motion` support (`initMotionPreference()`).
- **Palette swap:** sirf `tokens.css` ke brand/accent hex badlein — poori app recolor.

### Navigation (navConfig.ts)
- **Ek hi source of truth:** `src/lib/navConfig.ts` — `getNavItems(role)`, `groupNavItems()`,
  `NAV_GROUP_LABELS`. Tab **ids unchanged** hain (localStorage/back-history safe), sirf
  labels + grouping nayi hain:
  - Principal: Dashboard · Insights · **Academics** (Attendance & Marks, Timetable, Monthly Reports) ·
    **Finance** (Staff Salaries) · **Administration** (People & Setup, Tools)
  - Teacher: **My Day** (Dashboard, Take Attendance, Enter Marks, My Students) ·
    **Teaching** (Class Diary, Quizzes, AI Paper Maker) · **My Work** (My Timetable, My Check-In, My Salary) ·
    **School** (Notices, Calendar, My Settings)
  - Student: Dashboard · My Attendance · My Marks · My ID Card · + Fees, Notices, Calendar, Assignments
- Sidebar mein **group headings + 📌 Favourites (pin)**, mobile bottom nav dynamic-class bug fixed.

### Onboarding & Help (v3 update — Tutorial remove ho chuka hai)
- ~~`TourOverlay.tsx` / `HelpCenter.tsx` / `onboardingSteps.ts` / `tutorialPrefs.ts`~~ — **user request par tutorial system remove kar diya gaya hai** (files deleted, koi dangling reference nahi).
- `motionPrefs.ts` — reduce-motion preference (`acadamis_reduce_motion`) ab yahan rehti hai.
- `CommandPalette.tsx` — **Ctrl+K** universal search (features + students + teachers + classes).
- `smartActions.ts` + `SmartTaskPanel.tsx` — **"Aaj ka Kaam"** panel jo app ke apne data se
  pending tasks banata hai (attendance pending, fee due, check-in, assignments) aur seedha
  sahi tab par le jata hai.
- `favorites.ts` — per-role pinned tabs (`acadamis_favorites_<role>`).

### Language — English / اردو (i18n.ts)
- `src/lib/i18n.ts` — store: localStorage `acadamis_lang` (`'en' | 'ur'`) + window event
  `acadamis_lang_change` (theme toggle ka wohi proven pattern).
- `t(key)` → current-language text; `useLang()` → React hook (useSyncExternalStore) —
  language badalte hi sab subscribed components re-render.
- `initLang()` App start par saved language ko `html.lang-ur` class se apply karta hai.
- Urdu typography: `--font-urdu` (Noto Naskh Arabic) + `--font-urdu-display` (Noto Nastaliq Urdu)
  tokens; `.i18n-ur` class RTL + letter-spacing reset karti hai (colorful.css section 1).
- `navConfig.ts` bilingual: `NAV_UR` per-role labels/hints, `NAV_GROUP_LABELS_UR`, `groupLabel()`,
  `tabLabel(lang)`. UI components: `LanguageToggle.tsx` (sidebar chip) + `LanguageCard.tsx`
  (settings cards with live preview).

### Colorful Layer (colorful.css)
- `src/styles/colorful.css` components.css ke baad import hoti hai — isi ke rules components
  ko vibrant banate hain: gradient `.btn-primary/.btn-accent/.btn-success/.btn-info`,
  `.card-acc-*` (top accent bar + tinted glow), `.tile-*` stat tiles (8 hues + accent bar),
  `.pill-*` nav colors, `.greet-principal/teacher/student` rainbow heroes, `.title-vib`,
  aur `.nav-item-active` indigo→violet gradient.
- Urdu fonts Google Fonts import se aate hain (index.css line 17).


## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS 4 + Lucide React icons
- **State**: React hooks (useState, useEffect, useMemo, useCallback, useRef)
- **Database**: Supabase PostgreSQL `records` table (with localStorage fallback)
- **Auth**: Custom email/password (Supabase Auth ready)
- **PWA**: Workbox service worker + Web App Manifest
- **Charts**: Recharts
- **Animations**: Motion (framer-motion)
- **Notifications**: Sonner toast
- **Date/Time**: Native JS Date API

### Project Structure
```
src/
├── App.tsx                 # Root: auth, routing, Supabase sync orchestration
├── supabase.ts             # Supabase client init (Data + Realtime)
├── types.ts                # All TypeScript interfaces
├── initialData.ts          # Seed data (25 students, 6 teachers, 4 classes)
├── styles/                 # 2026 redesign design system (import order: tokens → base → components → colorful → animations → dark-mode)
│   ├── tokens.css          # @theme palette — SINGLE source of truth (brand/accent/surface/ink/line + status ramps + Urdu fonts)
│   ├── base.css            # html/body, scrollbars, selection, print rules
│   ├── components.css      # .card .stat-tile .btn-* .input .badge .nav-* .data-table .modal-shell .empty-state
│   ├── colorful.css        # ★ vibrant layer: gradient buttons/cards/tiles/pills + greet-* heroes + .i18n-ur typography
│   ├── animations.css      # staggerIn, shimmer, scaleIn, slideFade + reduced-motion support
│   └── dark-mode.css       # html.dark overrides (surfaces, lines, ink)
├── lib/
│   ├── supabaseSync.ts     # Queue/flush/load + realtime (postgres_changes) helpers
│   ├── feeEngine.ts        # Core fee/dues logic (payments, otherFunds, dues)
│   ├── payEngine.ts        # Teacher salary calc + payslips
│   ├── navConfig.ts        # ★ Navigation source of truth (per-role items, groups, bilingual EN/اردو labels)
│   ├── i18n.ts             # ★ English/اردو language store (t, useLang, initLang, LANG_EVENT)
│   ├── smartActions.ts     # ★ "Aaj ka Kaam" task builder (app data se)
│   ├── motionPrefs.ts      # ★ reduce-motion preference
│   ├── favorites.ts        # ★ Per-role pinned tabs
│   ├── attendanceSettings.ts / geoUtils.ts / periodUtils.ts
│   ├── notificationUtils.ts / safeStorage.ts / dataUtils.ts / longPress.ts
├── components/
│   ├── LandingPage.tsx     # Public landing page
│   ├── Login.tsx           # Unified login (all roles)
│   ├── PrincipalDashboard.tsx  # Principal/Coordinator portal (full access)
│   ├── TeacherDashboard.tsx    # Teacher portal (limited access)
│   ├── StudentDashboard.tsx    # Student portal (read-only + ID card)
│   ├── LanguageToggle.tsx  # ★ EN/اردو sidebar chip
│   ├── LanguageCard.tsx    # ★ Language settings card (live preview)
│   ├── CommandPalette.tsx  # ★ Ctrl+K universal search
│   ├── SmartTaskPanel.tsx  # ★ "Aaj ka Kaam" dashboard panel
│   ├── QuizModule.tsx / AiPaperGenerator.tsx / AiSettingsSection.tsx
│   ├── NoticeBoard.tsx / EventsCalendar.tsx
│   ├── PrintableReport.tsx / AttendanceSwipeOverlay.tsx / HoldActionWrapper.tsx
└── assets/                 # Images, logos
```
*(★ = 2026 redesign ke naye files)*

---

## Role-Based Access Control

| Feature | Principal | Coordinator | Teacher | Student |
|---------|-----------|-------------|---------|---------|
| **Dashboard** | Full metrics | Full metrics | Class metrics | Personal metrics |
| **Students** | CRUD all | View all | View own class | View self only |
| **Teachers** | CRUD all | View all | View self | View assigned |
| **Classes** | CRUD all | View all | View assigned | View own |
| **Timetable** | CRUD all | View all | View assigned | View own class |
| **Attendance** | Mark all classes | Mark all classes | Mark own classes | View self |
| **Marks/Grades** | CRUD all | CRUD all | CRUD own subjects | View self |
| **Fees/Collection** | Full CRUD + dues | View + collect | View only | View self ledger |
| **Fee Dues (extra)** | Full CRUD | View + add | No | View self |
| **WhatsApp Alerts** | Fee + Attendance | Fee + Attendance | No | No |
| **Reports/Print** | All students | All students | Own class | Self only |
| **Settings/Cloud** | Full sync control | View only | Profile only | Profile only |
| **Assignments** | CRUD all | CRUD all | CRUD own | View assigned |
| **ID Card Design** | No | No | No | Full designer |

### Role Definitions
- **Principal** (`principal`): Super admin, full system access, cloud sync control
- **Coordinator** (`coordinator`): Academic coordinator, similar to principal but no cloud delete
- **Teacher** (`teacher`): Class/subject teacher, marks attendance & grades for assigned classes
- **Student** (`student`): Views own data, attendance, marks, fees, designs ID card

---

## Data Flow & Synchronization

### Firestore Collections
| Collection | Description | Auto-Sync |
|------------|-------------|-----------|
| `teachers` | Teacher profiles | ✅ Real-time + 60s push |
| `students` | Student profiles | ✅ Real-time + 60s push |
| `classes` | Class definitions + teacher mapping | ✅ Real-time + 60s push |
| `timetable` | Period schedules | ✅ Real-time + 60s push |
| `attendance` | Daily attendance records | ✅ Real-time + 60s push |
| `marks` | Exam/test scores | ✅ Real-time + 60s push |
| `fees` | Payment transaction records | ✅ Real-time + 60s push |
| `fee_data` | Student fee ledger (payments, otherFunds, dues) | ✅ Real-time + 60s push |
| `coordinators` | Coordinator profiles | ✅ Real-time + 60s push |
| `assignments` | Homework/assignments | ✅ Real-time + 60s push |
| `app_settings` | Global templates (WhatsApp, fee, absent) | ✅ Real-time + 60s push |

### Sync Strategy (App.tsx)
```typescript
// 1. INITIAL LOAD (mount)
- Fetch all collections from Firestore
- If empty → seed from initialData.ts
- If error → use localStorage/initialData, still enable writes

// 2. REAL-TIME LISTENERS (onSnapshot in each dashboard)
- Principal/Teacher/Student dashboards listen to relevant collections
- Instant cross-device updates when any portal makes changes

// 3. DIFFERENTIAL PUSH (debounced 400ms)
- On state change → queueBatchWrite() → writeBatch.commit()
- Only changed documents written (diff via JSON.stringify comparison)

// 4. PERIODIC PULL (every 30s)
- getDocs() all collections → merge if server has newer data

// 5. PERIODIC PUSH (every 60s) - NEW
- pushLocalToCloud() → full upload of all local state to Firestore
- Ensures offline changes eventually reach cloud

// 6. MANUAL FORCE SYNC
- Principal Dashboard → Settings → "Force Sync to Cloud" button
- Immediate full upload for critical changes
```

### Offline-First Design
- All reads from local React state (populated from localStorage on mount)
- Writes update local state immediately → UI responsive
- Background sync to Firestore (non-blocking)
- localStorage cache updated every 400ms (debounced)
- On reload: localStorage → state → Firestore sync in background

---

## Fee Engine (lib/feeEngine.ts)

### Core Concepts
- **Monthly Fee (Tuition/School Fee)**: Recurring per month, based on `enrollmentMonth`
- **Other Funds**: One-time charges (Paper Fund, Summer Pack, Miscellaneous)
- **Dues**: Separate ledger for fines/extra charges with status (pending/paid/waived)

### Data Model
```typescript
interface StudentFeeData {
  id: string | number;
  name: string;
  class: string;
  monthlyFee: number;
  enrollmentMonth?: string;  // e.g., "April"
  payments: Payment[];       // Monthly fee payments
  otherFunds: OtherFund[];   // One-time charges
  dues: DueEntry[];          // Fines/extra charges with status
}
```

### Key Functions
| Function | Purpose |
|----------|---------|
| `getMonthlySummary(student, month, year)` | `{due, paid, pending, isFutureMonth}` |
| `getYearlySummary(student, year)` | 12-month array with status |
| `getTotalPending(student)` | Sum of all unpaid months + otherFunds + dues |
| `getTotalDues(student)` | Sum of pending dues only |
| `addPayment()` | Record fee payment (auto-allocates to oldest pending) |
| `addOtherFund()` | Add Paper Fund, Summer Pack, etc. |
| `addDue()` | Add fine/extra charge with month/year |
| `payDue()` | Mark due as paid |
| `getStudentFullAccount(student, year)` | Complete ledger for dashboard |
| `getGlobalStats(students[])` | School-wide totals |

### Enrollment Month Logic
- Student only owes fees **from enrollment month onward**
- Months before enrollment → `due = 0`, `isFutureMonth = false`, `isBeforeEnrollment = true`
- Future months → `due = 0`, `isFutureMonth = true`

---

## WhatsApp Integration

### Templates (App Settings)
```typescript
interface AppSettings {
  absentTemplate: string;      // {student_name}, {roll_number}, {date}, {class_name}
  feeTemplate: string;         // {name}, {month}, {amount}, {date}
  resultTemplate: string;      // {student_name}, {roll_number}, {class_name}, {exam_name}, {subjects}, {total_obtained}, {total_max}, {percentage}, {status}
  whatsAppAutoFee: boolean;    // Auto-open WhatsApp on fee collection
  whatsAppAutoAbsence: boolean;// Auto-open WhatsApp on absent marking
  whatsAppAutoResult: boolean; // Auto-open WhatsApp on result publish
  autoWhatsAppRedirect: boolean; // Direct open vs preview modal
}
```

### Triggers
| Event | Auto-Send | Manual Button |
|-------|-----------|---------------|
| Fee collected | `whatsAppAutoFee` | "Send Receipt" in fee history |
| Student marked absent | `whatsAppAutoAbsence` | Per-student 📱 button in attendance |
| Bulk absent students | - | "WhatsApp All" in attendance register |
| Result published | `whatsAppAutoResult` | "Send" per student in results register |

### Phone Number Formatting
- Input: `+92-300-1234567` or `03001234567` or `3001234567`
- Output: `923001234567` (WhatsApp `wa.me/` format)
- Validates: must have parentPhone or studentPhone

---

## Duplicate Code Issues & Refactoring Opportunities

### Identified Duplicates
| Area | Files | Solution |
|------|-------|----------|
| **Fee month parsing** | PrincipalDashboard (parseMonthKey, MONTH_ALIAS), FeeMonthGrid | Extract to `lib/feeUtils.ts` |
| **WhatsApp phone formatting** | PrincipalDashboard (3x), TeacherDashboard | Extract to `lib/whatsappUtils.ts` |
| **Attendance roster logic** | PrincipalDashboard (attendanceRosterRows, attendanceDisplayRows) | Extract hook `useAttendanceRoster()` |
| **Student/Class/Teacher maps** | All 3 dashboards (useMemo maps) | Centralize in App.tsx context |
| **Real-time listeners** | All 3 dashboards (onSnapshot boilerplate) | Custom hook `useFirestoreSync(collections[])` |
| **Modal form patterns** | PrincipalDashboard (5+ modals) | Reusable `<EntityModal />` component |
| **Table/Card responsive patterns** | All dashboards (mobile cards + desktop tables) | `<ResponsiveTable />` component |
| **Fee summary cards** | PrincipalDashboard, StudentDashboard, TeacherDashboard | `<FeeSummaryCards />` component |

### Recommended Refactors
1. **Create `lib/feeUtils.ts`** - Centralize month parsing, fee type detection
2. **Create `hooks/useFirestoreSync.ts`** - Single source for onSnapshot listeners
3. **Create `components/common/ResponsiveTable.tsx`** - Eliminate mobile/desktop duplication
4. **Create `components/common/EntityModal.tsx`** - Generic CRUD modal
5. **Move `pushLocalToCloud` to `lib/firestoreSync.ts`** - Share across dashboards
6. **Add React Context for global state** - Replace prop drilling in App.tsx

---

## Deployment & Operations

### Build Commands
```bash
npm run dev       # Dev server (port 3000/3001)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # TypeScript check (tsc --noEmit)
node scripts/migrate-neon-to-supabase.cjs  # One-time Neon → Supabase data migration
```

### Supabase Setup Checklist
- [ ] Supabase project created (free tier — koi write-quota nahi)
- [ ] `scripts/supabase-schema.sql` Supabase SQL Editor mein run kiya (`records` table + RLS + realtime)
- [ ] `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (browser), `SUPABASE_SECRET_KEY` (scripts-only, kabhi bundle nahi)
- [ ] Realtime enabled on `records` table (schema.sql karta hai)
- [ ] Data migrated: `node scripts/migrate-neon-to-supabase.cjs`

### PWA Installation
- Runs on HTTPS or localhost
- Shows install prompt after 1.5s
- Service worker caches all static assets
- Works offline (reads from localStorage/cache)

---

## Known Limitations & TODOs

### High Priority
- [ ] Tighten RLS policies (abhi `records_public` all-access hai — current public-app behavior)
- [ ] Implement proper auth (Supabase Auth + role-based policies for teachers/students)
- [ ] Add data validation on write (Postgres CHECK constraints / zod)
- [ ] Implement conflict resolution for concurrent edits
- [ ] Add audit log table for all changes

### Medium Priority
- [ ] Extract duplicate code (see table above)
- [ ] Add unit tests for feeEngine.ts
- [ ] Add E2E tests (Playwright)
- [ ] Implement data export/import with validation
- [ ] Add dark mode persistence across devices

### Low Priority
- [ ] Migrate to React Query / SWR for server state
- [ ] Add IndexedDB for larger offline cache
- [ ] Implement push notifications (FCM)
- [ ] Add multi-school/tenant support
- [ ] Create admin CLI for bulk operations

---

## Quick Reference: Key Files to Modify

| Change | File(s) |
|--------|---------|
| Add new fee type | `types.ts`, `feeEngine.ts`, `PrincipalDashboard.tsx` |
| Modify WhatsApp template | `App.tsx` (appSettings default), `PrincipalDashboard.tsx` (settings tab) |
| Add new role | `types.ts` (Role), `Login.tsx`, `App.tsx` (routing), dashboards |
| Change sync behavior | `lib/supabaseSync.ts` (batch/debounce), `App.tsx` (realtime subscription) |
| Modify attendance statuses | `types.ts` (Attendance.status), dashboards |
| Add new notification type | `lib/notificationUtils.ts`, `types.ts` |
| Seed more initial data | `initialData.ts`, `scripts/migrate-neon-to-supabase.cjs` |

---

## Support & Debugging

### Debug Console Commands
```javascript
// Check sync status
console.log('Sync complete:', window.__SYNC_COMPLETE__);

// Force sync from any dashboard
pushLocalToCloud();

// View localStorage keys
Object.keys(localStorage).filter(k => k.startsWith('acadamis'));

// Test Supabase connection
import { testSupabaseConnection } from './src/supabase';
testSupabaseConnection().then(console.log);
```

### Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| Data not on other device | Supabase realtime disconnected | Refresh page; check `records` table realtime enabled |
| `PGRST205` / 404 on writes | `records` table missing | Run `scripts/supabase-schema.sql` in SQL Editor |
| Migration script fails | Missing `.env` keys | Set `VITE_SUPABASE_URL` + `SUPABASE_SECRET_KEY` |
| Fee shows wrong months | enrollmentMonth not set | Edit student → set enrollmentMonth |
| WhatsApp not opening | Phone format / popup blocked | Check parentPhone, allow popups |
| Build fails | TypeScript errors | Run `npm run lint` for details |
| PWA not installing | Not HTTPS / localhost | Use `npm run preview` or deploy |

---

*Generated for Demo School Management System v1.0*
*Last Updated: 2026*