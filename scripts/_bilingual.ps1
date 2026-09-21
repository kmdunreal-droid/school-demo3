# TEMP script — smartActions bilingual conversion (L helper)
$f = 'd:\app\school-demo2\src\lib\smartActions.ts'
$c = [System.IO.File]::ReadAllText($f)

# ── allClearTask ──
$c = $c.Replace("'Sab kaam mukammal ✅'", "L('All tasks complete ✅', 'سب کام مکمل ✅')")
$c = $c.Replace("'Sab kuch theek hai ✅'", "L('Everything is fine ✅', 'سب ٹھیک ہے ✅')")
$c = $c.Replace("'Aaj koi pending kaam nahi ✅'", "L('No pending tasks today ✅', 'آج کوئی کام باقی نہیں ✅')")
$c = $c.Replace("'Aaj ki hazri lag chuki hai aur koi assignment bhi pending nahi. Shabash!'", "L('Attendance is marked and no assignment is pending. Well done!', 'آج کی حاضری لگ چکی ہے اور کوئی اسائنمنٹ بھی باقی نہیں۔ شاباش!')")
$c = $c.Replace("'Koi assignment ya fee ki tareekh qareeb nahi. Aaram se parhai karein.'", "L('No assignment or fee deadline nearby. Study with ease.', 'کوئی اسائنمنٹ یا فیس کی تاریخ قریب نہیں۔ آرام سے پڑھائی کریں۔')")
$c = $c.Replace("'Hazri, fees aur check-ins sab update hain. Aaj koi kaam pending nahi.'", "L('Attendance, fees and check-ins are all updated. Nothing pending today.', 'حاضری، فیس اور چیک اِن سب اپ ڈیٹ ہیں۔ آج کوئی کام باقی نہیں۔')")
$c = $c.Replace("'Timetable dekhein'", "L('View timetable', 'ٹائم ٹیبل دیکھیں')")
$c = $c.Replace("'Dashboard dekhein'", "L('View dashboard', 'ڈیش بورڈ دیکھیں')")

# ── Principal ──
$c = $c.Replace('`Aaj ki hazri baqi hai — ${classesMissing.length} class`', 'L(`Attendance pending — ${classesMissing.length} class(es)`, `آج کی حاضری باقی ہے — ${classesMissing.length} کلاس`)')
$c = $c.Replace('`${summarizeList(classesMissing.map(classLabel))} ki roll call abhi nahi lagi.`', 'L(`${summarizeList(classesMissing.map(classLabel))} — roll call not taken yet.`, `${summarizeList(classesMissing.map(classLabel))} کی رول کال ابھی نہیں لگی۔`)')
$c = $c.Replace("'Attendance kholein'", "L('Open attendance', 'حاضری کھولیں')")
$c = $c.Replace('`${pendingStudents} students ki fee baqi hai`', 'L(`${pendingStudents} student(s) have pending fees`, `${pendingStudents} طلبہ کی فیس باقی ہے`)')
$c = $c.Replace('`Kul baqi raqam ${formatMoney(pendingAmount)}. Fee Center mein har student ka mahina-war hisab mojood hai.`', 'L(`Total outstanding ${formatMoney(pendingAmount)}. Month-wise ledger is available in Fee Center.`, `کل بقایا ${formatMoney(pendingAmount)}۔ فیس سینٹر میں ہر طالب علم کا ماہانہ حساب موجود ہے۔`)')
$c = $c.Replace("'Fee Center kholein'", "L('Open Fee Center', 'فیس سینٹر کھولیں')")
$c = $c.Replace('`${notCheckedIn.length} teachers ne check-in nahi kiya`', 'L(`${notCheckedIn.length} teacher(s) have not checked in`, `${notCheckedIn.length} اساتذہ نے چیک اِن نہیں کیا`)')
$c = $c.Replace('`${summarizeList(notCheckedIn.map((t) => t.name))}. Unki salary hazri se hi calculate hoti hai.`', 'L(`${summarizeList(notCheckedIn.map((t) => t.name))}. Salaries are calculated from attendance.`, `${summarizeList(notCheckedIn.map((t) => t.name))}۔ تنخواہ حاضری سے ہی حساب ہوتی ہے۔`)')
$c = $c.Replace("'Staff Salaries dekhein'", "L('View salaries', 'تنخواہیں دیکھیں')")
$c = $c.Replace('`${lowAttendance.length} students ki hazri 75% se kam`', 'L(`${lowAttendance.length} student(s) below 75% attendance`, `${lowAttendance.length} طلبہ کی حاضری 75% سے کم`)')
$c = $c.Replace('`${summarizeList(lowAttendance)} — parents ko ittila dena behtar hoga.`', 'L(`${summarizeList(lowAttendance)} — better to inform parents.`, `${summarizeList(lowAttendance)} — والدین کو اطلاع دینا بہتر ہوگا۔`)')
$c = $c.Replace("'Register dekhein'", "L('View register', 'رجسٹر دیکھیں')")
$c = $c.Replace('`Aaj: ${first.e.title}`', 'L(`Today: ${first.e.title}`, `آج: ${first.e.title}`)')
$c = $c.Replace('`${first.e.title} — ${first.inDays} din baad`', 'L(`${first.e.title} — in ${first.inDays} day(s)`, `${first.e.title} — ${first.inDays} دن بعد`)')
$c = $c.Replace('`Is hafte ${upcoming.length} events hain. Calendar mein poori list dekh lein.`', 'L(`${upcoming.length} events this week. See the full list in Calendar.`, `اس ہفتے ${upcoming.length} ایونٹس ہیں۔ مکمل فہرست کیلنڈر میں دیکھیں۔`)')
$c = $c.Replace('`School calendar mein tafseel mojood hai.`', "L('Details are in the school calendar.', 'تفصیل اسکول کیلنڈر میں موجود ہے۔')")
$c = $c.Replace("'Calendar kholein'", "L('Open calendar', 'کیلنڈر کھولیں')")

[System.IO.File]::WriteAllText($f, $c, [System.Text.UTF8Encoding]::new($false))
Write-Output 'SMART-P1-OK'
