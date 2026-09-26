/* Phase 3 — TeacherDashboard batch 9: timetable / schedule tab */
module.exports = {
  'src/components/TeacherDashboard.tsx': [
    { line: 4105, find: "My Schedule", replace: "{L('My Schedule', 'میرا شیڈول')}" },
    { line: 4111, find: "Class Schedule", replace: "{L('Class Schedule', 'کلاس شیڈول')}" },
    { line: 4118, find: ">Select Class:</span>", replace: ">{L('Select Class', 'کلاس منتخب کریں')}:</span>" },
    { line: 4133, find: ">Select Day:</span>", replace: ">{L('Select Day', 'دن منتخب کریں')}:</span>" },
    { line: 4140, find: "{d}{d === currentDayName ? ' (Today)' : ''}", replace: "{d}{d === currentDayName ? ` (${L('Today', 'آج')})` : ''}" },
    { line: 4144, find: "} Lecture(s) on {scheduleDay}", replace: "} {L('Lecture(s) on', 'لیکچر —')} {scheduleDay}" },
    { line: 4157, find: "Weekday", replace: "{L('Weekday', 'ہفتے کا دن')}" },
    { line: 4185, find: "No Lecture", replace: "{L('No Lecture', 'کوئی لیکچر نہیں')}" },
    { line: 4218, find: "LIVE", replace: "{L('LIVE', 'جاری')}" },
    { line: 4223, find: "👤 Teacher: {getTeacherName(entry.teacherId)}", replace: "👤 {L('Teacher', 'استاد')}: {getTeacherName(entry.teacherId)}" },
    { line: 4249, find: ">No Lectures on {scheduleDay}</p>", replace: ">{L('No Lectures on', 'کوئی لیکچر نہیں —')} {scheduleDay}</p>" },
    { line: 4250, find: ">You have no classes scheduled for this day.</p>", replace: ">{L('You have no classes scheduled for this day.', 'اس دن آپ کی کوئی کلاس مقرر نہیں۔')}</p>" },
  ],
};
