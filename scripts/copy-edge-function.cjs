// ============================================================
// COPY — create-auth-user Edge Function code clipboard me (Dashboard deploy ke liye).
// Run: node scripts/copy-edge-function.cjs
// ============================================================
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const file = path.join(__dirname, '..', 'supabase', 'functions', 'create-auth-user', 'index.ts');
if (!fs.existsSync(file)) {
  console.error('File nahi mili: ' + file);
  process.exit(1);
}

const code = fs.readFileSync(file, 'utf8');
let copied = false;
if (process.platform === 'win32') {
  const clip = spawnSync('clip', [], { input: code, encoding: 'utf8' });
  copied = clip.status === 0 && !clip.error;
}

if (copied) {
  console.log('OK — clipboard me copy ho gaya (' + code.length + ' chars)');
} else {
  const out = path.join(os.tmpdir(), 'create-auth-user.index.ts');
  fs.writeFileSync(out, code, 'utf8');
  console.log('Clipboard available nahi — file save ki: ' + out);
}

console.log('Source: ' + file);
console.log('');
console.log('Agla step:');
console.log('  1. Supabase Dashboard -> Edge Functions -> Deploy a new function -> Via Editor');
console.log('  2. Name: create-auth-user (exact)');
console.log('  3. Editor ka template hata kar paste (Ctrl+V) -> Deploy function');
console.log('  4. Verify: node scripts/check-auth-config.cjs   (expect 12/12 PASS)');
