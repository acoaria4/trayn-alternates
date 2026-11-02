import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
await mkdir(new URL('../verification/', import.meta.url), { recursive: true });
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4180/nurture-v01/';
const report = { browsers: [], cleanup: {}, errors: [] };
const setups = [
  { name: 'Edge', type: chromium, options: { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' } },
  { name: 'WebKit', type: webkit, options: {} },
];
try {
  for (const setup of setups) {
    const browser = await setup.type.launch({ ...setup.options, headless: true });
    try {
      const result = { name: setup.name, version: browser.version(), layouts: [] };
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: width > 900 ? 1000 : 844 }, hasTouch: width < 900, isMobile: width < 900 });
        page.on('pageerror', error => report.errors.push(`${setup.name}: ${error.message}`));
        await page.goto(base, { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: 'A closer look', exact: true }).focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1100);
        assert.equal(await page.locator('.hero-inspect').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('.hero-front').evaluate(el => getComputedStyle(el).opacity), '1');
        await page.screenshot({ path: `verification/${setup.name.toLowerCase()}-${width}-hero.png` });
        await page.locator('#object').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: /The artwork/ }).click();
        await page.getByRole('button', { name: 'Enlarge the artwork' }).click();
        await page.getByRole('dialog').waitFor({ state: 'visible' });
        await page.locator('.lightbox-image img').evaluate(img => img.decode());
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press('Tab');
          assert(await page.evaluate(() => !!document.activeElement.closest('dialog')), `${setup.name}: modal focus escape`);
        }
        await page.keyboard.press('ArrowRight');
        await page.locator('.lightbox-image img').evaluate(img => img.decode());
        assert((await page.locator('#gallery-dialog-title').innerText()).startsWith('The inside'));
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.querySelectorAll('dialog[open]').length === 0);
        if (width < 900) {
          await page.getByRole('button', { name: 'Open navigation' }).click();
          await page.getByRole('dialog', { name: 'Explore Nurture' }).waitFor({ state: 'visible' });
          await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /In the making/ }).click();
          await page.waitForTimeout(300);
          assert.equal(await page.locator('dialog[open]').count(), 0);
          assert.equal(await page.evaluate(() => document.body.style.overflow), '');
        }
        await page.locator('summary').filter({ hasText: 'Can I buy it yet?' }).click();
        assert(await page.locator('.faq[open]').innerText().then(text => text.includes('not available to purchase')));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `${setup.name}: horizontal overflow`);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));
        await page.locator('.hero-inspect').click();
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-angle')).opacity === '1');
        result.layouts.push({ width, signature: true, galleryKeyboard: true, focusTrap: true, faq: true, reducedMotion: true, overflow: false });
        await page.close();
      }
      report.browsers.push(result);
    } finally { await browser.close(); }
  }
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => report.errors.push(`Lifecycle: ${error.message}`));
    await page.goto(process.env.DEV_SITE_URL || 'http://127.0.0.1:4181/nurture-v01/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    const before = await page.evaluate(() => window.__nurtureDev.stats());
    assert(before.triggers > 0 && before.lenisTickers === 1 && before.lenisActive);
    await page.locator('#object').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Enlarge the silhouette' }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page.evaluate(() => window.__nurtureDev.unmount());
    await page.waitForTimeout(200);
    const unmounted = await page.evaluate(() => ({ ...window.__nurtureDev.stats(), bodyOverflow: document.body.style.overflow, dialogs: document.querySelectorAll('dialog[open]').length }));
    assert.equal(unmounted.triggers, 0);
    assert.equal(unmounted.animations, 0);
    assert.equal(unmounted.lenisTickers, 0);
    assert.equal(unmounted.lenisActive, false);
    assert.equal(unmounted.bodyOverflow, '');
    assert.equal(unmounted.dialogs, 0);
    await page.evaluate(() => { scrollTo(0,0); window.__nurtureDev.remount(); });
    await page.waitForTimeout(1800);
    const remounted = await page.evaluate(() => window.__nurtureDev.stats());
    assert.equal(remounted.triggers, before.triggers);
    assert.equal(remounted.lenisTickers, 1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(250);
    const reduced = await page.evaluate(() => window.__nurtureDev.stats());
    assert.equal(reduced.triggers, 0);
    assert.equal(reduced.lenisTickers, 0);
    assert.equal(reduced.lenisActive, false);
    report.cleanup = { before, unmounted, remounted, reduced };
  } finally { await browser.close(); }
  assert.equal(report.errors.length, 0);
  report.passed = true;
} catch (error) { report.passed = false; report.failure = error.stack; throw error; }
finally { await writeFile(new URL('../verification/cross-browser.json', import.meta.url), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); }
