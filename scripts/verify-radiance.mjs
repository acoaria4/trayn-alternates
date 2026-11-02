import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pages = process.argv.includes('--pages');
const dev = process.argv.includes('--dev');
const base = process.env.RADIANCE_URL || (dev ? 'http://127.0.0.1:4181/radiance-v01/' : pages ? 'http://127.0.0.1:4183/trayn-alternates/radiance-v01/' : 'http://127.0.0.1:4180/radiance-v01/');
const output = fileURLToPath(new URL(`../verification/radiance${pages ? '-pages' : dev ? '-dev' : ''}/`, import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
const report = { url: base, layouts: [], workflows: {}, errors: [] };
function watch(page) {
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
}
const ready = page => page.waitForFunction(() => document.documentElement.dataset.radianceReady === 'true');
try {
  if (dev) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    watch(page);
    await page.goto(base, { waitUntil: 'networkidle' }); await ready(page);
    const before = await page.evaluate(() => window.__radianceDev.stats());
    assert(before.triggers > 0); assert.equal(before.lenisTickers, 1);
    assert.equal(typeof before.closingTriggerStart, 'number');
    await page.locator('.rd-faq details').evaluateAll(items => items.forEach(item => { item.open = true; }));
    await page.waitForFunction(start => window.__radianceDev.stats().closingTriggerStart > start + 100, before.closingTriggerStart);
    report.workflows.faqMeasurement = 'Opening FAQ answers refreshes the measured closing-section trigger.';
    await page.evaluate(() => window.__radianceDev.unmount());
    const unmounted = await page.evaluate(() => window.__radianceDev.stats());
    assert.equal(unmounted.triggers, 0); assert.equal(unmounted.lenisTickers, 0); assert.equal(unmounted.lenisActive, false);
    await page.evaluate(() => window.__radianceDev.remount()); await ready(page);
    const remounted = await page.evaluate(() => window.__radianceDev.stats());
    assert.equal(remounted.triggers, before.triggers); assert.equal(remounted.lenisTickers, 1);
    report.workflows.lifecycle = { before, unmounted, remounted };
  } else {
    for (const [width, height] of [[320,740], [390,844], [820,1180], [1440,1000], [1920,1080]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', colorScheme: width === 820 ? 'dark' : 'light', ...(width < 500 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
      const page = await context.newPage(); watch(page);
      await page.goto(base, { waitUntil: 'networkidle' }); await ready(page); await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.getByRole('heading', { level: 1 }).getAttribute('aria-label'), 'A little sunshine. Every day.');
      assert.equal(await page.locator('main').count(), 1);
      assert.equal(await page.locator('.rd-brand img').evaluate(image => image.complete && image.naturalWidth > 0), true);
      if (width === 390 || width === 1440) await page.screenshot({ path: path.join(output, width === 390 ? 'mobile.png' : 'desktop.png') });
      for (const selector of ['#idea', '#ritual', '#details', '#questions', '.rd-closing']) await page.locator(selector).scrollIntoViewIfNeeded();
      const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, broken: [...document.querySelectorAll('img')].filter(image => !image.complete || !image.naturalWidth).map(image => image.src), smoothScroll: document.documentElement.classList.contains('lenis') }));
      assert(layout.document <= layout.viewport, `Horizontal overflow at ${width}: ${JSON.stringify(layout)}`); assert.deepEqual(layout.broken, []); assert.equal(layout.smoothScroll, false);
      if (width === 390 || width === 1440) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        const violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
        assert.deepEqual(violations, [], `Accessibility at ${width}: ${JSON.stringify(violations)}`);
        await page.screenshot({ path: path.join(output, width === 390 ? 'mobile-full.png' : 'desktop-full.png'), fullPage: true });
        layout.accessibility = { passes: axe.passes.length, violations: 0, incomplete: axe.incomplete.map(v => v.id) };
      }
      if (pages) {
        const expected = new URL('radiance-v01/', process.env.PUBLIC_SITE_URL || 'https://acoaria4.github.io/trayn-alternates/').href;
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), expected);
        assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), new URL('assets/social/social-preview.jpg', expected).href);
      }
      if (width < 500) {
        await page.locator('.rd-menu summary').click(); assert(await page.getByRole('navigation', { name: 'Radiance mobile navigation' }).isVisible());
        await page.getByRole('navigation', { name: 'Radiance mobile navigation' }).getByRole('link', { name: 'The everyday', exact: true }).click();
        assert.equal(await page.locator('.rd-menu').getAttribute('open'), null); assert.equal(new URL(page.url()).hash, '#ritual');
        await page.locator('.rd-menu summary').click(); await page.keyboard.press('Escape');
        assert.equal(await page.locator('.rd-menu').getAttribute('open'), null); assert.equal(await page.locator('.rd-menu summary').evaluate(element => element === document.activeElement), true);
      }
      for (const [label, filename] of [['The sunshine','detail.webp'], ['The ritual','ritual.webp'], ['The signature','packaging.webp']]) {
        await page.getByRole('tab', { name: new RegExp(label) }).click();
        await page.waitForFunction(filename => document.querySelector('#rd-detail-panel .rd-detail-image')?.getAttribute('src')?.endsWith(filename), filename);
        await page.locator('#rd-detail-panel .rd-detail-image').evaluate(image => image.decode());
      }
      await page.getByRole('tab', { name: /The signature/ }).press('ArrowRight'); assert.equal(await page.getByRole('tab', { name: /The sunshine/ }).getAttribute('aria-selected'), 'true');
      await page.getByRole('tab', { name: /The sunshine/ }).press('End'); assert.equal(await page.getByRole('tab', { name: /The ritual/ }).getAttribute('aria-selected'), 'true');
      await page.getByText('Can I buy Radiance yet?', { exact: true }).click(); assert((await page.locator('.rd-faq details[open]').innerText()).includes('Not yet.'));
      report.layouts.push({ width, height, ...layout, interactions: 'detail tabs, keyboard navigation, native FAQ and responsive navigation passed' }); await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage(); watch(page);
    await page.goto(base, { waitUntil: 'networkidle' }); await ready(page);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), true);
    await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to content'); assert.notEqual(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'none');
    await page.getByRole('navigation', { name: 'Radiance navigation', exact: true }).getByRole('link', { name: 'The details', exact: true }).click();
    await page.waitForFunction(() => Math.abs(document.querySelector('#details').getBoundingClientRect().top - 24) < 6);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));
    report.workflows.motion = 'One Lenis engine on desktop; native scrolling and final content under reduced motion.'; await context.close();

    const noJs = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const staticPage = await noJs.newPage(); await staticPage.goto(base, { waitUntil: 'networkidle' });
    assert(await staticPage.getByRole('heading', { level: 1 }).isVisible()); assert.equal(await staticPage.locator('.rd-tabs').isVisible(), false);
    await staticPage.locator('.rd-menu summary').click(); await staticPage.getByRole('navigation', { name: 'Radiance mobile navigation' }).getByRole('link', { name: 'The details', exact: true }).click();
    assert.equal(await staticPage.locator('.rd-no-js-details a').count(), 2);
    await staticPage.getByText('Can I buy Radiance yet?', { exact: true }).click(); assert(await staticPage.locator('.rd-faq details[open]').isVisible());
    await staticPage.locator('.rd-all').click(); assert(await staticPage.getByRole('heading', { name: '2) Radiance v01', exact: true }).isVisible());
    report.workflows.noJavaScript = 'Prerendered story, native menu and FAQ, image links and picker return passed.'; await noJs.close();

    const failed = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await failed.route('**/assets/product/detail.webp', route => route.fulfill({ status: 404, body: '' }));
    await failed.goto(base, { waitUntil: 'networkidle' }); await ready(failed);
    await failed.getByRole('tab', { name: /The sunshine/ }).click(); await failed.getByRole('status').filter({ hasText: 'This detail could not be loaded.' }).waitFor();
    await failed.getByRole('tab', { name: /The signature/ }).click(); await failed.locator('#rd-detail-panel .rd-detail-image').waitFor(); await failed.locator('#rd-detail-panel .rd-detail-image').evaluate(image => image.decode()); assert.equal(await failed.getByRole('status').count(), 0);
    report.workflows.mediaFailure = 'Visible fallback and recovery by selecting another detail passed.'; await failed.close();

    const bundle = await browser.newPage({ viewport: { width: 390, height: 844 } }); await bundle.route('**/assets/radiance-*.js', route => route.abort());
    await bundle.goto(base, { waitUntil: 'networkidle' }); assert(await bundle.getByRole('heading', { level: 1 }).isVisible()); assert.equal(await bundle.locator('.rd-tabs').isVisible(), false);
    await bundle.locator('.rd-menu summary').click(); assert(await bundle.getByRole('navigation', { name: 'Radiance mobile navigation' }).isVisible());
    report.workflows.bundleFailure = 'Static content and native mobile navigation remain usable.'; await bundle.close();
  }
  assert.deepEqual(report.errors, []); report.passed = true;
} catch (error) { report.passed = false; report.failure = error.stack; throw error; }
finally { await writeFile(path.join(output, 'report.json'), JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); await browser.close(); }
