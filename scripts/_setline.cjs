/* Generic whole-line setter — odd lines (mojibake/emoji) ke liye.
 * Usage: node scripts/_setline.cjs _setlines.json
 * _setlines.json: [{ "file": "src/components/X.tsx", "line": 12, "text": "..." }, ...]
 * `line` 1-based. Har entry descending order mein apply hoti hai.
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('json file name do (e.g. _setlines.json)');
  process.exit(1);
}
const root = path.join(__dirname, '..');
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));

const byFile = new Map();
for (const r of rules) {
  if (!byFile.has(r.file)) byFile.set(r.file, []);
  byFile.get(r.file).push(r);
}

let done = 0;
for (const [rel, list] of byFile) {
  const abs = path.join(root, rel);
  let raw = fs.readFileSync(abs, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff ? '\uFEFF' : '';
  if (bom) raw = raw.slice(1);
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(eol);
  for (const r of [...list].sort((a, b) => b.line - a.line)) {
    if (r.line < 1 || r.line > lines.length) {
      console.log(`MISS ${rel}:${r.line} — range se bahar`);
      continue;
    }
    lines[r.line - 1] = r.text;
    done++;
  }
  fs.writeFileSync(abs, bom + lines.join(eol), 'utf8');
}
console.log(`SET LINES: ${done}`);
