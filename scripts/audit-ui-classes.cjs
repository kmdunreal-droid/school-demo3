/* eslint-disable */
/**
 * UI class audit — TEMPORARY tooling.
 * Sirf yeh batane ke liye ke kaunsi Tailwind classes app mein kitni baar use hui hain,
 * aur kaunsi "invalid shade" classes hain (jo Tailwind v4 mein exist nahi karti).
 *
 * Run: node scripts/audit-ui-classes.cjs
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const VALID_SHADES = new Set(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
const COLOR_FAMILIES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'teal', 'amber', 'rose', 'red', 'orange',
  'yellow', 'lime', 'green', 'emerald', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
  'fuchsia', 'pink',
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const counts = new Map();
const invalid = new Map();
const files = walk(SRC);
let total = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  // String literals ke andar se saare class-token jaise shabd nikaalo
  const tokens = text.match(/[a-z][a-z0-9:/.[\]()-]*/gi) || [];
  for (const token of tokens) {
    if (!/^[a-z]/.test(token)) continue;
    total++;
    counts.set(token, (counts.get(token) || 0) + 1);

    // invalid shade detect: family-shade jahan shade Tailwind palette mein nahi hai
    const m = token.match(/^([a-z]+)-(\d{2,3})$/);
    if (m && COLOR_FAMILIES.includes(m[1]) && !VALID_SHADES.has(m[2])) {
      const key = `${m[1]}-${m[2]}`;
      invalid.set(key, (invalid.get(key) || 0) + 1);
    }
  }
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

const show = (label, predicate, limit = 60) => {
  const rows = sorted.filter(([k]) => predicate(k)).slice(0, limit);
  console.log(`\n===== ${label} (${rows.length}) =====`);
  for (const [k, v] of rows) console.log(`${String(v).padStart(6)}  ${k}`);
};

console.log(`Scanned files: ${files.length}, tokens: ${total}`);

show('WHITE BACKGROUND SURFACES', (k) => /^bg-white($|\/)/.test(k));
show('SLATE/GRAY TILE BACKGROUNDS', (k) => /^bg-(slate|gray)-(50|100|200)$/.test(k));
show('SLATE/GRAY BORDERS', (k) => /^border-(slate|gray)-(50|100|200|300)$/.test(k));
show('DARK TEXT (slate/gray 900-600)', (k) => /^text-(slate|gray)-(900|800|700|600)$/.test(k));
show('MUTED TEXT (slate/gray 500-300)', (k) => /^text-(slate|gray)-(500|400|300)$/.test(k));
show('TOP 60 CLASS TOKENS OVERALL', () => true);

console.log('\n===== INVALID SHADES (kuch render nahi karte) =====');
[...invalid.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`${String(v).padStart(6)}  ${k}`));
console.log(`Total invalid-shade usages: ${[...invalid.values()].reduce((a, b) => a + b, 0)}`);
