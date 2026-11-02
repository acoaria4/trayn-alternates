import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const pages = process.argv.includes('--pages');
const base = process.env.PICKER_URL || (pages ? 'http://127.0.0.1:4183/trayn-alternates/' : 'http://127.0.0.1:4180/');
const output = new URL('../verification/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
const report = { url: base, layouts: [], errors: [] };
try {
  for (const width of [320, 390, 820, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', colorScheme: width === 820 ? 'dark' : 'light' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.getByRole('heading', { name: '1) Nurture v01', exact: true }).count(), 1);
    assert.equal(await page.getByRole('heading', { name: '2) Radiance v01', exact: true }).count(), 1);
    assert.equal(await page.getByRole('heading', { name: '3) Radiance v03', exact: true }).count(), 1);
    assert.equal(await page.locator('.picker-option').count(), 3);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    assert.equal(await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).length), 0);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `Accessibility at ${width}`);
    if ([390, 1440].includes(width)) await page.screenshot({ path: new URL(`picker-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
    if (pages) assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), process.env.PUBLIC_SITE_URL || 'https://acoaria4.github.io/trayn-alternates/');
    await page.getByRole('link', { name: '1) Nurture v01', exact: true }).click();
    await page.waitForURL(new URL('nurture-v01/', base).href);
    assert(await page.locator('.brand-nurture').isVisible());
    if (width < 760) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /All alternatives/ }).click();
    } else await page.locator('.header-link').click();
    await page.waitForURL(base);
    await page.getByRole('link', { name: '2) Radiance v01', exact: true }).click();
    await page.waitForURL(new URL('radiance-v01/', base).href);
    assert(await page.getByRole('heading', { level: 1, name: 'A little sunshine. Every day.' }).isVisible());
    await page.locator('.rd-all').click();
    await page.waitForURL(base);
    await page.getByRole('link', { name: '3) Radiance v03', exact: true }).click();
    await page.waitForURL(new URL('radiance-v03/', base).href);
    assert(await page.getByRole('heading', { level: 1, name: 'Everyday. Reimagined.' }).isVisible());
    if (width < 768) {
      await page.locator('.rv3-menu summary').click();
      await page.getByRole('navigation', { name: 'Radiance navigation' }).getByRole('link', { name: 'All alternatives' }).click();
    } else await page.locator('.rv3-all').click();
    await page.waitForURL(base);
    report.layouts.push({ width, navigation: 'picker → Nurture → picker → Radiance v01 → picker → Radiance v03 → picker', accessibilityViolations: 0 });
    await context.close();
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(base);
  await page.getByRole('link', { name: '1) Nurture v01', exact: true }).click();
  assert(await page.getByRole('heading', { level: 1 }).isVisible());
  await page.locator('.header-link').click();
  assert(await page.getByRole('heading', { name: '1) Nurture v01', exact: true }).isVisible());
  await page.getByRole('link', { name: '2) Radiance v01', exact: true }).click();
  assert(await page.getByRole('heading', { level: 1, name: 'A little sunshine. Every day.' }).isVisible());
  await page.locator('.rd-all').click();
  assert(await page.getByRole('heading', { name: '2) Radiance v01', exact: true }).isVisible());
  await page.getByRole('link', { name: '3) Radiance v03', exact: true }).click();
  assert(await page.getByRole('heading', { level: 1, name: 'Everyday. Reimagined.' }).isVisible());
  await page.locator('.rv3-all').click();
  assert(await page.getByRole('heading', { name: '3) Radiance v03', exact: true }).isVisible());
  await context.close();
  assert.deepEqual(report.errors, []);
  report.noJavaScriptNavigation = 'passed';
  console.log(JSON.stringify(report, null, 2));
} finally {
  await writeFile(new URL('picker.json', output), JSON.stringify(report, null, 2));
  await browser.close();
}
