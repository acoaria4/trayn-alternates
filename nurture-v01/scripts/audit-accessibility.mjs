import { createRequire } from 'node:module';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
await mkdir(new URL('../verification/', import.meta.url), { recursive: true });
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
const reports = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(process.env.SITE_URL || 'http://127.0.0.1:4180/nurture-v01/', { waitUntil: 'networkidle' });
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    reports.push({ width, passes: result.passes.length, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ targets: n.target, summary: n.failureSummary })) })), incomplete: result.incomplete.map(v => v.id) });
    await context.close();
  }
  await writeFile('verification/accessibility.json', JSON.stringify(reports,null,2));
  console.log(JSON.stringify(reports,null,2));
  if (reports.some(report => report.violations.length)) process.exitCode = 1;
} finally { await browser.close(); }
