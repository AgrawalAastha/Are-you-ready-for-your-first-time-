// Builds dist/ from the quiz files, wherever they sit in the upload
// (in folders or all flat), and writes the live site address into the link-preview tags.
const fs = require('fs'), path = require('path');
const host = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
const site = host ? (host.startsWith('http') ? host : 'https://' + host).replace(/\/$/, '') : '';
const TYPES = ['natural', 'nervous', 'overthinker', 'talker'];
const SKIP = new Set(['node_modules', '.git', 'dist', '.vercel']);

function walk(dir, out) {
  for (const f of fs.readdirSync(dir)) {
    if (SKIP.has(f)) continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/r', { recursive: true });
fs.mkdirSync('dist/og', { recursive: true });
const found = { page: 0, result: 0, image: 0 };
for (const file of walk('.', [])) {
  const name = path.basename(file), stem = name.replace(/\.[^.]+$/, '');
  let dest = null;
  if (name === 'index.html') { dest = 'dist/index.html'; found.page++; }
  else if (name.endsWith('.html') && TYPES.includes(stem)) { dest = 'dist/r/' + name; found.result++; }
  else if (name.endsWith('.png') && (TYPES.includes(stem) || stem === 'main')) { dest = 'dist/og/' + name; found.image++; }
  if (!dest) continue;
  if (name.endsWith('.html')) fs.writeFileSync(dest, fs.readFileSync(file, 'utf8').split('__SITE__').join(site));
  else fs.copyFileSync(file, dest);
}
if (!found.page) { console.error('index.html is missing from the upload.'); process.exit(1); }
console.log('Built for', site || '(relative links)', found);
