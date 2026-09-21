/* TEMP — diagnose why a batch rule misses: node scripts/_i18ndiag.cjs _i18n_batchC1.cjs 423 */
const fs = require('fs');
const path = require('path');
const batch = require(path.join(__dirname, process.argv[2]));
const root = path.join(__dirname, '..');
const only = process.argv[3] ? Number(process.argv[3]) : null;

for (const [rel, rules] of Object.entries(batch)) {
  const raw = fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(raw.includes('\r\n') ? '\r\n' : '\n');
  for (const r of rules) {
    if (only && r.line !== only) continue;
    const line = lines[r.line - 1] ?? '';
    const ok = line.includes(r.find);
    console.log(`--- ${rel}:${r.line} match=${ok}`);
    if (!ok) {
      console.log('LINE: ' + JSON.stringify(line));
      console.log('FIND: ' + JSON.stringify(r.find));
      // longest common prefix
      let i = 0;
      while (i < line.length && i < r.find.length && line[i] === r.find[i]) i++;
      console.log(`diverge at ${i}: line[${i}]=${JSON.stringify(line[i])} find[${i}]=${JSON.stringify(r.find[i])}`);
      console.log('line ctx : ' + JSON.stringify(line.slice(Math.max(0, i - 25), i + 25)));
      console.log('find ctx : ' + JSON.stringify(r.find.slice(Math.max(0, i - 25), i + 25)));
    }
  }
}
