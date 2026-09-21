/* TEMP — batch C4: PrincipalDashboard (clickable titles) */
module.exports = {
  'src/components/PrincipalDashboard.tsx': [
    { line: 5969, find: "title=\"Click karein — Fee Payment Center khulega\"", replace: "title={L('Click — opens the Fee Payment Center', 'کلک کریں — فیس سینٹر کھلے گا')}" },
    { line: 5974, find: "title=\"Click karein — Fee Payment Center khulega\"", replace: "title={L('Click — opens the Fee Payment Center', 'کلک کریں — فیس سینٹر کھلے گا')}" },
    { line: 6049, find: "title={d.pending > 0 ? 'Click karein — Fee Payment Center se pay karein' : undefined}", replace: "title={d.pending > 0 ? L('Click — pay from the Fee Payment Center', 'کلک کریں — فیس سینٹر سے ادائیگی کریں') : undefined}" },
  ],
};
