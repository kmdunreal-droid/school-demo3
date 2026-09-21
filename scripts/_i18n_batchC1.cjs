/* TEMP — batch C1: PrincipalDashboard (fee + chrome) */
module.exports = {
  'src/components/PrincipalDashboard.tsx': [
    { line: 423, find: "toast.error('Valid lat / lng / radius enter karein.');", replace: "toast.error(L('Enter a valid lat / lng / radius.', 'درست lat / lng / رداس درج کریں۔'));" },
    { line: 429, find: "toast.success('School location updated — teachers ka GPS radius ab naye coordinates se check hoga.');", replace: "toast.success(L('School location updated — teacher GPS will now be checked against the new coordinates.', 'اسکول کا مقام اپ ڈیٹ ہو گیا — اساتذہ کا GPS اب نئے کوآرڈینیٹس سے جانچا جائے گا۔'));" },
    { line: 686, find: "toast.success(`Applied \"${bulkDueDesc.trim()}\" PKR ${amt.toLocaleString()} to ${addedCount > 0 ? addedCount : targetStudents.length} ", replace: "toast.success(`${L('Applied', 'لاگو کیا')} \"${bulkDueDesc.trim()}\" PKR ${amt.toLocaleString()} ${L('to', 'برائے')} ${addedCount > 0 ? addedCount : targetStudents.length} " },
    { line: 686, find: "${bulkDueTarget === 'student' ? 'student' : (bulkDueClassId === 'all' ? 'students (all classes)' : 'students (class)')}. Unpaid students ki Remaining/Dues mein show hogi.`", replace: "${bulkDueTarget === 'student' ? L('student', 'طالب علم') : (bulkDueClassId === 'all' ? L('students (all classes)', 'طلبہ (تمام کلاسز)') : L('students (class)', 'طلبہ (کلاس)'))} ${L('Unpaid students will show in Remaining / Dues.', 'غیر ادا شدہ طلبہ Remaining / Dues میں دکھیں گے۔')}`" },
    { line: 892, find: "toast.error(\"Koi due select nahi kiya — Pending Dues se select karein ya fee amount enter karein.\");", replace: "toast.error(L('No due selected — pick one from Pending Dues or enter a fee amount.', 'کوئی باقی منتخب نہیں — Pending Dues سے منتخب کریں یا فیس کی رقم درج کریں۔'));" },
    { line: 1224, find: "toast.error('Kam az kam aik student select karein.')", replace: "toast.error(L('Select at least one student.', 'کم از کم ایک طالب علم منتخب کریں۔'))" },
    { line: 1225, find: "toast.error('Sahi amount enter karein (PKR).')", replace: "toast.error(L('Enter a valid amount (PKR).', 'درست رقم درج کریں (PKR)۔'))" },
    { line: 1227, find: "toast.error('Collect amount, due amount se zyada nahi ho sakta.')", replace: "toast.error(L('Collect amount cannot exceed the due amount.', 'وصول رقم باقی رقم سے زیادہ نہیں ہو سکتی۔'))" },
    { line: 1273, find: "— ${classText} • ${classDuesMonth} ${classDuesYear} — Dues mein pending hai`", replace: "— ${classText} • ${classDuesMonth} ${classDuesYear} — ${L('pending in Dues', 'Dues میں باقی')}`" },
    { line: 1275, find: "— collect amount 0 tha, Dues mein pending hai`", replace: "— ${L('collect amount was 0, pending in Dues', 'وصول رقم 0 تھی، Dues میں باقی ہے')}`" },
    { line: 1277, find: "const pendingText = collected < amount ? ` • har student ka PKR ${(amount - collected).toLocaleString()} pending` : ' — FULLY PAID ✓';", replace: "const pendingText = collected < amount ? L(` • PKR ${(amount - collected).toLocaleString()} pending per student`, ` • ہر طالب علم کا PKR ${(amount - collected).toLocaleString()} باقی`) : L(' — FULLY PAID ✓', ' — مکمل ادا ✓');" },
    { line: 1292, find: "toast.error('Amount enter karein (PKR).')", replace: "toast.error(L('Enter an amount (PKR).', 'رقم درج کریں (PKR)۔'))" },
    { line: 1352, find: "toast.error('Due entry nahi mili.')", replace: "toast.error(L('Due entry not found.', 'باقی کی انٹری نہیں ملی۔'))" },
    { line: 1376, find: "` — PKR ${newRemaining.toLocaleString()} pending` : ' — DUE FULLY PAID ✓'", replace: "L(` — PKR ${newRemaining.toLocaleString()} pending`, ` — PKR ${newRemaining.toLocaleString()} باقی`) : L(' — DUE FULLY PAID ✓', ' — باقی مکمل ادا ✓')" },
    { line: 1386, find: "toast.error('Allocation fail — base fee ya amount check karein.')", replace: "toast.error(L('Allocation failed — check the base fee or the amount.', 'تقسیم ناکام — بنیادی فیس یا رقم چیک کریں۔'))" },
    { line: 3146, find: "title={pins.includes(item.id) ? 'Pin hatayein' : 'Pin karein'}", replace: "title={pins.includes(item.id) ? L('Unpin', 'پن ہٹائیں') : L('Pin', 'پن کریں')}" },
    { line: 3147, find: "aria-label={pins.includes(item.id) ? 'Pin hatayein' : 'Pin karein'}", replace: "aria-label={pins.includes(item.id) ? L('Unpin', 'پن ہٹائیں') : L('Pin', 'پن کریں')}" },
    { line: 4754, find: "title={`Class ${className} ke students ko Due/Paper Fund lagayein ya collect karein`}", replace: "title={L(`Apply a Due/Paper Fund to Class ${className} students, or collect it`, `کلاس ${className} کے طلبہ پر Due/Paper Fund لگائیں یا وصول کریں`)}" },
  ],
};
