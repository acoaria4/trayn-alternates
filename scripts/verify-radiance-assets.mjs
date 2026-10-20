import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('radiance-v01/assets/manifest.json', root), 'utf8'));
for (const file of manifest.files) {
  for (const directory of ['radiance-v01', 'dist/radiance-v01']) {
    const bytes = await readFile(new URL(`${directory}/assets/${file.path}`, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Radiance asset differs: ${directory}/${file.path}`);
  }
}
for (const path of ['dist/radiance-v01/assets/masters', 'dist/radiance-v01/assets/manifest.json', 'dist/radiance-v01/docs', 'dist/docs']) {
  assert.equal(await stat(new URL(path, root)).then(() => true, () => false), false, `Source material deployed: ${path}`);
}
console.log(`Radiance delivery integrity passed: ${manifest.files.length} runtime assets; no source masters or product documents deployed.`);
