/* TEMP — batch B3: AttendanceSettingsSection */
module.exports = {
  'src/components/AttendanceSettingsSection.tsx': [
    { line: 36, find: "? 'GPS-restricted check-in ON — teachers sirf school radius ke andar se check-in kar sakte hain.'", replace: "? L('GPS-restricted check-in ON — teachers can check in only inside the school radius.', 'GPS محدود حاضری آن — اساتذہ صرف اسکول کے دائرے میں حاضری لگا سکتے ہیں۔')" },
    { line: 37, find: ": 'GPS-restricted check-in OFF — teachers kisi bhi location se check-in kar sakte hain.');", replace: ": L('GPS-restricted check-in OFF — teachers can check in from any location.', 'GPS محدود حاضری آف — اساتذہ کسی بھی جگہ سے حاضری لگا سکتے ہیں۔'));" },
    { line: 42, find: "toast.error('Is browser mein geolocation available nahi hai.');", replace: "toast.error(L('Geolocation is not available in this browser.', 'اس براؤزر میں لوکیشن دستیاب نہیں۔'));" },
    { line: 51, find: "toast.success('Current location mil gayi — Save Location dabakar confirm karein.');", replace: "toast.success(L('Current location found — press Save Location to confirm.', 'موجودہ مقام مل گیا — تصدیق کے لیے Save Location دبائیں۔'));" },
    { line: 55, find: "toast.error('Device location nahi mili. Coordinates manually enter karein (Google Maps se copy karein).');", replace: "toast.error(L('Device location not found. Enter the coordinates manually (copy from Google Maps).', 'ڈیوائس کی لوکیشن نہیں ملی۔ کوآرڈینیٹس خود درج کریں (گوگل میپس سے کاپی کریں)۔'));" },
    { line: 66, find: "toast.error('Valid Latitude (-90..90) aur Longitude (-180..180) enter karein.');", replace: "toast.error(L('Enter a valid Latitude (-90..90) and Longitude (-180..180).', 'درست Latitude (-90..90) اور Longitude (-180..180) درج کریں۔'));" },
    { line: 70, find: "toast.error('Valid Radius (meters) enter karein — minimum 1 m.');", replace: "toast.error(L('Enter a valid radius in meters — minimum 1 m.', 'درست رداس (میٹر میں) درج کریں — کم از کم 1 میٹر۔'));" },
    { line: 83, find: "toast.success('Attendance location saved — teachers ka GPS radius ab naye coordinates se check hoga.');", replace: "toast.success(L('Attendance location saved — teacher GPS will now be checked against the new coordinates.', 'حاضری کا مقام محفوظ ہو گیا — اساتذہ کا GPS اب نئے کوآرڈینیٹس سے جانچا جائے گا۔'));" },
    { line: 102, find: "Teacher check-in ka verification yahan se control hota hai.", replace: "{L('Teacher check-in verification is controlled here.', 'اساتذہ کی حاضری کی تصدیق یہاں سے کنٹرول ہوتی ہے۔')}" },
    { line: 125, find: "? 'Teachers sirf school radius ke ANDAR se check-in kar sakte hain.'", replace: "? L('Teachers can check in only INSIDE the school radius.', 'اساتذہ صرف اسکول کے دائرے کے اندر حاضری لگا سکتے ہیں۔')" },
    { line: 126, find: ": 'Teachers kisi bhi location se check-in kar sakte hain (manual allowance).'}", replace: ": L('Teachers can check in from any location (manual allowance).', 'اساتذہ کسی بھی جگہ سے حاضری لگا سکتے ہیں (دستی اجازت)۔')}" },
    { line: 144, find: "Teacher check-in sirf is location ke radius ke ANDAR hota hai. Coordinates Google Maps se copy karein.", replace: "{L('Teacher check-in works only INSIDE this radius. Copy the coordinates from Google Maps.', 'اساتذہ کی حاضری صرف اسی دائرے کے اندر قبول ہوتی ہے۔ کوآرڈینیٹس گوگل میپس سے کاپی کریں۔')}" },
    { line: 207, find: "Check-in sirf school ke andar se hoga</>", replace: "{L('Check-in only from inside the school', 'حاضری صرف اسکول کے اندر سے')}</>" },
    { line: 209, find: "Check-in kisi bhi location se ho sakta hai</>", replace: "{L('Check-in allowed from any location', 'حاضری کسی بھی جگہ سے ممکن ہے')}</>" },
  ],
};
