import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const require = createRequire(import.meta.url);
await mkdir(new URL('../verification/', import.meta.url), { recursive: true });
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4180/nurture-v01/';
const report = { conditions: 'Local production preview, Chromium headless, cold cache, deviceScaleFactor 1. Not Lighthouse or field data.', samples: [], medians: {}, artifacts: {} };
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
try {
  for (const scenario of [
    { name: 'desktop-local', width: 1440, height: 900, repeats: 3, throttle: false },
    { name: 'mobile-local', width: 390, height: 844, repeats: 3, throttle: false },
    { name: 'mobile-throttled', width: 390, height: 844, repeats: 3, throttle: true },
  ]) {
    for (let trial = 0; trial < scenario.repeats; trial++) {
      const context = await browser.newContext({ viewport: { width: scenario.width, height: scenario.height }, deviceScaleFactor: 1, isMobile: scenario.width < 900, hasTouch: scenario.width < 900 });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      if (scenario.throttle) {
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
      }
      await page.addInitScript(() => {
        window.__perf = { lcp: null, cls: 0, clsSession: 0, clsLast: 0, clsFirst: 0, longTasks: [] };
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__perf.lcp = { time: entry.startTime, element: entry.element?.className || entry.element?.tagName, size: entry.size }; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            const data = window.__perf;
            if (entry.startTime - data.clsLast < 1000 && entry.startTime - data.clsFirst < 5000) data.clsSession += entry.value;
            else { data.clsFirst = entry.startTime; data.clsSession = entry.value; }
            data.clsLast = entry.startTime; data.cls = Math.max(data.cls, data.clsSession);
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(list => { window.__perf.longTasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, duration: entry.duration }))); }).observe({ type: 'longtask', buffered: true });
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2300);
      const sample = await page.evaluate(() => {
        const data = window.__perf;
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        return { lcpMs: data.lcp?.time, lcpElement: data.lcp?.element, cls: data.cls, fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, domContentLoadedMs: navigation.domContentLoadedEventEnd, loadMs: navigation.loadEventEnd, transferBytes: navigation.transferSize + resources.reduce((sum, entry) => sum + entry.transferSize, 0), requests: resources.length + 1, longTaskCount: data.longTasks.length, totalBlockingMs: data.longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0) };
      });
      if (sample.lcpMs == null || sample.fcpMs == null) throw new Error('Paint metrics unavailable');
      report.samples.push({ scenario: scenario.name, trial: trial + 1, ...(scenario.throttle ? { cpuSlowdown: 4, downloadMbps: 1.6, uploadMbps: .75, latencyMs: 150 } : {}), ...sample });
      await context.close();
    }
    const samples = report.samples.filter(sample => sample.scenario === scenario.name);
    const median = key => [...samples.map(sample => sample[key])].sort((a,b) => a-b)[Math.floor(samples.length/2)];
    report.medians[scenario.name] = Object.fromEntries(['lcpMs','cls','fcpMs','transferBytes','totalBlockingMs'].map(key => [key, median(key)]));
    console.log(scenario.name, report.medians[scenario.name]);
  }
  for (const file of await readdir(new URL('../../dist/assets/', import.meta.url))) {
    if (!file.endsWith('.js') && !file.endsWith('.css')) continue;
    const data = await readFile(new URL(`../../dist/assets/${file}`, import.meta.url));
    report.artifacts[file] = { bytes: data.length, gzipBytes: gzipSync(data).length };
  }
  report.artifacts.social = { bytes: (await stat(new URL('../assets/social/social-preview.jpg', import.meta.url))).size, width: 1200, height: 630 };
  report.completed = true;
} finally { await browser.close(); await writeFile(new URL('../verification/performance.json', import.meta.url), JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); }
