/* Phase 1 batch — LandingPage.tsx part 1b (trust strip + academic bento) */
module.exports = {
  'src/components/LandingPage.tsx': [
    { line: 277, find: "label: 'Safe Campus', sub: '24/7 Security'", replace: "label: L('Safe Campus', 'محفوظ کیمپس'), sub: L('24/7 Security', '24/7 سیکیورٹی')" },
    { line: 278, find: "label: 'Certified Faculty', sub: 'Advanced Credentials'", replace: "label: L('Certified Faculty', 'تصدیق شدہ اساتذہ'), sub: L('Advanced Credentials', 'اعلیٰ اہلیت')" },
    { line: 279, find: "label: 'Digital Ledger', sub: 'Real-time Tracking'", replace: "label: L('Digital Ledger', 'ڈیجیٹل ریکارڈ'), sub: L('Real-time Tracking', 'ریئل ٹائم ٹریکنگ')" },
    { line: 280, find: "label: 'Global Curriculum', sub: 'Modern Standards'", replace: "label: L('Global Curriculum', 'عالمی نصاب'), sub: L('Modern Standards', 'جدید معیارات')" },
    { line: 306, find: '>Academic Streams</h2>', replace: ">{L('Academic Streams', 'تعلیمی شاخیں')}</h2>" },
    { line: 308, find: 'Curated Programs for<br/>', replace: "{L('Curated Programs for', 'نمایاں پروگرام')}<br/>" },
    { line: 309, find: 'Every Stage of Growth.', replace: "{L('Every Stage of Growth.', 'ہر ترقی کے مرحلے کے لیے۔')}" },
    { line: 311, find: 'From foundational primary education to advanced matriculation prep, we provide the environment for students to excel.', replace: "{L('From foundational primary education to advanced matriculation prep, we provide the environment for students to excel.', 'بنیادی پرائمری تعلیم سے اعلیٰ میٹرک تیاری تک — ہم طلبہ کے کامیاب ہونے کے لیے ماحول فراہم کرتے ہیں۔')}" },
    { line: 326, find: '>Primary Foundation</h4>', replace: ">{L('Primary Foundation', 'بنیادی پرائمری')}</h4>" },
    { line: 328, find: 'Cultivating literacy, numeracy, and critical thinking skills in a vibrant, supportive environment for Grades 1 through 8.', replace: "{L('Cultivating literacy, numeracy, and critical thinking skills in a vibrant, supportive environment for Grades 1 through 8.', 'جماعت 1 سے 8 تک پڑھنے لکھنے، حساب اور تنقیدی سوچ کی مہارتیں — ایک فعال اور مددگار ماحول میں۔')}" },
    { line: 332, find: '>Grades 1-8</span>', replace: ">{L('Grades 1-8', 'جماعتیں 1-8')}</span>" },
    { line: 353, find: '>Secondary Excellence</h4>', replace: ">{L('Secondary Excellence', 'ثانوی مہارت')}</h4>" },
    { line: 355, find: 'Intensive matriculation preparation with a focus on science, mathematics, and high-performance laboratory work.', replace: "{L('Intensive matriculation preparation with a focus on science, mathematics, and high-performance laboratory work.', 'سائنس، ریاضی اور لیبارٹری کام پر توجہ کے ساتھ شدید میٹرک تیاری۔')}" },
    { line: 359, find: '>Science / Arts Streams</div>', replace: ">{L('Science / Arts Streams', 'سائنس / آرٹس شاخیں')}</div>" },
    { line: 361, find: 'Explore Matrix <ArrowRight size={14} />', replace: "{L('Explore Matrix', 'ڈھانچہ دیکھیں')} <ArrowRight size={14} />" },
    { line: 376, find: '{schoolName} Prep</h4>', replace: "{schoolName} {L('Prep', 'تیاری')}</h4>" },
    { line: 378, find: 'Specialized evening coaching designed for conceptual mastery and top-tier board exam results.', replace: "{L('Specialized evening coaching designed for conceptual mastery and top-tier board exam results.', 'تصوری مہارت اور بہترین بورڈ نتائج کے لیے مخصوص شام کی کوچنگ۔')}" },
    { line: 382, find: "['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer'].map(sub => (", replace: "[L('Physics', 'فزکس'), L('Chemistry', 'کیمیسٹری'), L('Biology', 'بائیولوجی'), L('Mathematics', 'ریاضی'), L('Computer', 'کمپیوٹر')].map(sub => (" },
  ],
};