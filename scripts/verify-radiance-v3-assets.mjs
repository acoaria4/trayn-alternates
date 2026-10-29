import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('radiance-v03/assets/manifest.json', root), 'utf8'));
for (const file of manifest.files) {
  for (const directory of ['radiance-v03', 'dist/radiance-v03']) {
    const bytes = await readFile(new URL(`${directory}/assets/${file.path}`, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Asset mismatch: ${directory}/${file.path}`);
  }
}
for (const path of ['dist/radiance-v03/assets/manifest.json', 'dist/radiance-v03/src', 'dist/radiance-v03/assets/masters', 'dist/docs']) {
  assert.equal(await stat(new URL(path, root)).then(() => true, () => false), false, `Source material deployed: ${path}`);
}
console.log('Radiance v03 image integrity passed; source masters and product documents excluded.');
