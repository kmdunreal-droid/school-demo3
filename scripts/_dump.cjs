/* TEMP — exact line dumper (non-ASCII ko \uXXXX karke print karta hai) */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
const nums = process.argv.slice(3).map(Number);
const raw = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/^\uFEFF/, '');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const lines = raw.split(eol);
for (const n of nums) {
  let s = JSON.stringify(lines[n - 1] ?? '<<MISSING>>');
  s = s.replace(/[\u0080-\uFFFF]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  console.log(n + '|' + s);
}
