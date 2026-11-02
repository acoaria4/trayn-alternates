import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('assets/manifest.json', root), 'utf8'));
const digest = buffer => createHash('sha256').update(buffer).digest('hex');
for (const file of manifest.files) {
  const source = await readFile(new URL(`assets/${file.path}`, root));
  const delivery = await readFile(new URL(`../dist/nurture-v01/assets/${file.path}`, root));
  assert.equal(digest(source), digest(delivery), `Deployed asset differs: ${file.path}`);
}
for (const name of ['nurture-wordmark.svg', 'trayn-endorsement.webp']) {
  assert.equal(digest(await readFile(new URL(`assets/brand/${name}`, root))), digest(await readFile(new URL(`../dist/nurture-v01/assets/brand/${name}`, root))), `Deployed identity differs: ${name}`);
}
for (const name of ['trayn-endorsement-master.png', 'create-wordmark.py']) {
  assert.equal(await stat(new URL(`../dist/nurture-v01/assets/brand/${name}`, root)).then(() => true, () => false), false, `Brand source leaked into deployment: ${name}`);
}
assert.equal(await stat(new URL('../dist/nurture-v01/assets/masters', root)).then(() => true, () => false), false, 'Generation masters leaked into deployment');
assert.equal(await stat(new URL('../dist/nurture-v01/assets/reference', root)).then(() => true, () => false), false, 'Source reference leaked into deployment');
async function inspect(directory) {
  for (const entry of await readdir(new URL(directory, root), { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await inspect(file);
    else if (entry.name !== 'verify-assets.mjs' && /\.(tsx?|mjs|css)$/.test(file)) assert(!/old_website|\.\.\/public\/|\.\/media\//.test(await readFile(new URL(file, root), 'utf8')), `Archive or obsolete dependency: ${file}`);
  }
}
await inspect('src');
await inspect('scripts');
assert(!/old_website/.test(await readFile(new URL('../vite.config.ts', root), 'utf8')));
const html = await readFile(new URL('../dist/nurture-v01/index.html', root), 'utf8');
const assetUrls = [...html.matchAll(/(?:src|href|content)="(\.\/assets\/[^"\s]+)"/g)].map(match => match[1]);
for (const url of assetUrls) await stat(new URL(`../dist/nurture-v01/${url}`, root));
assert(assetUrls.length > 10, 'Expected image/font/icon references not present');
console.log(`Asset integrity passed: ${manifest.files.length} delivery images, ${assetUrls.length} HTML asset references; no archive dependency or deployed masters.`);
