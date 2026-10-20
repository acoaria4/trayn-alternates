import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.SITE_URL || 'http://127.0.0.1:4183/trayn-alternates/nurture-v01/';
const expected = new URL('nurture-v01/', process.env.PUBLIC_SITE_URL || 'https://acoaria4.github.io/trayn-alternates/').href;
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
const report = { url: base, layouts: [], errors: [] };
await mkdir(new URL('../verification/', import.meta.url), { recursive: true });
try {
  for (const [width, height] of [[320, 568], [360, 800], [390, 844], [430, 932], [844, 390]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), expected);
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), new URL('assets/social/social-preview.jpg', expected).href);
    assert(await page.locator('.brand-nurture').isVisible());
    assert(await page.locator('.brand-endorsement img').isVisible());
    const cta = await page.locator('.hero-cta').boundingBox();
    assert(cta.y + cta.height <= height, 'Primary exploration link should fit in the first mobile viewport');
    if (width < 760) {
      assert((await page.locator('.hero-angle').evaluate(el => el.currentSrc)).endsWith('hero-mobile.webp'), 'Phone at DPR 3 should receive the dedicated high-resolution mobile asset');
      for (const selector of ['.brand', '.menu-toggle', '.hero-cta', '.hero-inspect']) {
        const box = await page.locator(selector).boundingBox();
        assert(box.width >= 44 && box.height >= 44, `Touch target too small: ${selector}`);
      }
      await page.locator('.hero-inspect').tap();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-front')).opacity === '1');
      await page.locator('.hero-inspect').tap();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-angle')).opacity === '1');
      await page.getByRole('button', { name: 'Open navigation' }).tap();
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /The details/ }).tap();
      await page.waitForFunction(() => !document.querySelector('.menu-dialog').open);
      assert.equal(new URL(page.url()).pathname, new URL(base).pathname);
      assert.equal(new URL(page.url()).hash, '#details');
      await page.getByRole('link', { name: 'Nurture by TRAYN Nutrition — home' }).tap();
      await page.waitForFunction(() => scrollY < 5);
      if (width === 390) {
        await page.screenshot({ path: 'verification/mobile-pages-hero.png' });
        await page.locator('.site-header').screenshot({ path: 'verification/header-lockup.png' });
      }
    }
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    assert(dimensions.document <= dimensions.viewport, 'Horizontal overflow');
    assert.equal(await page.locator('img').evaluateAll(images => images.filter(image => image.complete && image.naturalWidth === 0).length), 0);
    report.layouts.push({ width, height, dpr: 3, dimensions, heroSource: await page.locator('.hero-angle').evaluate(el => el.currentSrc), touch: width < 760 ? 'inspection/menu/anchor/home passed' : 'landscape layout passed' });
    await context.close();
  }
  assert.equal(report.errors.length, 0);
  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await fallback.route('**/assets/nurture-*.js', route => route.abort());
  await fallback.goto(base, { waitUntil: 'networkidle' });
  assert(await fallback.getByRole('navigation', { name: 'Main navigation' }).isVisible(), 'Module failure must restore native navigation');
  assert.equal(await fallback.locator('.hero-inspect').isVisible(), false);
  await fallback.getByText('Can I buy it yet?', { exact: true }).click();
  assert(await fallback.locator('.faq[open]').isVisible());
  report.moduleFailure = 'Blocked application bundle restores native navigation and keeps the prerendered page and FAQ usable';
  await fallback.close();
  report.passed = true;
} finally {
  await writeFile(new URL('../verification/mobile-pages.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
