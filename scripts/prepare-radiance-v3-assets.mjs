import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = new URL('../docs/radiance/assets/v03/morning.png', import.meta.url);
const destination = new URL('../radiance-v03/assets/', import.meta.url);
for (const dir of ['product', 'social', 'brand']) await mkdir(new URL(dir, destination), { recursive: true });
for (const width of [1600, 800]) {
  await sharp(fileURLToPath(source)).resize({ width }).webp({ quality: 86 }).toFile(fileURLToPath(new URL(`product/morning${width === 800 ? '-800' : ''}.webp`, destination)));
  await sharp(fileURLToPath(source)).resize({ width }).avif({ quality: 52, effort: 5 }).toFile(fileURLToPath(new URL(`product/morning${width === 800 ? '-800' : ''}.avif`, destination)));
}
await sharp(fileURLToPath(new URL('../radiance-v01/assets/brand/radiance-wordmark.webp', import.meta.url))).resize({ width: 384 }).webp({ quality: 86 }).toFile(fileURLToPath(new URL('brand/radiance-small.webp', destination)));
await sharp(fileURLToPath(new URL('../radiance-v01/assets/brand/trayn-wordmark.webp', import.meta.url))).resize({ width: 280 }).webp({ quality: 85 }).toFile(fileURLToPath(new URL('brand/trayn-small.webp', destination)));
await sharp(fileURLToPath(source)).resize(1200, 630, { fit: 'cover', position: 'right' }).jpeg({ quality: 88 }).toFile(fileURLToPath(new URL('social/social-preview.jpg', destination)));
const files = [];
for (const path of ['product/morning.webp', 'product/morning-800.webp', 'product/morning.avif', 'product/morning-800.avif', 'brand/radiance-small.webp', 'brand/trayn-small.webp', 'social/social-preview.jpg']) {
  const bytes = await readFile(new URL(path, destination));
  const { width, height } = await sharp(bytes).metadata();
  files.push({ path, bytes: bytes.length, width, height, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(new URL('manifest.json', destination), JSON.stringify({ source: 'docs/radiance/assets/v03/morning.png', imagery: 'Generated packaging concept, not final artwork.', files }, null, 2) + '\n');
console.log('Prepared Radiance v03 hero, mobile image and social preview.');
