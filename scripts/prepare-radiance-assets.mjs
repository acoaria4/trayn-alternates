import sharp from 'sharp';
import { mkdir, copyFile, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const source = new URL('docs/radiance/assets/', root);
const output = new URL('radiance-v01/assets/', root);
for (const directory of ['product', 'brand', 'icons', 'social']) await mkdir(new URL(`${directory}/`, output), { recursive: true });

for (const [input, name, width] of [
  ['hero.png', 'hero.webp', 1800], ['hero.png', 'hero-1000.webp', 1000],
  ['ritual.png', 'ritual.webp', 1400], ['ritual.png', 'ritual-700.webp', 700],
  ['detail.png', 'detail.webp', 1000],
  ['packaging.png', 'packaging.webp', 1000], ['packaging.png', 'packaging-600.webp', 600],
]) {
  await sharp(await readFile(new URL(input, source))).resize({ width }).webp({ quality: 84, effort: 5 }).toFile(new URL(`product/${name}`, output).pathname.replace(/^\/(\w:)/, '$1'));
}
await sharp(await readFile(new URL('radiance-wordmark.png', source))).resize({ width: 1000 }).webp({ lossless: true, effort: 5 }).toFile(new URL('brand/radiance-wordmark.webp', output).pathname.replace(/^\/(\w:)/, '$1'));
for (const name of ['trayn-wordmark.webp', 'trayn-symbol.webp']) await copyFile(new URL(`shared/brand/${name}`, root), new URL(`brand/${name}`, output));
for (const name of ['arrow-up-right.svg', 'arrow-right.svg', 'ATTRIBUTION.txt']) await copyFile(new URL(`nurture-v01/assets/icons/${name}`, root), new URL(`icons/${name}`, output));
await sharp(await readFile(new URL('hero.png', source))).resize(1200, 630, { fit: 'contain', background: '#f4e7d3' }).jpeg({ quality: 88, mozjpeg: true }).toFile(new URL('social/social-preview.jpg', output).pathname.replace(/^\/(\w:)/, '$1'));

const files = [];
for (const directory of ['product', 'brand', 'icons', 'social']) {
  for (const name of await readdir(new URL(`${directory}/`, output))) {
    const path = `${directory}/${name}`;
    const buffer = await readFile(new URL(path, output));
    const metadata = /\.(webp|jpg)$/.test(name) ? await sharp(buffer).metadata() : {};
    files.push({ path, bytes: (await stat(new URL(path, output))).size, sha256: createHash('sha256').update(buffer).digest('hex'), width: metadata.width, height: metadata.height });
  }
}
await writeFile(new URL('manifest.json', output), JSON.stringify({ source: 'docs/radiance/assets/', imagery: 'Generated concepts; packaging and formulation unapproved.', files }, null, 2) + '\n');
console.log(`Prepared ${files.length} Radiance delivery assets; generation masters stay under docs/radiance/.`);
