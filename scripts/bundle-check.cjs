// BUNDLE CHECK — esbuild se app bundle karke syntax/import errors seconds me pakadta hai
// (is machine par `npx` blocked hai aur tsc bohat slow chalta hai).
// Run: node scripts/bundle-check.cjs [entry]   (default: src/main.tsx)
const esbuild = require('esbuild');
const path = require('path');

const entry = path.resolve(__dirname, '..', process.argv[2] || 'src/main.tsx');
try {
  const r = esbuild.buildSync({
    entryPoints: [entry],
    bundle: true,
    write: false,
    logLevel: 'silent',
    format: 'esm',
    target: 'es2020',
    jsx: 'automatic',
    loader: {
      '.tsx': 'tsx', '.ts': 'ts', '.jsx': 'jsx', '.js': 'jsx',
      '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl',
    },
    define: { 'import.meta.env.VITE_DATA_MODE': '"live"' },
    // CSS/tailwind resolve na ho to bundling ruk jati hai — ye check sirf JS/TS syntax ke liye hai
    external: ['*.css'],
  });
  const size = r.outputFiles && r.outputFiles[0] ? r.outputFiles[0].text.length : 0;
  console.log('BUNDLE OK — ' + path.basename(entry) + ' (' + size + ' chars)');
} catch (e) {
  console.error('BUNDLE FAIL — ' + path.basename(entry));
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
}
