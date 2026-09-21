/* TEMP — batch B1: AiPaperGenerator */
module.exports = {
  'src/components/AiPaperGenerator.tsx': [
    { line: 59, find: "toast.error('Camera nahi mili — is device/ browser mein camera support nahi hai')", replace: "toast.error(L('Camera not found — this device/browser does not support camera', 'کیمرہ نہیں ملا — اس ڈیوائس/براؤزر میں کیمرہ سپورٹ نہیں'))" },
    { line: 73, find: "toast.success(`Camera khul gaya (${cameraType === 'front' ? 'front' : 'rear'} lens)`)", replace: "toast.success(L(`Camera opened (${cameraType === 'front' ? 'front' : 'rear'} lens)`, `کیمرہ کھل گیا (${cameraType === 'front' ? 'سامنے' : 'پچھلا'} لینس)`))" },
    { line: 76, find: "toast.error('Camera open nahi hui — permission check karein ya doosra device try karein')", replace: "toast.error(L('Camera did not open — allow permission or try another device', 'کیمرہ نہیں کھلا — اجازت دیں یا دوسرا ڈیوائس آزمائیں'))" },
    { line: 91, find: "toast.error('Camera frame ready nahi hai — ek second ruko aur try karein')", replace: "toast.error(L('Camera frame is not ready — wait a second and try again', 'کیمرہ فریم تیار نہیں — ایک لمحہ رکیں اور دوبارہ کوشش کریں'))" },
    { line: 98, find: "toast.error('Canvas capture fail hua')", replace: "toast.error(L('Canvas capture failed', 'تصویر محفوظ نہیں ہو سکی'))" },
    { line: 108, find: "toast.success('Book page ki photo capture ho gayi — file list mein dikhegi')", replace: "toast.success(L('Book page photo captured — it will appear in the file list', 'کتاب کے صفحے کی تصویر محفوظ ہو گئی — فائل فہرست میں دکھے گی'))" },
    { line: 123, find: "toast.success(`${f.name} ka text add ho gaya`)", replace: "toast.success(L(`Text from ${f.name} added`, `${f.name} کا متن شامل ہو گیا`))" },
    { line: 135, find: "toast.error(`${f.name} read nahi hui`)", replace: "toast.error(L(`Could not read ${f.name}`, `${f.name} پڑھی نہیں جا سکی`))" },
    { line: 140, find: "toast.success(`${next.length} file(s) upload ho gayi`)", replace: "toast.success(L(`${next.length} file(s) uploaded`, `${next.length} فائل(یں) اپ لوڈ ہو گئیں`))" },
    { line: 146, find: "toast.error('Book ka content dein — text paste karein ya pages upload karein')", replace: "toast.error(L('Add the book content — paste text or upload pages', 'کتاب کا مواد دیں — متن پیسٹ کریں یا صفحات اپ لوڈ کریں'))" },
    { line: 163, find: "toast.error(e?.message || 'AI paper generation fail hui')", replace: "toast.error(e?.message || L('AI paper generation failed', 'AI سے پرچہ تیار نہیں ہو سکا'))" },
    { line: 184, find: "{ question: 'Naya question...', type: 'short', marks: 5, answer: '' }", replace: "{ question: L('New question...', 'نیا سوال…'), type: 'short', marks: 5, answer: '' }" },
    { line: 242, find: "toast.error('Popup block hai — allow karein')", replace: "toast.error(L('Popup blocked — please allow it', 'پاپ اپ بلاک ہے — اجازت دیں'))" },
    { line: 251, find: "toast.error('Is paper mein MCQs nahi hain')", replace: "toast.error(L('This paper has no MCQs', 'اس پرچے میں MCQs نہیں ہیں'))" },
    { line: 273, find: "toast.success('MCQs Quiz module mein draft ban gaye — Quizzes tab se publish karein! 🚀')", replace: "toast.success(L('MCQs saved as a draft in Quizzes — publish from the Quizzes tab! 🚀', 'MCQs کوئز میں ڈرافٹ بن گئے — کوئز ٹیب سے شائع کریں! 🚀'))" },
    { line: 289, find: "placeholder=\"Chapter ka text paste karein... (ya neeche book pages ki photos/PDF upload karein)\"", replace: "placeholder={L('Paste the chapter text... (or upload book page photos/PDF below)', 'باب کا متن پیسٹ کریں… (یا نیچے کتاب کے صفحات کی تصاویر/PDF اپ لوڈ کریں)')}" },
    { line: 416, find: "{loading ? 'AI paper design kar raha hai...' : 'Generate Paper'}", replace: "{loading ? L('AI is designing the paper…', 'AI پرچہ تیار کر رہا ہے…') : L('Generate Paper', 'پرچہ بنائیں')}" },
    { line: 508, find: "Books ke chapter se exam paper — Gemini AI (free)", replace: "{L('Exam papers from book chapters — Gemini AI (free)', 'کتاب کے ابواب سے پرچہ — Gemini AI (مفت)')}" },
    { line: 511, find: "{aiOn ? '🤖 AI Ready ✓' : '⚠️ AI Off — Settings → AI API Key add karein'}", replace: "{aiOn ? L('🤖 AI Ready ✓', '🤖 AI تیار ✓') : L('⚠️ AI Off — add key in Settings → AI API Key', '⚠️ AI بند — سیٹنگز → AI API Key میں کلید شامل کریں')}" },
  ],
};
