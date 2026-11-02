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
const swarmCenter = page => page.locator('.rv3-fireflies').evaluate(canvas=>{
 const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let mass=0,x=0;
 for(let i=3;i<pixels.length;i+=4){const alpha=pixels[i];if(alpha<60)continue;mass+=alpha;x+=((i-3)/4%canvas.width)*alpha;}
 return x/Math.max(1,mass)*innerWidth/canvas.width;
});
const sceneState = (page,expected) => page.waitForFunction(v=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyState===v,expected);
const chapterAligned = (page,id) => page.waitForFunction(id=>{ const box=document.getElementById(id)?.getBoundingClientRect();return box&&Math.abs(box.left)<3&&Math.abs(box.top)<3; },id);
try {
 if(dev){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});watch(page);await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__radianceV3Dev?.stats().tickers===1);
  const before=await page.evaluate(()=>window.__radianceV3Dev.stats());assert(before.triggers>0);
  await page.evaluate(()=>window.__radianceV3Dev.unmount());
  const unmounted=await page.evaluate(()=>window.__radianceV3Dev.stats());assert.equal(unmounted.triggers,0);assert.equal(unmounted.tickers,0);assert.equal(unmounted.lenis,false);
  assert.equal(await page.locator('.rv3-atmosphere').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('rv3-world-active')),false);
  await page.evaluate(()=>window.__radianceV3Dev.remount());await page.waitForFunction(()=>window.__radianceV3Dev.stats().tickers===1);
  const remounted=await page.evaluate(()=>window.__radianceV3Dev.stats());assert.equal(remounted.triggers,before.triggers);
  assert.equal(await page.locator('.rv3-fireflies').count(),1);await sceneState(page,'running');
  report.workflows.lifecycle={before,unmounted,remounted};await page.close();
 }else{
  for(const [width,height] of [[320,740],[390,844],[820,1180],[1440,1000],[1920,1080]]){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',...(width<500?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{})});
   const page=await context.newPage();watch(page);await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   assert(await page.getByRole('heading',{level:1,name:'Everyday. Reimagined.'}).isVisible());
   assert.equal(await page.locator('.rv3-hero-label,.rv3-hero-description,.rv3-header-flavour').count(),0);
   const explore=await page.locator('.rv3-menu summary').evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,height:el.getBoundingClientRect().height}));
   assert.equal(explore.background,'rgb(61, 43, 29)');assert(explore.height>=44);
   await page.waitForFunction(()=>document.querySelector('.rv3-site')?.dataset.motion==='reduced');
   if([390,1440].includes(width))await page.screenshot({path:path.join(output,`hero-${width}.png`)});
   assert.equal(await page.locator('.rv3-chapter-panel').count(),2);
   for(const selector of ['#the-idea','#rv3-ritual-panel','#rv3-sunburst-panel','#a-little-wonder','#questions','.rv3-closing'])await page.locator(selector).scrollIntoViewIfNeeded();
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
   assert(await page.getByRole('button',{name:'Make a wish',exact:true}).isDisabled());
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
  await sceneState(page,'running');assert.equal(await page.locator('.rv3-fireflies').count(),1);
  const opening=await canvasImage(page);await page.waitForTimeout(250);assert.notEqual(await canvasImage(page),opening);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollbarWidth),'none');
  await page.mouse.move(950,480);await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyPointer==='attracting');
  await page.waitForTimeout(4500);assert.equal(await page.locator('.rv3-atmosphere').getAttribute('data-firefly-pointer'),'attracting','A resting nearby cursor should remain interesting');
  await page.mouse.move(1350,55);await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyPointer==='wandering');
  await page.screenshot({path:path.join(output,'hero-fireflies-1440.png')});
  await page.locator('#the-idea').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyReading==='true');
  const visibleReading=await page.locator('.rv3-fireflies').evaluate(canvas=>{const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>60)visible++;return visible;});
  assert(visibleReading>150,'Reading chapter must retain visible fireflies');
  await page.screenshot({path:path.join(output,'reading-fireflies-1440.png')});
  assert.equal(await page.locator('.pin-spacer').count(),1);assert(await page.evaluate(()=>document.documentElement.classList.contains('lenis')));
  const story=page.getByRole('navigation',{name:'Explore the Radiance story'});
  await story.getByRole('link',{name:'The ritual',exact:true}).click();await chapterAligned(page,'rv3-ritual-panel');
  await story.getByRole('link',{name:'The sunburst',exact:true}).focus();await page.keyboard.press('Enter');await chapterAligned(page,'rv3-sunburst-panel');
  assert.equal(await page.locator('.rv3-chapter-counter').innerText(),'02 / 02');
  await page.screenshot({path:path.join(output,'journey-sunburst.png')});
  const midway=await page.locator('.rv3-scroll-progress').evaluate(el=>getComputedStyle(el).transform);assert.notEqual(midway,'matrix(0, 0, 0, 1, 0, 0)');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.rv3-site')?.dataset.motion==='reduced');assert.equal(await page.locator('.pin-spacer').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('lenis')),false);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.querySelector('.rv3-site')?.dataset.motion==='full');assert.equal(await page.locator('.pin-spacer').count(),1);
  await page.locator('.rv3-night').scrollIntoViewIfNeeded();await sceneState(page,'running');
  const moving=await canvasImage(page);await page.waitForTimeout(200);assert.notEqual(await canvasImage(page),moving);
  await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyPhase==='dusk');
  // A nearby cursor can lead the swarm; a distant jump must not recall it across the page.
  await page.mouse.move(720,600);await page.waitForTimeout(700);
  for(let x=670;x>=220;x-=50){await page.mouse.move(x,700);await page.waitForTimeout(180);}
  await page.waitForTimeout(1200);const leftCenter=await swarmCenter(page);
  await page.screenshot({path:path.join(output,'fireflies-follow-left.png')});
  await page.mouse.move(1380,130);await page.waitForTimeout(700);const distantCenter=await swarmCenter(page);
  assert(Math.abs(distantCenter-leftCenter)<130,`A distant cursor should not recall the flock: ${leftCenter} → ${distantCenter}`);
  await page.mouse.move(220,700);
  for(let x=270;x<=1220;x+=50){await page.mouse.move(x,700);await page.waitForTimeout(180);}
  await page.waitForTimeout(1200);const rightCenter=await swarmCenter(page);
  assert(rightCenter-leftCenter>120,`The flock should visibly follow across the page: ${leftCenter} → ${rightCenter}`);
  await page.screenshot({path:path.join(output,'fireflies-follow-right.png')});
  report.workflows.mouseTracking={leftCenter,distantCenter,rightCenter,displacement:rightCenter-leftCenter};
  await page.getByRole('button',{name:'Make a wish',exact:true}).focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyWish==='blooming');
  await page.waitForTimeout(1000);await page.screenshot({path:path.join(output,'firefly-wish-1440.png')});
  await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyWish==='idle');
  const nightBox=await page.locator('.rv3-night').boundingBox();await page.mouse.click(nightBox.x+nightBox.width*.7,Math.max(100,nightBox.y+300));
  await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyWish==='blooming');
  await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyWish==='idle');
  await page.getByRole('button',{name:'Gather the light'}).click();assert.equal(await page.locator('.rv3-atmosphere').getAttribute('data-firefly-formation'),'sun');
  await page.waitForTimeout(2300);await page.locator('.rv3-night').screenshot({path:path.join(output,'fireflies-sun.png')});
  await page.getByRole('button',{name:'Pause lights'}).click();await sceneState(page,'paused');const paused=await canvasImage(page);await page.waitForTimeout(200);assert.equal(await canvasImage(page),paused);
  await page.getByRole('button',{name:'Play lights'}).focus();await page.keyboard.press('Enter');await sceneState(page,'running');
  await page.getByRole('button',{name:'Release the light'}).click();assert.equal(await page.locator('.rv3-atmosphere').getAttribute('data-firefly-formation'),'free');
  await page.locator('.rv3-closing').scrollIntoViewIfNeeded();await sceneState(page,'running');
  await page.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyPhase==='day');
  await page.keyboard.press('End');await page.waitForFunction(()=>Math.abs(scrollY-(document.documentElement.scrollHeight-innerHeight))<3);
  await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.rv3-scroll-progress')).transform.match(/matrix\(([^,]+)/)?.[1])>.999);
  await page.keyboard.press('Home');await page.waitForFunction(()=>scrollY<3);await sceneState(page,'running');
  report.workflows.motion='Persistent opening-to-closing swarm, visible reading lights, pointer attraction, click and keyboard wish blooms, two chapters, top progress endpoints, live reduced motion and global pause/resume passed.';
  await context.close();

  const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  const touchPage=await touch.newPage();watch(touchPage);await touchPage.goto(base,{waitUntil:'networkidle'});assert.equal(await touchPage.locator('.pin-spacer').count(),0);
  await sceneState(touchPage,'running');await touchPage.screenshot({path:path.join(output,'hero-fireflies-390.png')});
  await touchPage.locator('.rv3-night').scrollIntoViewIfNeeded();await sceneState(touchPage,'running');
  await touchPage.getByRole('button',{name:'Make a wish',exact:true}).tap();await touchPage.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyWish==='blooming');
  await touchPage.waitForTimeout(900);await touchPage.screenshot({path:path.join(output,'firefly-wish-390.png')});
  await touchPage.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyWish==='idle');
  const touchNight=await touchPage.locator('.rv3-night').boundingBox();await touchPage.touchscreen.tap(200,Math.max(100,touchNight.y+300));
  await touchPage.waitForFunction(()=>document.querySelector('.rv3-atmosphere')?.dataset.fireflyWish==='blooming');
  await touchPage.getByRole('button',{name:'Gather the light'}).tap();assert.equal(await touchPage.locator('.rv3-atmosphere').getAttribute('data-firefly-formation'),'sun');
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
