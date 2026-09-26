/* Phase 3 — TeacherDashboard batch 13: attendance list header + monthly overview */
module.exports = {
  'src/components/TeacherDashboard.tsx': [
    { line: 2501, find: ">Roll #</th>", replace: ">{L('Roll #', 'رول نمبر')}</th>" },
    { line: 2502, find: ">Student Profile</th>", replace: ">{L('Student Profile', 'طالب علم پروفائل')}</th>" },
    { line: 2503, find: ">Status Toggle</th>", replace: ">{L('Status Toggle', 'حاضری تبدیل کریں')}</th>" },
    { line: 4384, find: "/> Monthly Overview</h3>", replace: "/> {L('Monthly Overview', 'ماہانہ جائزہ')}</h3>" },
  ],
};
