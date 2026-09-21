# TEMP script 2 — smartActions teacher/student bilingual conversion
$f = 'd:\app\school-demo2\src\lib\smartActions.ts'
$c = [System.IO.File]::ReadAllText($f)

# ── Teacher ──
$c = $c.Replace('`Aaj ki hazri baqi — ${pendingClasses.length} class`', 'L(`Attendance pending — ${pendingClasses.length} class(es)`, `آج کی حاضری باقی — ${pendingClasses.length} کلاس`)')
$c = $c.Replace('`${summarizeList(pendingClasses)} ki roll call lagani hai. Lagane ke baad absent students ke parents ko WhatsApp bhi bhej sakte hain.`', 'L(`${summarizeList(pendingClasses)} — roll call needed. Afterwards you can WhatsApp parents of absent students.`, `${summarizeList(pendingClasses)} کی رول کال لگانی ہے۔ بعد میں غیر حاضر طلبہ کے والدین کو واٹس ایپ بھیج سکتے ہیں۔`)')
$c = $c.Replace("'Hazri lagayein'", "L('Mark attendance', 'حاضری لگائیں')")
$c = $c.Replace('`Aaj aap ke ${myPeriodsToday.length} periods hain`', 'L(`You have ${myPeriodsToday.length} periods today`, `آج آپ کے ${myPeriodsToday.length} پیریڈز ہیں`)')
$c = $c.Replace('`Aaj jama honi hai: ${f.a.title}`', 'L(`Due today: ${f.a.title}`, `آج جمع ہونی ہے: ${f.a.title}`)')
$c = $c.Replace('`${f.a.title} — ${f.inDays} din mein jama`', 'L(`${f.a.title} — due in ${f.inDays} day(s)`, `${f.a.title} — ${f.inDays} دن میں جمع`)')
$c = $c.Replace("'Class Diary mein check kar lein ke kis class ke liye di gayi thi.'", "L('Check Class Diary to see which class it was assigned to.', 'کلاس ڈائری میں دیکھ لیں کہ کس کلاس کے لیے دی گئی تھی۔')")
$c = $c.Replace("'Diary kholein'", "L('Open diary', 'ڈائری کھولیں')")
$c = $c.Replace('`Zaroori elaan: ${urgent[0].title}`', 'L(`Important notice: ${urgent[0].title}`, `اہم اعلان: ${urgent[0].title}`)')
$c = $c.Replace("'Notices kholein'", "L('Open notices', 'اعلانات کھولیں')")

# ── Student ──
$c = $c.Replace('`Aap ki hazri ${pct}% hai`', 'L(`Your attendance is ${pct}%`, `آپ کی حاضری ${pct}% ہے`)')
$c = $c.Replace("'Requirement 75% hai. Regular classes mein aana zaroori hai warna exam mein dushwari ho sakti hai.'", "L('The requirement is 75%. Attend classes regularly to avoid exam issues.', 'ضرورت 75% ہے۔ باقاعدہ کلاسز میں شریک ہوں ورنہ امتحان میں دشواری ہو سکتی ہے۔')")
$c = $c.Replace("'Record dekhein'", "L('View record', 'ریکارڈ دیکھیں')")
$c = $c.Replace('`Late ho gayi: ${f.a.title}`', 'L(`Overdue: ${f.a.title}`, `تاریخ گزر گئی: ${f.a.title}`)')
$c = $c.Replace('`Aaj jama karni hai: ${f.a.title}`', 'L(`Due today: ${f.a.title}`, `آج جمع کرانا ہے: ${f.a.title}`)')
$c = $c.Replace('`${f.a.title} — ${f.inDays} din baqi`', 'L(`${f.a.title} — ${f.inDays} day(s) left`, `${f.a.title} — ${f.inDays} دن باقی`)')
$c = $c.Replace("'Assignments kholein'", "L('Open assignments', 'اسائنمنٹس کھولیں')")
$c = $c.Replace('`Fee baqi hai — ${formatMoney(pending)}`', 'L(`Fee pending — ${formatMoney(pending)}`, `فیس باقی ہے — ${formatMoney(pending)}`)')
$c = $c.Replace("'Fees tab mein mahina-war tafseel mojood hai. Adaigi ke baad receipt mil jayegi.'", "L('Month-wise details are in the Fees tab. A receipt is issued after payment.', 'فیس ٹیب میں ماہانہ تفصیل موجود ہے۔ ادائیگی کے بعد رسید مل جائے گی۔')")
$c = $c.Replace("'Fees dekhein'", "L('View fees', 'فیس دیکھیں')")
$c = $c.Replace('`Aaj aap ke ${periods.length} periods hain`', 'L(`You have ${periods.length} periods today`, `آج آپ کے ${periods.length} پیریڈز ہیں`)')

[System.IO.File]::WriteAllText($f, $c, [System.Text.UTF8Encoding]::new($false))
Write-Output 'SMART-P2-OK'
