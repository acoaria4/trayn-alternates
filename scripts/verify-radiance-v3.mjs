import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pages = process.argv.includes('--pages'), dev = process.argv.includes('--dev');
const base = process.env.RADIANCE_V3_URL || (pages ? 'http://127.0.0.1:4183/trayn-alternates/radiance-v03/' : 'http://127.0.0.1:4180/radiance-v03/');
const output = fileURLToPath(new URL(`../verification/radiance-v03${pages ? '-pages' : dev ? '-dev' : ''}/`,import.meta.url));
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
const report = {url:base,layouts:[],errors:[],workflows:{}};
const watch = page => { page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`)}); };
const canvasImage = async page => createHash('sha256').update(await page.locator('.rv3-fireflies').evaluate(c=>c.toDataURL())).digest('hex');
const sceneState = (page,expected) => page.waitForFunction(v=>document.querySelector('.rv3-night')?.dataset.fireflyState===v,expected);
const chapterAligned = (page,id) => page.waitForFunction(id=>{ const box=document.getElementById(id)?.getBoundingClientRect();return box&&Math.abs(box.left)<3&&Math.abs(box.top)<3; },id);
try {
 if(dev){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});watch(page);await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__radianceV3Dev?.stats().tickers===1);
  const before=await page.evaluate(()=>window.__radianceV3Dev.stats());assert(before.triggers>0);
  await page.evaluate(()=>window.__radianceV3Dev.unmount());
  const unmounted=await page.evaluate(()=>window.__radianceV3Dev.stats());assert.equal(unmounted.triggers,0);assert.equal(unmounted.tickers,0);assert.equal(unmounted.lenis,false);
  await page.evaluate(()=>window.__radianceV3Dev.remount());await page.waitForFunction(()=>window.__radianceV3Dev.stats().tickers===1);
  const remounted=await page.evaluate(()=>window.__radianceV3Dev.stats());assert.equal(remounted.triggers,before.triggers);
  report.workflows.lifecycle={before,unmounted,remounted};await page.close();
 }else{
  for(const [width,height] of [[320,740],[390,844],[820,1180],[1440,1000],[1920,1080]]){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',...(width<500?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{})});
   const page=await context.newPage();watch(page);await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   assert(await page.getByRole('heading',{level:1,name:'Everyday. Reimagined.'}).isVisible());
   await page.waitForFunction(()=>document.querySelector('.rv3-site')?.dataset.motion==='reduced');
   if([390,1440].includes(width))await page.screenshot({path:path.join(output,`hero-${width}.png`)});
   for(const selector of ['#the-idea','#rv3-ritual-panel','#the-details','#rv3-sunburst-panel','#a-little-wonder','#questions','.rv3-closing'])await page.locator(selector).scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
   const layout=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}));
   assert(layout.document<=layout.viewport,`Overflow at ${width}`);assert.deepEqual(layout.brokenImages,[]);assert.equal(await page.locator('.pin-spacer').count(),0);
   await page.locator('.rv3-menu summary').click();assert(await page.getByRole('navigation',{name:'Radiance navigation',exact:true}).isVisible());
   await page.getByRole('navigation',{name:'Radiance navigation',exact:true}).getByRole('link',{name:'The ritual',exact:true}).click();assert.equal(await page.locator('.rv3-menu').getAttribute('open'),null);
   await page.locator('.rv3-menu summary').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.rv3-menu').getAttribute('open'),null);
   await page.getByRole('navigation',{name:'Explore the Radiance story'}).getByRole('link',{name:'The sunburst'}).click();assert.equal(new URL(page.url()).hash,'#rv3-sunburst-panel');
   await page.getByText('Can I buy Radiance yet?',{exact:true}).click();assert(await page.getByText(/Not yet. This is a product and packaging concept/).isVisible());
   await page.locator('.rv3-night').scrollIntoViewIfNeeded();await sceneState(page,'reduced');await page.waitForTimeout(150);
   const frozen=await canvasImage(page);await page.waitForTimeout(200);assert.equal(await canvasImage(page),frozen);assert(await page.getByRole('button',{name:'Gather the light'}).isDisabled());
   if([390,1440].includes(width)){
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[],`Accessibility at ${width}`);
    layout.accessibilityViolations=0;await page.locator('.rv3-night').screenshot({path:path.join(output,`fireflies-${width}.png`)});await page.screenshot({path:path.join(output,`full-${width}.png`),fullPage:true});
   }
   if(pages){const expected=new URL('radiance-v03/',process.env.PUBLIC_SITE_URL||'https://acoaria4.github.io/trayn-alternates/').href;assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),expected);}
   report.layouts.push(layout);await context.close();
  }

  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const page=await context.newPage();watch(page);await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('.rv3-site')?.dataset.motion==='full');
  assert.equal(await page.locator('.pin-spacer').count(),1);assert(await page.evaluate(()=>document.documentElement.classList.contains('lenis')));
  const story=page.getByRole('navigation',{name:'Explore the Radiance story'});
  await story.getByRole('link',{name:'The ritual',exact:true}).click();await chapterAligned(page,'rv3-ritual-panel');
  await story.getByRole('link',{name:'The signature',exact:true}).click();await chapterAligned(page,'the-details');await page.screenshot({path:path.join(output,'journey-signature.png')});
  await story.getByRole('link',{name:'The sunburst',exact:true}).focus();await page.keyboard.press('Enter');await chapterAligned(page,'rv3-sunburst-panel');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.rv3-site')?.dataset.motion==='reduced');assert.equal(await page.locator('.pin-spacer').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('lenis')),false);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.querySelector('.rv3-site')?.dataset.motion==='full');assert.equal(await page.locator('.pin-spacer').count(),1);
  await page.locator('.rv3-night').scrollIntoViewIfNeeded();await sceneState(page,'running');
  const moving=await canvasImage(page);await page.waitForTimeout(200);assert.notEqual(await canvasImage(page),moving);
  await page.getByRole('button',{name:'Gather the light'}).click();assert.equal(await page.locator('.rv3-night').getAttribute('data-firefly-formation'),'sun');
  await page.waitForTimeout(2300);await page.locator('.rv3-night').screenshot({path:path.join(output,'fireflies-sun.png')});
  await page.getByRole('button',{name:'Pause fireflies'}).click();await sceneState(page,'paused');const paused=await canvasImage(page);await page.waitForTimeout(200);assert.equal(await canvasImage(page),paused);
  await page.getByRole('button',{name:'Play fireflies'}).focus();await page.keyboard.press('Enter');await sceneState(page,'running');
  await page.getByRole('button',{name:'Release the light'}).click();assert.equal(await page.locator('.rv3-night').getAttribute('data-firefly-formation'),'free');
  await page.locator('#top').scrollIntoViewIfNeeded();await sceneState(page,'offscreen');const offscreen=await canvasImage(page);await page.waitForTimeout(200);assert.equal(await canvasImage(page),offscreen);
  report.workflows.motion='Desktop horizontal chapters, mouse/keyboard chapter selection, live reduced-motion unpin/rebuild, one Lenis instance, firefly gather/release/pause/resume and offscreen suspension passed.';
  await context.close();

  const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  const touchPage=await touch.newPage();watch(touchPage);await touchPage.goto(base,{waitUntil:'networkidle'});assert.equal(await touchPage.locator('.pin-spacer').count(),0);
  await touchPage.locator('.rv3-night').scrollIntoViewIfNeeded();await sceneState(touchPage,'running');await touchPage.getByRole('button',{name:'Gather the light'}).tap();assert.equal(await touchPage.locator('.rv3-night').getAttribute('data-firefly-formation'),'sun');
  report.workflows.touch='Native vertical story and touch gather control passed.';await touch.close();

  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await noJS.newPage();watch(staticPage);await staticPage.goto(base);
  assert(await staticPage.getByRole('heading',{level:1,name:'Everyday. Reimagined.'}).isVisible());assert.equal(await staticPage.locator('.pin-spacer').count(),0);
  await staticPage.locator('.rv3-menu summary').click();await staticPage.getByRole('navigation',{name:'Radiance navigation',exact:true}).getByRole('link',{name:'Questions',exact:true}).click();
  await staticPage.locator('.rv3-menu summary').click();await staticPage.getByText('Can I buy Radiance yet?',{exact:true}).click();assert(await staticPage.getByText(/Not yet. This is a product and packaging concept/).isVisible());
  assert.equal(await staticPage.locator('.rv3-motion-toggle').isVisible(),false);
  await staticPage.getByRole('contentinfo').getByRole('link',{name:'All alternatives',exact:true}).click();assert(await staticPage.getByRole('heading',{name:'3) Radiance v03',exact:true}).isVisible());
  report.workflows.noJavaScript='Complete static story, native menu/FAQ and picker return passed.';await noJS.close();
 }
 assert.deepEqual(report.errors,[]);report.passed=true;console.log(JSON.stringify(report,null,2));
}finally{await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));await browser.close();}
