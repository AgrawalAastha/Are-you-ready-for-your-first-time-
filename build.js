// Copies src/ to dist/, writing the live site address into the link-preview tags.
const fs = require('fs'), path = require('path');
const host = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
const site = host ? (host.startsWith('http') ? host : 'https://' + host).replace(/\/$/, '') : '';
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const a = path.join(from, f), b = path.join(to, f);
    if (fs.statSync(a).isDirectory()) copy(a, b);
    else if (f.endsWith('.html')) fs.writeFileSync(b, fs.readFileSync(a, 'utf8').split('__SITE__').join(site));
    else fs.copyFileSync(a, b);
  }
}
fs.rmSync('dist', { recursive: true, force: true });
copy('src', 'dist');
console.log('Built for', site || '(relative links)');
