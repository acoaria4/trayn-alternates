import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = new URL('../docs/radiance/assets/v03/world/', import.meta.url);
const assets = new URL('../radiance-v03/assets/', import.meta.url);
await mkdir(new URL('world/', assets), { recursive: true });
await mkdir(new URL('social/', assets), { recursive: true });
const paths = [];
for (const name of ['sun-world', 'latte-world']) {
  for (const width of [800,1800]) {
    for (const format of ['webp','avif']) {
      const path = `world/${name}${width === 800 ? '-800' : ''}.${format}`;
      const pipeline = sharp(fileURLToPath(new URL(`${name}.png`, source))).resize({ width });
      await (format === 'avif' ? pipeline.avif({ quality: 56, effort: 5 }) : pipeline.webp({ quality: 86 })).toFile(fileURLToPath(new URL(path, assets)));
      paths.push(path);
    }
  }
}
const tin = fileURLToPath(new URL('floating-tin.png', source));
const meta = await sharp(tin).metadata();
if (!meta.hasAlpha) throw new Error('Floating tin requires genuine alpha transparency.');
for (const width of [540,900]) {
  for (const format of ['webp','avif']) {
    const path = `world/floating-tin${width === 540 ? '-540' : ''}.${format}`;
    const pipeline = sharp(tin).resize(width,width*1.5,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}});
    await (format === 'avif' ? pipeline.avif({quality:62,effort:5}) : pipeline.webp({quality:86})).toFile(fileURLToPath(new URL(path,assets)));
    paths.push(path);
  }
}
const manifest = JSON.parse(await readFile(new URL('manifest.json', assets), 'utf8'));
await sharp(fileURLToPath(new URL('latte-world.png', source))).resize(1200,630,{fit:'cover'}).jpeg({quality:88}).toFile(fileURLToPath(new URL('social/social-preview.jpg', assets)));
paths.push('social/social-preview.jpg');
manifest.files = manifest.files.filter(file => file.path.startsWith('brand/'));
manifest.source = 'docs/radiance/assets/v03/world/';
for (const path of paths) {
  const bytes = await readFile(new URL(path, assets));
  const { width,height } = await sharp(bytes).metadata();
  manifest.files.push({ path, bytes: bytes.length, width, height, sha256: createHash('sha256').update(bytes).digest('hex') });
}
manifest.worldSource = 'docs/radiance/assets/v03/world/';
await writeFile(new URL('manifest.json', assets), JSON.stringify(manifest,null,2) + '\n');
console.log('Prepared two surreal environments and the transparent product layer.');
