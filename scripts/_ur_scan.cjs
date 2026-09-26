/* TEMP — Urdu-coverage scanner: English UI strings dhoond kar file:line list karta hai.
 * Usage: node scripts/_ur_scan.cjs [nameFilter]   → _scan_out.txt
 * Patterns: JSX inline text, bare text lines, toasts/alerts/confirm, placeholders,
 * aria-label/title, ternary label strings. L(/t( wale lines exclude.
 */
const fs = require('fs');
const path = require('path');

const filter = (process.argv[2] || '').toLowerCase();
const roots = ['src/App.tsx', 'src/components'];
const files = [];
for (const r of roots) {
  const p = path.join(__dirname, '..', r);
  if (!fs.existsSync(p)) continue;
  const st = fs.statSync(p);
  if (st.isFile()) { files.push(p); continue; }
  for (const e of fs.readdirSync(p, { withFileTypes: true }))
    if (e.isFile() && /\.tsx$/.test(e.name)) files.push(path.join(p, e.name));
}

const out = [];
let total = 0;
console.log('files found:', files.length, files.slice(0, 5).map((f) => path.basename(f)).join(', '));
for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
  if (filter && !rel.toLowerCase().includes(filter)) continue;
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  const hits = [];
  let inImport = false;
  lines.forEach((ln, i) => {
    const t = ln.trim();
    if (inImport) {
      if (t.includes('}')) inImport = false;
      return;
    }
    if (/^import\b[^;]*\{/.test(t) && !t.includes('}')) inImport = true;
    if (!t) return;
    if (/^(\/\/|\/\*|\*|\{\/\*)/.test(t)) return;
    if (/[\u0600-\u06FF]/.test(ln)) return;             // already has Urdu
    if (/^(import|export)\s/.test(t)) return;
    if (/console\./.test(t)) return;
    if (/\bL\(|\bt\('/.test(t)) return;                 // already bilingual
    const jsxInline = />[^<>{}]*[A-Za-z][^<>{}]{3,}<\/[a-z]/.test(t) || />[A-Za-z][A-Za-z0-9'&,.!? -]{4,}<\s*[/{]/.test(t);
    const bareText = /^[A-Z][A-Za-z0-9'&,.!? -]+$/.test(t) && t.length > 6
      && !/^(import|export|const|let|var|type|interface|return|default|case|async|await)\b/.test(t);
    const quotes = /(toast\.(success|error|info|warning)|confirm|alert)\s*\(\s*[`'"][A-Za-z]/.test(t)
      || /placeholder="[A-Za-z]/.test(t)
      || /aria-label="[A-Z]/.test(t)
      || /title="[A-Z][a-z]+ /.test(t)
      || /\?\s*'[A-Z][a-z]+/.test(t)
      || /:\s*'[A-Z][a-z]+ [A-Za-z ]{3,}'/.test(t);
    if (jsxInline || bareText || quotes) hits.push(`  ${i + 1}: ${t.slice(0, 220)}`);
  });
  if (hits.length) { total += hits.length; out.push(`\n=== ${rel} (${hits.length}) ===`, ...hits); }
}
out.push(`\nTOTAL: ${total}`);
fs.writeFileSync(path.join(__dirname, '..', '_scan_out.txt'), out.join('\n'), 'utf8');
console.log('TOTAL: ' + total);