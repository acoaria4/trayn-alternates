import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
const output = new URL('../dist/', import.meta.url);
const exists = name => stat(new URL(name, output)).then(() => true, () => false);
for (const name of ['docs', 'outputs', 'output', 'tmp', 'nurture-v01/docs', 'nurture-v01/output', 'nurture-v01/outputs', 'nurture-v01/tmp', 'nurture-v01/assets/masters', 'nurture-v01/assets/reference']) {
  assert.equal(await exists(name), false, `Private/source material deployed: ${name}`);
}
for (const name of ['index.html', 'nurture-v01/index.html']) {
  const html = await readFile(new URL(name, output), 'utf8');
  assert(html.includes('<main'), `Missing static content: ${name}`);
  assert(!html.includes('<!--app-html-->'), `Missing prerender: ${name}`);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (url.startsWith('#') || /^(https?:|data:)/.test(url)) continue;
    await stat(new URL(url, new URL(name, output)));
  }
}
assert.equal((await readdir(output)).includes('nurture-v01'), true);
console.log('Both static pages and linked assets exist; private documents and source masters are excluded.');
