import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), {
    name: 'concept-runtime-assets',
    async writeBundle(options) {
      if (options.dir?.endsWith('.prerender')) return;
      const output = path.resolve(root, options.dir || 'dist');
      const source = path.join(root, 'nurture-v01', 'assets');
      const destination = path.join(output, 'nurture-v01', 'assets');
      await mkdir(destination, { recursive: true });
      // Fonts and CSS-referenced marks are emitted by Vite. Only delivery files
      // are copied; generation masters and the reference stay out of deployment.
      for (const directory of ['product', 'icons', 'social']) {
        await cp(path.join(source, directory), path.join(destination, directory), { recursive: true });
      }
      await mkdir(path.join(destination, 'brand'), { recursive: true });
      for (const file of ['trayn-symbol.webp', 'trayn-wordmark.webp', 'trayn-endorsement.webp', 'nurture-wordmark.svg', 'favicon.svg']) {
        await cp(path.join(source, 'brand', file), path.join(destination, 'brand', file));
      }
      await mkdir(path.join(destination, 'fonts'), { recursive: true });
      for (const file of ['cormorant-garamond-LICENSE.txt', 'manrope-LICENSE.txt']) {
        await cp(path.join(source, 'fonts', file), path.join(destination, 'fonts', file));
      }
      await cp(path.join(root, 'shared', 'brand'), path.join(output, 'shared', 'brand'), { recursive: true });
      const radianceAssets = path.join(root, 'radiance-v01', 'assets');
      for (const directory of ['product', 'brand', 'icons', 'social']) {
        await cp(path.join(radianceAssets, directory), path.join(output, 'radiance-v01', 'assets', directory), { recursive: true });
      }
      for (const directory of ['social', 'brand', 'world']) {
        await cp(path.join(root, 'radiance-v03', 'assets', directory), path.join(output, 'radiance-v03', 'assets', directory), { recursive: true });
      }
      await mkdir(path.join(output, 'shared', 'fonts'), { recursive: true });
      for (const file of ['manrope-LICENSE.txt', 'cormorant-garamond-LICENSE.txt']) {
        await cp(path.join(root, 'shared', 'fonts', file), path.join(output, 'shared', 'fonts', file));
      }
    },
  }],
  publicDir: false,
  base: './',
  ssr: { noExternal: ['gsap', 'lenis'] },
  build: {
    target: 'es2022',
    ...(isSsrBuild ? {} : { rollupOptions: { input: { picker: path.join(root, 'index.html'), nurture: path.join(root, 'nurture-v01', 'index.html'), radiance: path.join(root, 'radiance-v01', 'index.html'), radianceV3: path.join(root, 'radiance-v03', 'index.html') } } }),
  },
}));
