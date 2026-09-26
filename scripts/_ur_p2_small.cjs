/* Phase 2 — NoticeBoard, EventsCalendar, AttendanceSwipeOverlay, HoldActionWrapper */
module.exports = {
  'src/components/NoticeBoard.tsx': [
    { line: 103, find: '>Normal</option>', replace: ">{L('Normal', 'عام')}</option>" },
    { line: 104, find: '>Important</option>', replace: ">{L('Important', 'اہم')}</option>" },
    { line: 105, find: '>Urgent</option>', replace: ">{L('Urgent', 'فوری')}</option>" },
    { line: 108, find: '>Everyone</option>', replace: ">{L('Everyone', 'سب')}</option>" },
    { line: 109, find: '>Teachers Only</option>', replace: ">{L('Teachers Only', 'صرف اساتذہ')}</option>" },
    { line: 110, find: '>Students Only</option>', replace: ">{L('Students Only', 'صرف طلبہ')}</option>" },
    { line: 113, find: 'Publish', replace: "{L('Publish', 'شائع کریں')}" },
  ],
  'src/components/EventsCalendar.tsx': [
    { line: 152, find: '>Upcoming</h3>', replace: ">{L('Upcoming', 'آئندہ اوقات')}</h3>" },
  ],
  'src/components/AttendanceSwipeOverlay.tsx': [
    { line: 35, find: '>Attendance Details</h2>', replace: ">{L('Attendance Details', 'حاضری کی تفصیل')}</h2>" },
  ],
  'src/components/HoldActionWrapper.tsx': [
    { line: 48, find: ' Detail', replace: " {L('Detail', 'تفصیل')}" },
    { line: 61, find: ' Edit', replace: " {L('Edit', 'ترمیم')}" },
    { line: 74, find: ' Delete', replace: " {L('Delete', 'حذف')}" },
  ],
};