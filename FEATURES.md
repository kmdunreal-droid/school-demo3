# 📖 FEATURES GUIDE — Demo School App
# (ہر فیچر کی مکمل رہنمائی — English + اردو)

> Yeh doc app ke **har feature** ki list hai — kis role ke liye kya hai, kahan milega, kaise use hota hai.
> Naya version: **English + اردو زبان · رنگین (Colorful) تھیم · Dark Mode · Ctrl+K سرچ**

---

## 🌐 1. Zaban ka Intikhab — Language (English / اردو)

| Kya hai | Kahan milega |
|---|---|
| **Language Toggle** `EN | اردو` | Har portal ke sidebar mein, Settings mein |
| **Language Card** (preview ke saath) | Principal → App Settings · Teacher → Settings |
| Ek click mein poora app badal jata hai | Sidebar, dashboard, mobile nav, greetings |
| Urdu font | **Noto Nastaliq Urdu** (headings) + **Noto Naskh Arabic** (text) — auto RTL |
| Zaban yaad rehti hai | Agli login par wohi zaban khulegi |

> اردو منتخب کرنے پر پورا ایپ فوراً اردو میں بدل جاتا ہے — نمبرز اور تاریخوں کی سمت ویسے ہی رہتی ہے۔

---

## 🎨 2. Colorful Theme (رنگین ڈیزائن)

- **Har portal ka apna rainbow gradient** greeting hero:
  - Principal → Indigo → Violet → Fuchsia
  - Teacher → Violet → Pink → Orange
  - Student → Cyan → Emerald → Lime
- **Rangin stat tiles** — har card par apne rang ki accent bar + gradient icon chip (8 hues)
- **Gradient buttons** — indigo→violet (primary), gold→orange (accent), emerald (success), sky (info)
- **Active nav pill** — indigo→violet gradient glow ke saath
- **Dark Mode** 🌙 — sidebar/theme toggle se; dark mein animated aurora background
- Animation kam karne ka option — Settings → Motion

---
## 🏛️ 3. Principal / Coordinator Portal (ہیڈ آفس)

| Feature (EN) | اردو | Kya karta hai |
|---|---|---|
| **Dashboard** | ڈیش بورڈ | Aaj ka summary — collection, hazri, pending kaam ("Aaj ka Kaam" panel) |
| **Insights** | تجزیات | Charts — hazri/fee/performance trends, class comparison |
| **Attendance & Marks** | حاضری و نمبر | Kisi bhi class ki hazri, marks enter/view |
| **Timetable** | ٹائم ٹیبل | Weekly schedule banana/edit karna |
| **Monthly Reports** | ماہانہ رپورٹس | Result cards, class reports — print-ready |
| **Fee Center** | فیس سینٹر | Fee collect, receipts, dues, monthly ledger |
| **Staff Salaries** | تنخواہیں | Salary config, month summary, payslip print |
| **People & Setup** | لوگ اور سیٹ اپ | Students · Teachers · Classes · Subjects |
| **Tools** | ٹولز | Notices · Calendar · Certificates · AI Paper Maker · Alerts · App Settings |

### Khaas powers
- **Ctrl+K** — koi bhi student/teacher/class/feature turant dhoondein
- **📌 Pin** — zaroori tabs sidebar ke top par pin karein
- **Developer Mode** — superuser tracking (role=developer)

---

## 👨‍🏫 4. Teacher Portal (اساتذہ)

| Feature (EN) | اردو | Kya karta hai |
|---|---|---|
| **Dashboard** | ڈیش بورڈ | Aaj ke lectures, pending roll-calls, "Aaj ka Kaam" |
| **Take Attendance** | حاضری لگائیں | Period-wise hazri + absent list SMS text |
| **Enter Marks** | نمبر درج کریں | Class/subject/exam-wise marks entry |
| **My Students** | میرے طلبہ | Roster, student profile + photo |
| **Class Diary** | کلاس ڈائری | Rozana homework parents ke liye |
| **Quizzes** | کوئز | Quiz banana aur chalana |
| **AI Paper Maker** | پیپر بنائیں | AI se test/exam paper |
| **My Timetable** | میری ٹائم ٹیبل | Weekly periods + live "current period" |
| **My Check-In** | GPS حاضری | School check-in/out (distance ke saath) |
| **My Salary** | میری تنخواہ | Month summary + payslip print |
| **Notices / Calendar** | اعلانات / کیلنڈر | Announcements aur events |
| **Settings** | ترتیبات | Language card, theme, motion |

---

## 🎓 5. Student Portal (طلبہ)

| Feature (EN) | اردو | Kya karta hai |
|---|---|---|
| **Dashboard** | ڈیش بورڈ | Hazri %, marks, "Aaj ka Kaam", gradient greeting |
| **My Attendance** | میری حاضری | Mahana hazri record + percentage |
| **My Marks** | میرے نمبر | Har exam ke marks aur grades |
| **Timetable** | ٹائم ٹیبل | Apni class ka schedule |
| **Fees** | فیس | Poora ledger — billed/paid/pending, monthly installments |
| **ID Card** | شناختی کارڈ | Print-ready ID card (photo ke saath) |
| **Assignments** | اسائنمنٹس | Diye gaye kaam dekhna |
| **Notices / Calendar** | اعلانات / کیلنڈر | School ki khabrein aur events |

Mobile par neeche **bottom nav**: ہوم · حاضری · نمبر · کارڈ (+ Menu)

---

## ⚡ 6. Sab Ke Liye — Common Features (ہر کس کے لیے)

1. **🌐 Two Languages** — English / اردو, ek click, sab jagah
2. **🌙 Dark Mode** — smooth animated switch
3. **🔍 Ctrl+K Command Palette** — features, students, teachers, classes — sab search
4. **📌 Pin Favourites** — apne top tabs sidebar mein upar
5. **✅ "Aaj ka Kaam"** — app khud pending kaam batati hai
6. **🔔 Notifications** — period bells, fee due, notices
7. **🖨️ Print Views** — payslip, result card, ID card, certificate
8. **📱 PWA Install** — phone/laptop par install, offline bhi chale
9. **☁️ Supabase Sync** — data cloud + device dono par safe
10. **♿ Accessibility** — reduce-motion option, keyboard support

---

## 🔐 7. Login & Roles (لاگ ان اور کردار)

| Role | Kya dekh sakta hai |
|---|---|
| `principal` / `coordinator` | Poora Principal portal (section 3) |
| `teacher` | Teacher portal (section 4) |
| `student` | Student portal (section 5) |
| `developer` | Principal portal + superuser tracking |

**Demo login:** `ali` / `111222` (role dropdown se role chunein)

---

## 🗂️ 8. Data Safety (ڈیٹا کی حفاظت)

- Sab data **localStorage** mein turant save hota hai (demo mode)
- Supabase available ho to **cloud sync** — dubara login par sab mojood
- Purana data khud migrate hota hai — update par kuch delete nahi hota

---

*Doc version: 3.0 — Language (EN/اردو) + Colorful Theme update ke saath*

