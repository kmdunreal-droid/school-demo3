/* TEMP — batch B4: AttendanceSettingsSection info-note, CertificateTab, FeePaymentCenter */
module.exports = {
  'src/components/AttendanceSettingsSection.tsx': [
    { line: 221, find: "Teacher <strong>My Attendance</strong> tab mein <strong>Check-In</strong> dabata hai — browser ka live GPS", replace: "{L(\"In the teacher's \", 'استاد کے ')}<strong>{L('My Attendance', 'میری حاضری')}</strong>{L(' tab, pressing ', ' ٹیب میں ')}<strong>{L('Check-In', 'حاضری لگائیں')}</strong>{L(\" compares the browser's live GPS\", ' دبانے پر براؤزر کا لائیو GPS')}" },
    { line: 222, find: "school location se compare hota hai (Haversine distance). <strong>GPS Restricted ON</strong> par door hoga to", replace: "{L(' with the school location (Haversine distance). With ', ' اسکول کے مقام سے موازنہ ہوتا ہے۔ ')}<strong>{L('GPS Restricted ON', 'GPS محدود آن')}</strong>{L(', if the distance is too large', ' ہونے پر فاصلہ زیادہ ہو تو')}" },
    { line: 223, find: "check-in block ho jata hai. Device GPS na mile to teacher \"Demo GPS (School Location)\" checkbox use kar sakta hai.", replace: "{L(' check-in is blocked. If the device GPS is unavailable, the teacher can use the \"Demo GPS (School Location)\" checkbox.', ' حاضری بلاک ہو جاتی ہے۔ ڈیوائس GPS نہ ملے تو استاد \"Demo GPS (School Location)\" چیک باکس استعمال کر سکتا ہے۔')}" },
  ],
  'src/components/CertificateTab.tsx': [
    { line: 45, find: "toast.error('Pehle student select karein')", replace: "toast.error(L('Select a student first', 'پہلے طالب علم منتخب کریں'))" },
    { line: 88, find: "toast.error('Popup block hai — allow karein')", replace: "toast.error(L('Popup blocked — please allow it', 'پاپ اپ بلاک ہے — اجازت دیں'))" },
    { line: 91, find: "toast.success('Certificate print window khul gaya!')", replace: "toast.success(L('Certificate print window opened!', 'سرٹیفکیٹ پرنٹ ونڈو کھل گئی!'))" },
    { line: 102, find: "toast.success('Students CSV download ho gayi!')", replace: "toast.success(L('Students CSV downloaded!', 'طلبہ کی CSV ڈاؤن لوڈ ہو گئی!'))" },
    { line: 109, find: "toast.success('Fees CSV download ho gaya!')", replace: "toast.success(L('Fees CSV downloaded!', 'فیس کی CSV ڈاؤن لوڈ ہو گئی!'))" },
    { line: 116, find: "toast.success('Attendance CSV download ho gaya!')", replace: "toast.success(L('Attendance CSV downloaded!', 'حاضری کی CSV ڈاؤن لوڈ ہو گئی!'))" },
    { line: 132, find: "<option value=\"\">Student select karein...</option>", replace: "<option value=\"\">{L('Select a student...', 'طالب علم منتخب کریں…')}</option>" },
    { line: 153, find: "placeholder=\"Extra remarks (optional — Character Certificate ke liye)\"", replace: "placeholder={L('Extra remarks (optional — for the Character Certificate)', 'اضافی ریمارکس (اختیاری — کریکٹر سرٹیفکیٹ کے لیے)')}" },
  ],
  'src/components/FeePaymentCenter.tsx': [
    { line: 151, find: "toast.info('Yeh due already paid hai.');", replace: "toast.info(L('This due is already paid.', 'یہ باقی رقم پہلے ہی ادا ہو چکی ہے۔'));" },
    { line: 165, find: "toast.error('Sahi amount enter karein (PKR).');", replace: "toast.error(L('Enter a valid amount (PKR).', 'درست رقم درج کریں (PKR)۔'));" },
    { line: 255, find: ">Koi student match nahi hua.<", replace: ">{L('No student matched.', 'کوئی طالب علم نہیں ملا۔')}<" },
    { line: 394, find: ">Koi pending due nahi - sab clear ✓<", replace: ">{L('No pending dues — all clear ✓', 'کوئی باقی رقم نہیں — سب ادا ✓')}<" },
    { line: 463, find: ">Is year ke liye koi month data nahi.<", replace: ">{L('No month data for this year.', 'اس سال کے لیے مہینے کا ڈیٹا نہیں۔')}<" },
    { line: 472, find: "note=\"Yeh amount purane pending months (oldest first) mein khud spread ho jayega.\"", replace: "note={L('This amount will auto-spread across the oldest pending months.', 'یہ رقم خود بخود پرانے باقی مہینوں میں تقسیم ہو جائے گی۔')}" },
  ],
};
