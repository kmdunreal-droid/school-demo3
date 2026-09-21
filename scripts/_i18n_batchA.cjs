/* TEMP — batch A: QuizModule, SmartTaskPanel, NoticeBoard, EventsCalendar */
module.exports = {
  'src/components/QuizModule.tsx': [
    { line: 88, find: "Online tests — turant result ke sath", replace: "L('Online tests — with instant results', 'آن لائن ٹیسٹ — فوری نتیجے کے ساتھ')" },
    { line: 245, find: "'Quiz cancel karna hai? Progress save nahi hoga.'", replace: "L('Cancel this quiz? Progress will not be saved.', 'کوئز منسوخ کرنی ہے؟ پیش رفت محفوظ نہیں ہوگی۔')" },
    { line: 285, find: "MCQ tests banayein · AI se generate karein · auto-grading", replace: "L('Create MCQ tests · generate with AI · auto-grading', 'MCQ ٹیسٹ بنائیں · AI سے بنوائیں · خودکار جانچ')" },
    { line: 299, find: "publish ? 'Quiz publish ho gaya — students ko dikhega! 🚀' : 'Quiz draft save ho gaya'", replace: "publish ? L('Quiz published — students can see it! 🚀', 'کوئز شائع ہو گئی — طلبہ دیکھ سکیں گے! 🚀') : L('Quiz saved as a draft', 'کوئز ڈرافٹ میں محفوظ ہو گئی')" },
    { line: 314, find: "Koi quiz nahi — \"New Quiz\" se shuru karein", replace: "L('No quizzes yet — start with \"New Quiz\"', 'ابھی کوئی کوئز نہیں — \"New Quiz\" سے شروع کریں')" },
    { line: 343, find: "next === 'published' ? 'Quiz publish ho gaya 🚀' : 'Quiz draft mein wapas'", replace: "next === 'published' ? L('Quiz published 🚀', 'کوئز شائع ہو گئی 🚀') : L('Quiz moved back to draft', 'کوئز دوبارہ ڈرافٹ میں')" },
    { line: 351, find: "`\"${q.title}\" delete karna hai? Iske attempts bhi delete honge.`", replace: "L(`Delete \"${q.title}\"? Its attempts will also be deleted.`, `\"${q.title}\" حذف کرنی ہے؟ اس کی کوششیں بھی حذف ہو جائیں گی۔`)" },
    { line: 355, find: "'Quiz delete ho gaya'", replace: "L('Quiz deleted', 'کوئز حذف ہو گئی')" },
    { line: 408, find: "'Pehle chapter/lesson ka text paste karein'", replace: "L('Paste the chapter/lesson text first', 'پہلے باب/سبق کا متن پیسٹ کریں')" },
    { line: 423, find: "`${mapped.length} AI MCQs add ho gaye! 🤖`", replace: "L(`${mapped.length} AI MCQs added! 🤖`, `${mapped.length} AI MCQs شامل ہو گئے! 🤖`)" },
    { line: 425, find: "e?.message || 'AI generation fail hui'", replace: "e?.message || L('AI generation failed', 'AI سے تیاری ناکام ہوئی')" },
    { line: 432, find: "'Quiz ka title likhein'", replace: "L('Enter a quiz title', 'کوئز کا عنوان لکھیں')" },
    { line: 434, find: "'Kam az kam 1 complete question (question + 2 options) chahiye'", replace: "L('At least 1 complete question (question + 2 options) is required', 'کم از کم 1 مکمل سوال (سوال + 2 آپشن) درکار ہے')" },
    { line: 475, find: "AI se MCQs generate karo", replace: "L('Generate MCQs with AI', 'AI سے MCQs بنوائیں')" },
    { line: 477, find: "aiOn ? 'AI Ready' : 'AI Off (API key nahi)'", replace: "aiOn ? L('AI Ready', 'AI تیار') : L('AI Off (no API key)', 'AI بند (API کلید نہیں)')" },
    { line: 483, find: "Book chapter / lesson ka text paste karein — AI isi se MCQs banayega...", replace: "L('Paste the book chapter / lesson text — AI will build MCQs from it…', 'کتاب کا باب / سبق کا متن پیسٹ کریں — AI اسی سے MCQs بنائے گا…')" },
    { line: 512, find: "Koi question nahi — manually add karein ya AI se generate karein", replace: "L('No questions yet — add manually or generate with AI', 'ابھی کوئی سوال نہیں — خود شامل کریں یا AI سے بنوائیں')" },
    { line: 539, find: "Correct answer set karein", replace: "L('Set the correct answer', 'درست جواب منتخب کریں')" },
    { line: 595, find: "Abhi kisi student ne attempt nahi kiya", replace: "L('No student has attempted yet', 'ابھی کسی طالب علم نے کوشش نہیں کی')" },
  ],

  'src/components/SmartTaskPanel.tsx': [
    { line: 62, find: "aria-label=\"Aaj ka kaam\"", replace: "aria-label={L(\"Today's tasks\", 'آج کا کام')}" },
    { line: 72, find: "Aaj ka Kaam", replace: "{L(\"Today's tasks\", 'آج کا کام')}" },
    { line: 76, find: "'Sab clear hai — kuch pending nahi'", replace: "L('All clear — nothing pending', 'سب ٹھیک ہے — کچھ باقی نہیں')" },
    { line: 77, find: "`${tasks.length} kaam aap ka intezar kar rahe hain`", replace: "L(`${tasks.length} task(s) waiting for you`, `${tasks.length} کام آپ کا انتظار کر رہے ہیں`)" },
  ],

  'src/components/NoticeBoard.tsx': [
    { line: 46, find: "'Title aur message dono zaroori hain'", replace: "L('Both title and message are required', 'عنوان اور پیغام دونوں ضروری ہیں')" },
    { line: 62, find: "'Notice publish ho gaya! 📢'", replace: "L('Notice published! 📢', 'اعلان شائع ہو گیا! 📢')" },
    { line: 72, find: "School announcements — sab portals par live", replace: "L('School announcements — live on all portals', 'اسکول کے اعلانات — تمام پورٹلز پر دستیاب')" },
    { line: 154, find: "'Notice delete ho gaya'", replace: "L('Notice deleted', 'اعلان حذف ہو گیا')" },
  ],

  'src/components/EventsCalendar.tsx': [
    { line: 60, find: "'Title aur date dono zaroori hain'", replace: "L('Both title and date are required', 'عنوان اور تاریخ دونوں ضروری ہیں')" },
    { line: 74, find: "'Calendar mein add ho gaya! 📅'", replace: "L('Added to calendar! 📅', 'کیلنڈر میں شامل ہو گیا! 📅')" },
    { line: 153, find: ">Koi event nahi<", replace: ">{L('No events', 'کوئی ایونٹ نہیں')}<" },
    { line: 167, find: "'Event delete ho gaya'", replace: "L('Event deleted', 'ایونٹ حذف ہو گیا')" },
  ],
};
