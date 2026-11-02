import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const assets = fileURLToPath(new URL('../assets/', import.meta.url));
const output = path.join(assets, 'product');
await mkdir(output, { recursive: true });
const jobs = [
  { source: 'hero-angle', name: 'hero', width: 1000, small: 600 },
  { source: 'front', name: 'front', width: 1000, small: 600 },
  { source: 'hero-mobile', name: 'hero-mobile', width: 720, small: 360 },
  { source: 'front-mobile', name: 'front-mobile', width: 720, small: 360 },
  { source: 'finish-angle', name: 'finish-angle', width: 1200, small: 600 },
  { source: 'artwork', name: 'artwork', width: 900, small: 450 },
  { source: 'open', name: 'open', width: 1000, small: 600 },
  { source: 'top', name: 'top', width: 1000, small: 600 },
  { source: 'ritual', name: 'ritual', width: 1000, small: 600 },
];
const manifest = { generatedWith: 'Built-in image_gen, 9 October 2026', reference: 'reference/product-reference.png', framing: 'Whole generation frame retained. Resize and encode only; no crop, trim, perspective correction or retouching.', files: [] };
for (const [name, width] of [['trayn-symbol', 192], ['trayn-wordmark', 512]]) {
  await sharp(path.join(assets, 'reference', `${name}.png`)).trim().resize({ width, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(assets, 'brand', `${name}.webp`));
}
await sharp(path.join(assets, 'brand', 'trayn-endorsement-master.png')).trim().resize({ width: 522 }).webp({ lossless: true }).toFile(path.join(assets, 'brand', 'trayn-endorsement.webp'));
for (const job of jobs) {
  for (const [suffix, width, quality] of [['', job.width, 88], ['-small', job.small, 84]]) {
    const name = `${job.name}${suffix}.webp`;
    const image = sharp(path.join(assets, 'masters', `${job.source}.png`)).resize({ width, withoutEnlargement: true }).webp({ quality, alphaQuality: 100 });
    const info = await image.toFile(path.join(output, name));
    manifest.files.push({ path: `product/${name}`, source: `masters/${job.source}.png`, width: info.width, height: info.height, bytes: info.size });
  }
}
await writeFile(path.join(assets, 'manifest.json'), JSON.stringify(manifest, null, 2)+'\n');
console.log(JSON.stringify(manifest,null,2));
