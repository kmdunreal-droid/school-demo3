/* TEMP — batch C3: TeacherDashboard + StudentDashboard */
module.exports = {
  'src/components/TeacherDashboard.tsx': [
    { line: 416, find: "toast.info('Aap already check-in kar chuke hain.')", replace: "toast.info(L('You have already checked in.', 'آپ پہلے ہی حاضری لگا چکے ہیں۔'))" },
    { line: 426, find: "toast.error('Device location nahi mili — neeche \"Demo GPS (School Location)\" tick karke dobara Check-In Try karein.')", replace: "toast.error(L('Device location not found — tick \"Demo GPS (School Location)\" below and try Check-In again.', 'ڈیوائس کی لوکیشن نہیں ملی — نیچے \"Demo GPS (School Location)\" ٹک کر کے دوبارہ Check-In کریں۔'))" },
    { line: 431, find: "toast.error(`Aap school se ${formatDistance(dist)} door hain (radius ${schoolLocation.radiusMeters} m). Attendance sirf school ke andar se mark hoti hai.`)", replace: "toast.error(L(`You are ${formatDistance(dist)} away from school (radius ${schoolLocation.radiusMeters} m). Attendance can be marked only inside the school.`, `آپ اسکول سے ${formatDistance(dist)} دور ہیں (رداس ${schoolLocation.radiusMeters} میٹر)۔ حاضری صرف اسکول کے اندر سے لگتی ہے۔`))" },
    { line: 460, find: "? `Check-in ho gaya (${now.toLocaleTimeString()}) — LATE ${useDemoPosition ? '' : '· ' + formatDistance(dist || 0)}`", replace: "? L(`Checked in (${now.toLocaleTimeString()}) — LATE ${useDemoPosition ? '' : '· ' + formatDistance(dist || 0)}`, `حاضری لگ گئی (${now.toLocaleTimeString()}) — تاخیر ${useDemoPosition ? '' : '· ' + formatDistance(dist || 0)}`)" },
    { line: 461, find: ": `Check-in ho gaya (${now.toLocaleTimeString()}) ✅ ${useDemoPosition ? '' : '· ' + formatDistance(dist || 0)}`);", replace: ": L(`Checked in (${now.toLocaleTimeString()}) ✅ ${useDemoPosition ? '' : '· ' + formatDistance(dist || 0)}`, `حاضری لگ گئی (${now.toLocaleTimeString()}) ✅ ${useDemoPosition ? '' : '· ' + formatDistance(dist || 0)}`));" },
    { line: 465, find: "toast.info('Pehle Check-In karein, phir Check-Out hoga.')", replace: "toast.info(L('Check in first, then Check-Out becomes available.', 'پہلے Check-In کریں، پھر Check-Out ہو گا۔'))" },
    { line: 466, find: "toast.info('Aap already check-out kar chuke hain.')", replace: "toast.info(L('You have already checked out.', 'آپ پہلے ہی Check-Out کر چکے ہیں۔'))" },
    { line: 485, find: "message: `${userSession.name} ne ${now.toLocaleTimeString()} par check-out kiya. Din mukammal ✔`,", replace: "message: L(`${userSession.name} checked out at ${now.toLocaleTimeString()}. Day complete ✔`, `${userSession.name} نے ${now.toLocaleTimeString()} پر Check-Out کیا۔ دن مکمل ✔`)," },
    { line: 490, find: "toast.success(`Check-out ho gaya (${now.toLocaleTimeString()}) — din mukammal ✅`);", replace: "toast.success(L(`Checked out (${now.toLocaleTimeString()}) — day complete ✅`, `Check-Out ہو گیا (${now.toLocaleTimeString()}) — دن مکمل ✅`));" },
    { line: 1437, find: "title={pins.includes(item.id) ? 'Pin hatayein' : 'Pin karein'}", replace: "title={pins.includes(item.id) ? L('Unpin', 'پن ہٹائیں') : L('Pin', 'پن کریں')}" },
    { line: 1438, find: "aria-label={pins.includes(item.id) ? 'Pin hatayein' : 'Pin karein'}", replace: "aria-label={pins.includes(item.id) ? L('Unpin', 'پن ہٹائیں') : L('Pin', 'پن کریں')}" },
    { line: 4416, find: ">Koi attendance record nahi — aaj check-in karein<", replace: ">{L('No attendance records yet — check in today', 'ابھی کوئی حاضری کا ریکارڈ نہیں — آج حاضری لگائیں')}<" },
    { line: 4441, find: "Monthly hisab-e-tankhwah — attendance k sath linked (Digital Registrar)", replace: "{L('Monthly salary account — linked to attendance (Digital Registrar)', 'ماہانہ تنخواہ کا حساب — حاضری سے منسلک (ڈیجیٹل رجسٹرار)')}" },
    { line: 4513, find: "{salaryHistory.startLabel} se {salaryHistory.monthsCount} mahine ka pura hisab-e-tankhwah", replace: "{L(`Full salary account for ${salaryHistory.monthsCount} months since ${salaryHistory.startLabel}`, `${salaryHistory.startLabel} سے ${salaryHistory.monthsCount} ماہ کا مکمل تنخواہ حساب`)}" },
    { line: 4520, find: "<span className=\"text-xs\"> saal</span> {salaryHistory.tenureRemMonths}<span className=\"text-xs\"> mahine</span>", replace: "<span className=\"text-xs\"> {L('years', 'سال')}</span> {salaryHistory.tenureRemMonths}<span className=\"text-xs\"> {L('months', 'ماہ')}</span>" },
    { line: 4584, find: ">Koi salary record nahi mila<", replace: ">{L('No salary records found', 'کوئی تنخواہ کا ریکارڈ نہیں ملا')}<" },
    { line: 4593, find: "? `${formatPKR(salaryHistory.totalPending)} pending` : 'Sab Paid ✓'}", replace: "? L(`${formatPKR(salaryHistory.totalPending)} pending`, `${formatPKR(salaryHistory.totalPending)} باقی`) : L('All Paid ✓', 'سب ادا ✓')}" },
  ],

  'src/components/StudentDashboard.tsx': [
    { line: 633, find: "title={isPinned ? (lang === 'ur' ? 'پن ہٹائیں' : 'Pin hatayein') : (lang === 'ur' ? 'پن کریں' : 'Pin karein')}", replace: "title={isPinned ? L('Unpin', 'پن ہٹائیں') : L('Pin', 'پن کریں')}" },
  ],
};
