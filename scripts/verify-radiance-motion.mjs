import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const base = process.env.RADIANCE_URL || 'http://127.0.0.1:4180/radiance-v01/';
const output = fileURLToPath(new URL('../verification/radiance-motion/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
const report = { url: base, checks: {}, errors: [] };
const ready = page => page.waitForFunction(() => document.documentElement.dataset.radianceReady === 'true');
const imageReady = (page, filename) => page.waitForFunction(filename => {
  const image = document.querySelector('#rd-detail-panel .rd-detail-image');
  return image?.getAttribute('src')?.endsWith(filename) && image.complete && image.naturalWidth > 0 && !document.querySelector('#rd-detail-panel').hasAttribute('aria-busy');
}, filename);

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(base, { waitUntil: 'networkidle' }); await ready(page); await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType), 'none');
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), true);
  await page.getByRole('navigation', { name: 'Radiance navigation', exact: true }).getByRole('link', { name: 'The everyday', exact: true }).click();
  await page.waitForFunction(() => Math.abs(document.getElementById('ritual').getBoundingClientRect().top - 24) < 6);
  const before = await page.locator('.rd-ritual-photo img').evaluate(image => ({ y: new DOMMatrixReadOnly(getComputedStyle(image).transform).m42, scale: new DOMMatrixReadOnly(getComputedStyle(image).transform).m11 }));
  assert(before.scale > 1.04 && before.scale < 1.08);
  await page.mouse.move(800, 500); await page.mouse.wheel(0, 250);
  await page.waitForFunction(y => Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.rd-ritual-photo img')).transform).m42 - y) > 1, before.y);
  report.checks.photographDepth = 'Desktop image drift responds to scroll inside the unchanged frame; free scrolling remains enabled.';

  let releaseImage;
  let signalRequest;
  const gate = new Promise(resolve => { releaseImage = resolve; });
  const requested = new Promise(resolve => { signalRequest = resolve; });
  await page.route('**/assets/product/detail.webp', async route => { signalRequest(); await gate; await route.continue().catch(() => {}); });
  await page.getByRole('tab', { name: /The sunshine/ }).click(); await requested;
  await page.waitForFunction(() => document.querySelector('#rd-detail-panel').getAttribute('aria-busy') === 'true');
  assert.equal(await page.locator('#rd-detail-panel').getAttribute('aria-busy'), 'true');
  assert((await page.locator('.rd-detail-image').getAttribute('src')).endsWith('packaging.webp'));
  assert(await page.locator('.rd-detail-image').evaluate(image => image.complete && image.naturalWidth > 0));
  // Select another image while the first request is held. The old response
  // must never overtake this newer choice when it eventually completes.
  await page.getByRole('tab', { name: /The ritual/ }).click(); await imageReady(page, 'ritual.webp');
  const oldResponse = page.waitForResponse(response => response.url().endsWith('/assets/product/detail.webp'));
  releaseImage(); const response = await oldResponse; await response.finished();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert((await page.locator('.rd-detail-image').getAttribute('src')).endsWith('ritual.webp'));
  report.checks.slowAndStaleImages = 'Displayed photograph remains visible during loading; a late response cannot override the latest selection.';

  await page.getByRole('tab', { name: /The ritual/ }).press('Home'); await imageReady(page, 'packaging.webp');
  assert.equal(await page.locator('.rd-detail-outgoing').count(), 0);
  assert.equal(await page.locator('.rd-detail-image').evaluate(image => getComputedStyle(image).opacity), '1');
  assert.equal(await page.locator('.rd-tabs').getAttribute('data-input'), 'keyboard');
  assert.equal(await page.locator('.rd-tab-label').first().evaluate(label => getComputedStyle(label).transitionDuration), '0s');
  report.checks.keyboard = 'Keyboard tab navigation updates the photograph and selected state without a transition.';

  await page.getByRole('tab', { name: /The sunshine/ }).click(); await imageReady(page, 'detail.webp');
  assert.equal(await page.locator('.rd-detail-outgoing').count(), 1);
  await page.waitForFunction(() => !document.querySelector('.rd-detail-outgoing'));
  await page.locator('#details').screenshot({ path: path.join(output, 'desktop-details.png') });
  report.checks.pointer = 'Decoded pointer selection crossfades and removes its outgoing layer.';

  await page.getByRole('tab', { name: /The ritual/ }).click(); await imageReady(page, 'ritual.webp');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('.rd-detail-outgoing') && !document.documentElement.classList.contains('lenis'));
  assert.equal(await page.locator('.rd-detail-image').evaluate(image => getComputedStyle(image).opacity), '1');
  assert.equal(await page.locator('.rd-ritual-photo img').evaluate(image => getComputedStyle(image).transform), 'none');
  report.checks.reducedMotion = 'Changing the preference finishes image transitions, removes photograph movement and destroys desktop smoothing.';
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await mobile.newPage(); phone.on('pageerror', error => report.errors.push(error.message));
  await phone.goto(base, { waitUntil: 'networkidle' }); await ready(phone);
  assert.equal(await phone.evaluate(() => document.documentElement.classList.contains('lenis')), false);
  assert.equal(await phone.locator('.rd-hero-media img').evaluate(image => getComputedStyle(image).transform), 'none');
  assert.equal(await phone.locator('.rd-ritual-photo img').evaluate(image => getComputedStyle(image).transform), 'none');
  assert.equal(await phone.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType), 'none');
  await phone.getByRole('tab', { name: /The sunshine/ }).click(); await imageReady(phone, 'detail.webp');
  await phone.waitForFunction(() => !document.querySelector('.rd-detail-outgoing'));
  await phone.locator('#details').screenshot({ path: path.join(output, 'mobile-details.png') });
  report.checks.mobile = 'Native touch scrolling, static photographs, working detail selection and no snapping.';
  await mobile.close();
  assert.deepEqual(report.errors, []); report.passed = true;
} catch (error) { report.passed = false; report.failure = error.stack; throw error; }
finally { await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); await browser.close(); }
