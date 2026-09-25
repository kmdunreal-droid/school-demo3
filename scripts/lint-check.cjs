// LINT CHECK — `npm run lint` (tsc --noEmit) ko safely chalata hai aur result file
// me likhta hai. Is machine par npx.ps1 execution policy se blocked hai, isliye
// tsc ko seedha node se invoke kiya jata hai.
// Run: node scripts/lint-check.cjs
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outFile = path.join(process.env.TEMP || '.', 'lint-result.txt');
const extra = process.argv.slice(2);
try { fs.writeFileSync(outFile, 'STARTED ' + new Date().toISOString() + ' ' + extra.join(' ') + '\n'); } catch { /* ignore */ }
const r = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'].concat(extra), {
  cwd: path.resolve(__dirname, '..'),
  encoding: 'utf8',
});

const output = (r.stdout || '') + (r.stderr || '');
const summary = 'EXIT=' + r.status + '\n' + (output.trim() ? output : '(no diagnostics — clean)\n');
try { fs.writeFileSync(outFile, summary); } catch { /* ignore */ }
process.stdout.write(summary);
