/* TEMP — batch D: StudentDashboard pin + gemini.ts runtime errors + console messages */
module.exports = {
  'src/components/StudentDashboard.tsx': [
    { line: 634, find: "title={isPinned ? (lang === 'ur' ? 'پن ہٹائیں' : 'Pin hatayein') : (lang === 'ur' ? 'پن کریں' : 'Pin karein')}", replace: "title={isPinned ? L('Unpin', 'پن ہٹائیں') : L('Pin', 'پن کریں')}" },
  ],
  'src/lib/gemini.ts': [
    { line: 63, find: "'AI disabled — Settings → \"AI API Key\" mein Google AI Studio se free key add karein (aistudio.google.com)'", replace: "L('AI is disabled — add a free key from Google AI Studio in Settings → \"AI API Key\" (aistudio.google.com)', 'AI بند ہے — سیٹنگز → \"AI API Key\" میں Google AI Studio سے مفت کلید شامل کریں (aistudio.google.com)')" },
    { line: 96, find: "'AI ka jawab parse nahi hua — dobara try karein'", replace: "L('Could not parse the AI response — please try again', 'AI کا جواب سمجھ نہیں آیا — دوبارہ کوشش کریں')" },
    { line: 173, find: "'Pehle chapter text paste karein ya book pages upload karein'", replace: "L('Paste the chapter text first, or upload book pages', 'پہلے باب کا متن پیسٹ کریں یا کتاب کے صفحات اپ لوڈ کریں')" },
    { line: 187, find: "'AI ne koi question generate nahi kiya — source content check karein'", replace: "L('AI generated no questions — check the source content', 'AI نے کوئی سوال نہیں بنایا — ماخذ مواد چیک کریں')" },
    { line: 214, find: "'Pehle content dein — text paste karein ya book pages upload karein'", replace: "L('Add the content first — paste text or upload book pages', 'پہلے مواد دیں — متن پیسٹ کریں یا کتاب کے صفحات اپ لوڈ کریں')" },
    { line: 225, find: "'AI ne MCQs generate nahi kiye — content check karein'", replace: "L('AI generated no MCQs — check the content', 'AI نے MCQs نہیں بنائے — مواد چیک کریں')" },
  ],
  'src/App.tsx': [
    { line: 379, find: "\"Supabase records khali — initial datasets seed kar rahe hain...\"", replace: "\"Supabase records are empty — seeding initial datasets...\"" },
  ],
  'src/lib/geoUtils.ts': [
    { line: 27, find: "'[Geo] Browser geolocation available nahi (HTTPS/localhost wala experiment).'", replace: "'[Geo] Browser geolocation is not available (requires HTTPS/localhost).'" },
  ],
  'src/lib/supabaseSync.ts': [
    { line: 131, find: "`[Supabase] table \"${table}\" missing — SQL Editor mein scripts/supabase-schema.sql chalayein.`", replace: "`[Supabase] table \"${table}\" is missing — run scripts/supabase-schema.sql in the SQL Editor.`" },
  ],
  'src/supabase.ts': [
    { line: 49, find: "'[Supabase] VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY missing in .env — client placeholder par hai. Demo/local mode theek chalega; live sync ke liye .env set karein.'", replace: "'[Supabase] VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY missing in .env — the client is using a placeholder. Demo/local mode will work; set .env for live sync.'" },
    { line: 67, find: "'[Supabase] tables missing — SQL Editor mein scripts/supabase-schema.sql chalayein.'", replace: "'[Supabase] tables are missing — run scripts/supabase-schema.sql in the SQL Editor.'" },
  ],
};
