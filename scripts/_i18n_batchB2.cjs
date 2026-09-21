/* TEMP — batch B2: AiSettingsSection, AnalyticsTab */
module.exports = {
  'src/components/AiSettingsSection.tsx': [
    { line: 23, find: "toast.error('Pehle API key paste karein — aistudio.google.com se free mein milti hai.');", replace: "toast.error(L('Paste the API key first — it is free at aistudio.google.com.', 'پہلے API کلید پیسٹ کریں — یہ aistudio.google.com پر مفت ملتی ہے۔'));" },
    { line: 29, find: "toast.success('✅ Gemini API key saved! AI features ab enabled hain.');", replace: "toast.success(L('✅ Gemini API key saved! AI features are now enabled.', '✅ Gemini API کلید محفوظ ہو گئی! AI فیچرز اب فعال ہیں۔'));" },
    { line: 31, find: "toast.error('Key save nahi hui — localStorage block ho sakta hai.');", replace: "toast.error(L('Key was not saved — localStorage may be blocked.', 'کلید محفوظ نہیں ہوئی — localStorage بلاک ہو سکتا ہے۔'));" },
    { line: 40, find: "toast.success('API key remove kar di gayi. AI features ab disabled hain.');", replace: "toast.success(L('API key removed. AI features are now disabled.', 'API کلید ہٹا دی گئی۔ AI فیچرز اب بند ہیں۔'));" },
    { line: 45, find: "toast.error('Pehle API key paste karein (Save karne ki zaroorat nahi).');", replace: "toast.error(L('Paste the API key first (no need to save).', 'پہلے API کلید پیسٹ کریں (محفوظ کرنے کی ضرورت نہیں)۔'));" },
    { line: 54, find: "if (ok) toast.success('✅ AI connection OK — key valid hai! Features ready hain.');", replace: "if (ok) toast.success(L('✅ AI connection OK — the key is valid! Features are ready.', '✅ AI کنکشن درست — کلید معتبر ہے! فیچرز تیار ہیں۔'));" },
    { line: 55, find: "else toast.error('⚠️ AI ne koi response nahi diya — key/model check karein.');", replace: "else toast.error(L('⚠️ AI gave no response — check the key/model.', '⚠️ AI نے کوئی جواب نہیں دیا — کلید/ماڈل چیک کریں۔'));" },
    { line: 57, find: "toast.error(`❌ AI test failed: ${err?.message || 'Invalid key ya network issue'}`);", replace: "toast.error(L(`❌ AI test failed: ${err?.message || 'Invalid key or network issue'}`, `❌ AI ٹیسٹ ناکام: ${err?.message || 'کلید غلط یا نیٹ ورک کا مسئلہ'}`));" },
    { line: 78, find: "Settings se AI key enter karein — .env edit karne ki zaroorat nahi.", replace: "{L('Enter the AI key from Settings — no need to edit .env.', 'سیٹنگز سے AI کلید درج کریں — .env میں تبدیلی کی ضرورت نہیں۔')}" },
    { line: 87, find: "<><CheckCircle2 size={13} /> AI Ready — {aiModelName()}</>", replace: "<>{<CheckCircle2 size={13} />}{L('AI Ready', 'AI تیار')} — {aiModelName()}</>" },
    { line: 89, find: "<><XCircle size={13} /> AI Off — key add karein</>", replace: "<>{<XCircle size={13} />}{L('AI Off — add a key', 'AI بند — کلید شامل کریں')}</>" },
    { line: 177, find: "Key sirf <strong>is browser ke localStorage</strong> mein hoti hai (cloud/Supabase sync <strong>nahi</strong> hoti).", replace: "{L('The key is stored only in ', 'کلید صرف ')}<strong>{L(\"this browser's localStorage\", 'اسی براؤزر کے localStorage')}</strong>{L('. It does ', ' میں محفوظ رہتی ہے۔ یہ ')}<strong>{L('not', 'نہیں')}</strong>{L(' sync to cloud/Supabase.', ' کلاؤڈ/Supabase سے ہم آہنگ ہوتی۔')}" },
    { line: 178, find: "Save karne ke baad <strong>AI Paper Generator</strong>, <strong>MCQ Generator</strong> aur <strong>Student Remarks</strong> — teeno features isi waqt enabled ho jate hain. Koi feature \"AI Off\" dikhe to Settings tab kholein aur key enter karein.", replace: "{L('After saving, ', 'محفوظ کرنے کے بعد ')}<strong>AI Paper Generator</strong>{L(', ', '، ')}<strong>MCQ Generator</strong>{L(' and ', ' اور ')}<strong>Student Remarks</strong>{L(' — all three features become active at once. If a feature shows \"AI Off\", open the Settings tab and enter the key.', ' — تینوں فیچرز فوراً فعال ہو جاتے ہیں۔ اگر کوئی فیچر \"AI Off\" دکھائے تو سیٹنگز ٹیب کھول کر کلید درج کریں۔')}" },
  ],

  'src/components/AnalyticsTab.tsx': [
    { line: 168, find: ">Marks data nahi hai<", replace: ">{L('No marks data', 'نمبروں کا ڈیٹا نہیں')}<" },
    { line: 188, find: ">Sab students theek hain ✅<", replace: ">{L('All students are fine ✅', 'تمام طلبہ ٹھیک ہیں ✅')}<" },
    { line: 193, find: "'phone nahi'", replace: "L('no phone', 'فون نمبر نہیں')" },
    { line: 218, find: "toast.error('Pehle student select karein')", replace: "toast.error(L('Select a student first', 'پہلے طالب علم منتخب کریں'))" },
    { line: 234, find: "e?.message || 'AI fail hui'", replace: "e?.message || L('AI failed', 'AI ناکام رہا')" },
    { line: 245, find: "{aiOn ? 'Gemini Free' : 'API key nahi'}", replace: "{aiOn ? L('Gemini Free', 'Gemini مفت') : L('No API key', 'API کلید نہیں')}" },
    { line: 250, find: ">Student select karein...<", replace: ">{L('Select a student...', 'طالب علم منتخب کریں…')}<" },
    { line: 264, find: "{loading ? 'AI likh raha hai...' : 'Generate Remark'}", replace: "{loading ? L('AI is writing…', 'AI لکھ رہا ہے…') : L('Generate Remark', 'ریمارکس بنائیں')}" },
    { line: 276, find: "toast.success('Copy ho gaya!')", replace: "toast.success(L('Copied!', 'کاپی ہو گیا!'))" },
    { line: 285, find: "💡 Free key: aistudio.google.com → Settings → \"AI API Key\" mein paste karein", replace: "{L('💡 Free key: aistudio.google.com → Settings → paste in \"AI API Key\"', '💡 مفت کلید: aistudio.google.com → سیٹنگز → \"AI API Key\" میں پیسٹ کریں')}" },
    { line: 302, find: "{aiOn ? '🤖 AI remarks Ready' : 'AI Off (API key nahi)'}", replace: "{aiOn ? L('🤖 AI remarks ready', '🤖 AI ریمارکس تیار') : L('AI Off (no API key)', 'AI بند (API کلید نہیں)')}" },
  ],
};
