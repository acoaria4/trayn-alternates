import { createRequire } from 'node:module';
import { readdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const origin = process.env.SITE_URL || 'http://127.0.0.1:4180/nurture-v01/';
const files = await readdir(new URL('../../dist/assets/', import.meta.url));
const display = files.find(file => file.startsWith('cormorant-garamond-latin-400-normal') && file.endsWith('.woff2'));
const italic = files.find(file => file.startsWith('cormorant-garamond-latin-400-italic') && file.endsWith('.woff2'));
const body = files.find(file => file.startsWith('manrope-latin-400-normal') && file.endsWith('.woff2'));
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const html = `<style>
  @font-face{font-family:Display;src:url('${new URL('../assets/', origin)}${display}')}@font-face{font-family:Display;src:url('${new URL('../assets/', origin)}${italic}');font-style:italic}@font-face{font-family:Body;src:url('${new URL('../assets/', origin)}${body}')}
  *{box-sizing:border-box}body{margin:0;background:#faf7f0;color:#382a22}main{width:1200px;height:630px;padding:48px 58px;position:relative;font-family:Body}header{display:flex;flex-direction:column;align-items:center;gap:8px;width:170px}header>img{width:170px;height:30px;object-fit:contain}header span{display:flex;align-items:center;gap:8px;font-size:9px}header span img{width:87px;height:19px;object-fit:contain}.copy{margin-top:55px;width:560px}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:1.5px}h1{font:400 87px/.96 Display;letter-spacing:-3px;margin:23px 0 26px}p{font-size:16px;line-height:1.7}.stage{position:absolute;right:54px;top:48px;width:426px;height:534px;background:#eee5d7;display:grid;place-items:center}.stage img{height:458px;width:290px;object-fit:contain}.note{position:absolute;bottom:45px;font-size:10px;letter-spacing:.5px;border-top:1px solid #d6c9b7;padding-top:16px;width:530px}
  </style><main><header><img src="${origin}assets/brand/nurture-wordmark.svg" alt="NURTURE"/><span>by<img src="${origin}assets/brand/trayn-endorsement.webp" alt="TRAYN Nutrition"/></span></header><div class="copy"><span class="eyebrow">Nurture Everyday</span><h1>The everyday,<br/><i>considered.</i></h1><p>Everyday Nutrition for Every Woman.</p></div><div class="stage"><img src="${origin}assets/product/hero.webp" alt="Nurture concept tin"/></div><div class="note">PRODUCT IN DEVELOPMENT / GENERATED PACKAGING CONCEPT</div></main>`;
  // A same-origin render document lets local font requests pass CORS checks.
  const renderUrl = new URL('__social-artwork', origin).href;
  await page.route(renderUrl, route => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await page.goto(renderUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (!document.fonts.check('16px Body') || !document.fonts.check('87px Display')) throw new Error('Sharing artwork fonts failed to load');
    await Promise.all([...document.images].map(image => image.decode()));
  });
  const buffer = await page.screenshot({ type: 'png' });
  await sharp(buffer).jpeg({ quality: 92, mozjpeg: true }).toFile(new URL('../assets/social/social-preview.jpg', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
  console.log('Created an original 1200 × 630 social card from the newly generated product cutout.');
} finally { await browser.close(); }
