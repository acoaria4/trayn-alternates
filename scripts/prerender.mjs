import { readFile, writeFile, readdir } from 'node:fs/promises';
import { renderPicker, renderNurture } from '../.prerender/entry-server.js';

const assets = await readdir(new URL('../dist/assets/', import.meta.url));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
let publicBase;
if (process.env.PUBLIC_SITE_URL) {
  publicBase = new URL(process.env.PUBLIC_SITE_URL);
  if (!['http:', 'https:'].includes(publicBase.protocol)) throw new Error('PUBLIC_SITE_URL must use HTTP(S)');
  if (!publicBase.pathname.endsWith('/')) publicBase.pathname += '/';
}

for (const page of [
  { file: 'index.html', route: '', render: renderPicker, prefix: './', image: 'nurture-v01/assets/social/social-preview.jpg', fonts: ['manrope-latin-400-normal', 'manrope-latin-500-normal', 'cormorant-garamond-latin-400-normal'] },
  { file: 'nurture-v01/index.html', route: 'nurture-v01/', render: renderNurture, prefix: '../', image: 'assets/social/social-preview.jpg', fonts: ['cormorant-garamond-latin-400-normal', 'cormorant-garamond-latin-400-italic', 'manrope-latin-400-normal'] },
]) {
  const file = new URL(`../dist/${page.file}`, import.meta.url);
  let html = await readFile(file, 'utf8');
  if (!html.includes('<!--app-html-->')) throw new Error(`Prerender marker missing: ${page.file}`);
  const preloads = page.fonts.map(name => assets.find(asset => asset.startsWith(`${name}-`) && asset.endsWith('.woff2'))).filter(Boolean).map(asset => `<link rel="preload" href="${page.prefix}assets/${asset}" as="font" type="font/woff2" crossorigin />`).join('\n');
  html = html.replace('</head>', `${preloads}\n</head>`);
  if (publicBase) {
    const canonical = new URL(page.route, publicBase);
    const image = escape(new URL(page.image, canonical).href);
    html = html.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(")/g, (_, start, end) => `${start}${image}${end}`);
    html = html.replace('</head>', `<link rel="canonical" href="${escape(canonical.href)}" /><meta property="og:url" content="${escape(canonical.href)}" />\n</head>`);
  }
  await writeFile(file, html.replace('<!--app-html-->', page.render()));
}
console.log('Prerendered the concept picker and Nurture v01.');
