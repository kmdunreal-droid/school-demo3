/**
 * TEMP — dump specific file:line contents (UTF-8) for translation batches.
 * node scripts/_pick.cjs
 * Edit TARGETS below as needed.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const TARGETS = {
  'src/components/FeePaymentCenter.tsx': [221, 290, 299, 330, 335, 340, 504],
  'src/components/PrincipalDashboard.tsx': [
    423, 429, 686, 892, 1224, 1225, 1227, 1273, 1275, 1277, 1292, 1325, 1352,
    1386, 3146, 3147, 4754, 5969, 5974, 6049, 6764, 6785, 6937, 7048, 9586,
    10090, 10110, 10574, 10580, 10930, 10972, 10987, 10988, 11001, 11108,
    11405, 11416, 11440, 11444,
  ],
  'src/components/TeacherDashboard.tsx': [4358, 4468],
  'src/components/SmartTaskPanel.tsx': [145, 151],
  'src/components/CommandPalette.tsx': [332],
  'src/lib/gemini.ts': [63, 96, 173, 187, 214, 225],
};

const out = [];
for (const [rel, lines] of Object.entries(TARGETS)) {
  const content = fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);
  out.push(`\n=== ${rel} (${content.length} lines) ===`);
  for (const n of lines) out.push(`${n}| ${content[n - 1] === undefined ? '<<OUT OF RANGE>>' : content[n - 1]}`);
}
fs.writeFileSync(path.join(root, '_pick.txt'), out.join('\n'), 'utf8');
console.log(`WROTE _pick.txt (${out.length} lines)`);
