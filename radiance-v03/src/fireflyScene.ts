type Fly = { x: number; y: number; vx: number; vy: number; heading: number; attention: number; speedCap: number; phase: number; depth: number; group: number };
type QuietZone = { left: number; right: number; top: number; bottom: number; control: boolean };
type Wish = { x: number; y: number; age: number };
const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));

/** One original, viewport-sized swarm. Sunlit motes become fireflies as dusk enters. */
export function createFireflyScene(canvas: HTMLCanvasElement, host: HTMLElement) {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return { setPaused: (_value: boolean) => {}, setReducedMotion: (_value: boolean) => {}, setGathered: (_value: boolean) => {}, makeWish: () => {}, destroy: () => {} };
  const ctx = context;
  const root = host.closest('.rv3-site')!;
  const sections = [...root.querySelectorAll<HTMLElement>('[data-firefly-focus]')];
  const night = root.querySelector<HTMLElement>('.rv3-night')!;
  const menu = root.querySelector<HTMLDetailsElement>('.rv3-menu')!;
  const quietElements = [...root.querySelectorAll<HTMLElement>('.rv3-hero-line,h2,p,button,summary,.rv3-header,.rv3-chapter-nav')];
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 1, height = 1, flies: Fly[] = [], zones: QuietZone[] = [];
  let frame = 0, measureFrame = 0, last = 0, time = 0, seed = 3703;
  let paused = false, destroyed = false, gathered = false, dirty = true;
  let dusk = 0, duskTarget = 0;
  let reading = false, nightBounds = { top: 0, bottom: 0, height: 1 }, wishes: Wish[] = [];
  let anchor = { x: .5, y: .5 }, goal = { x: .5, y: .5 };
  const pointer = { x: 0, y: 0, followX: 0, followY: 0, active: false };
  const dayPopulation = () => width < 768 ? reading ? 24 : 18 : reading ? 44 : 34;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // Layout reads are cached between scroll/resize/toggle events, never per particle.
  function measure() {
    dirty = false;
    let coverage = -1;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const visible = clamp(Math.min(height, rect.bottom) - Math.max(0, rect.top), 0, height);
      if (visible > coverage) {
        coverage = visible;
        const [x, y] = section.dataset.fireflyFocus!.split(',').map(Number);
        goal = { x, y };
        reading = section.id === 'the-idea' || section.id === 'questions';
      }
    }
    const rect = night.getBoundingClientRect();
    nightBounds = { top: rect.top, bottom: rect.bottom, height: rect.height };
    duskTarget = clamp((Math.min(height, rect.bottom) - Math.max(0, rect.top)) / height);
    host.dataset.fireflyPhase = duskTarget > .5 ? 'dusk' : 'day';
    host.dataset.fireflyReading = String(reading);
    zones = quietElements.flatMap(element => {
      const control = element.matches('button,summary,.rv3-header,.rv3-chapter-nav');
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || bounds.bottom < 0 || bounds.top > height) return [];
      const boxes: DOMRect[] = [];
      if (control) boxes.push(bounds);
      else {
        // Measure actual text lines, not the large block spanning their whitespace.
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent?.trim()) continue;
          range.selectNodeContents(walker.currentNode); boxes.push(...range.getClientRects());
        }
      }
      return boxes.filter(box => box.width && box.bottom > 0 && box.top < height).map(box => ({ left: box.left - 5, right: box.right + 5, top: box.top - 3, bottom: box.bottom + 3, control }));
    });
  }

  function resize() {
    const oldWidth = width, oldHeight = height;
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
    const ratio = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.round(clamp(width * height / 15000, 40, 100));
    if (flies.length !== count) {
      flies = Array.from({ length: count }, (_, i) => {
        const angle = random() * Math.PI * 2, radius = .12 + random() * .3;
        const vx = (random() - .5) * .5, vy = (random() - .5) * .5;
        return { x: width * (.5 + Math.cos(angle) * radius), y: height * (.5 + Math.sin(angle) * radius), vx, vy, heading: Math.atan2(vy, vx) + Math.PI / 2, attention: 0, speedCap: 1, phase: random() * Math.PI * 2, depth: .35 + random() * .65, group: i % 3 };
      });
    } else flies.forEach(fly => { fly.x *= width / oldWidth; fly.y *= height / oldHeight; });
    dirty = true; measure(); draw();
  }

  function step(delta: number) {
    wishes.forEach(wish => { wish.age += delta / 60; });
    wishes = wishes.filter(wish => wish.age < 4.2);
    host.dataset.fireflyWish = wishes.length ? 'blooming' : 'idle';
    dusk += (duskTarget - dusk) * Math.min(1, delta * .045);
    anchor.x += (goal.x - anchor.x) * delta * .012;
    anchor.y += (goal.y - anchor.y) * delta * .012;
    const attraction = pointer.active && !menu.open;
    const smoothing = 1 - Math.exp(-delta / 8);
    pointer.followX += (pointer.x - pointer.followX) * smoothing;
    pointer.followY += (pointer.y - pointer.followY) * smoothing;
    const lagX = pointer.followX - pointer.x, lagY = pointer.followY - pointer.y, lag = Math.hypot(lagX, lagY);
    if (lag > 120) { pointer.followX = pointer.x + lagX / lag * 120; pointer.followY = pointer.y + lagY / lag * 120; }
    host.dataset.fireflyPointer = attraction ? 'attracting' : 'wandering';
    const forming = gathered && duskTarget > .35;
    const previous = flies.map(({ x, y, attention }) => ({ x, y, attention }));
    const influenceRadius = Math.min(350, width * .6);
    const wish = wishes.at(-1);
    const wishX = wish ? wish.x * width : 0, wishY = wish ? nightBounds.top + wish.y * nightBounds.height : 0;
    flies.forEach((fly, index) => {
      const centerX = width * (anchor.x + Math.sin(time * .12 + fly.group * 2.1) * .19);
      const centerY = height * (anchor.y + Math.cos(time * .15 + fly.group * 2.5) * .22);
      let ax = (centerX - fly.x) * .000035, ay = (centerY - fly.y) * .000035;
      // Every insect evaluates its own proximity, with no preselected follower quota.
      const proximity = attraction ? clamp((influenceRadius - Math.hypot(pointer.x - fly.x, pointer.y - fly.y)) / (influenceRadius * .4)) : 0;
      const engagement = proximity * proximity * (3 - 2 * proximity);
      fly.attention += (engagement - fly.attention) * (1 - Math.exp(-delta / 10));
      const pull = fly.attention;
      const following = pull > .01;
      if (following) {
        // Spread stable targets over a broad disc instead of packing a narrow cursor ring.
        const angle = index * 2.399963 + fly.phase * .15 + time * .035;
        const radius = 85 + Math.sqrt(index * .618034 % 1) * 125;
        // After a distant jump, ease back to wandering without chasing the new far target.
        const targetX = engagement > .001 ? pointer.followX + Math.cos(angle) * radius : fly.x;
        const targetY = engagement > .001 ? pointer.followY + Math.sin(angle) * radius * .82 : fly.y;
        ax = ax * (1 - pull) + ((targetX - fly.x) * .00145 - fly.vx * .076) * pull;
        ay = ay * (1 - pull) + ((targetY - fly.y) * .00145 - fly.vy * .076) * pull;
      } else if (wish && duskTarget > .2) {
        // A wish briefly draws the swarm into an orbit, then releases it naturally.
        const angle = index / flies.length * Math.PI * 2 + time * .65;
        const radius = Math.min(width, height) * (.12 + fly.depth * .09);
        const strength = Math.sin(Math.PI * wish.age / 4.2);
        ax += ((wishX + Math.cos(angle) * radius - fly.x) * .00065 - fly.vx * .035) * strength;
        ay += ((wishY + Math.sin(angle) * radius - fly.y) * .00065 - fly.vy * .035) * strength;
      } else if (forming) {
        // A core and twelve long rays echo the tin's embossed sunburst.
        const ray = index % 12, along = Math.floor(index / 12) / Math.max(1, Math.ceil(flies.length / 12) - 1);
        const angle = ray / 12 * Math.PI * 2 + time * .018;
        const radius = Math.min(width, height) * (.07 + along * .27);
        ax = (width * .5 + Math.cos(angle) * radius - fly.x) * .0009 - fly.vx * .05;
        ay = (height * .52 + Math.sin(angle) * radius - fly.y) * .0009 - fly.vy * .05;
      }
      ax += Math.cos(time * .55 + fly.phase) * .006;
      ay += Math.sin(time * .65 + fly.phase * 1.3) * .009;
      previous.forEach((other, j) => {
        if (j === index) return;
        const dx = fly.x - other.x, dy = fly.y - other.y, distance = Math.hypot(dx, dy);
        const attention = Math.max(pull, other.attention), spacing = 30 + attention * 20;
        if (distance < spacing && distance > .1) {
          const force = (1 - distance / spacing) * (.1 + attention * .5);
          ax += dx / distance * force; ay += dy / distance * force;
        }
      });
      if (fly.x < 35) ax += .018; if (fly.x > width - 35) ax -= .018;
      if (fly.y < 60) ay += .018; if (fly.y > height - 50) ay -= .018;
      fly.vx += ax * delta; fly.vy += ay * delta;
      const speed = Math.hypot(fly.vx, fly.vy);
      const limit = following ? .8 + fly.depth * .7 + pull * 4.5 : wish || forming ? 3 : .45 + fly.depth * .75;
      fly.speedCap += (limit - fly.speedCap) * (1 - Math.exp(-delta / 10));
      if (speed > fly.speedCap) { fly.vx *= fly.speedCap / speed; fly.vy *= fly.speedCap / speed; }
      if (speed > .08) {
        const target = Math.atan2(fly.vy, fly.vx) + Math.PI / 2;
        fly.heading += Math.atan2(Math.sin(target - fly.heading), Math.cos(target - fly.heading)) * Math.min(1, delta * (.055 + pull * .045));
      }
      fly.x = clamp(fly.x + fly.vx * delta, -15, width + 15);
      fly.y = clamp(fly.y + fly.vy * delta, -15, height + 15);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (menu.open) return;
    // Only a sparse fraction is visible in daylight; the same swarm blooms at dusk.
    const light = reducedMotion ? duskTarget : dusk;
    const dayCount = dayPopulation();
    flies.forEach((fly, index) => {
      const emergence = index < dayCount ? 1 : light;
      if (emergence < .01) return;
      const quiet = zones.find(zone => fly.x > zone.left && fly.x < zone.right && fly.y > zone.top && fly.y < zone.bottom);
      const alpha = (.65 + fly.depth * .35) * emergence * (quiet ? quiet.control ? .18 : .52 : 1);
      const pulse = .3 + ((Math.sin(time * (1.1 + fly.depth * .35) + fly.phase) + 1) / 2) ** 2 * .7;
      // Nearer insects have readable anatomy; distant ones stay small and atmospheric.
      const size = (.65 + fly.depth * .7) * (1 + light * .55);
      ctx.save(); ctx.translate(fly.x, fly.y); ctx.rotate(fly.heading); ctx.scale(size, size);

      // Light comes from the abdomen, behind the thorax and wings, rather than a dot at the centre.
      const glow = alpha * (.5 + light * .5) * pulse;
      const halo = ctx.createRadialGradient(0, 3.5, .6, 0, 3.5, 20);
      halo.addColorStop(0, `rgba(255,238,154,${glow * .8})`);
      halo.addColorStop(.12, `rgba(240,214,112,${glow * .45})`);
      halo.addColorStop(.38, `rgba(220,180,68,${glow * .13})`);
      halo.addColorStop(1, 'rgba(220,180,68,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 3.5, 20, 0, Math.PI * 2); ctx.fill();

      // Both membranes remain visible through the wingbeat, including between abdomen pulses.
      const beat = .62 + (Math.sin(time * (35 + fly.depth * 9) + fly.phase) + 1) * .19;
      for (const side of [-1, 1]) {
        ctx.save(); ctx.scale(side * beat, 1);
        const membrane = ctx.createLinearGradient(1, -2, 8, 3);
        membrane.addColorStop(0, light > .4 ? `rgba(255,242,200,${alpha * .5})` : `rgba(162,118,52,${alpha * .42})`);
        membrane.addColorStop(1, light > .4 ? `rgba(235,229,187,${alpha * .13})` : `rgba(201,164,101,${alpha * .16})`);
        ctx.fillStyle = membrane;
        ctx.strokeStyle = light > .4 ? `rgba(255,239,195,${alpha * .48})` : `rgba(146,103,43,${alpha * .45})`;
        ctx.lineWidth = .45;
        ctx.beginPath(); ctx.moveTo(.6, -2);
        ctx.bezierCurveTo(2.7, -5.4, 7.4, -5.6, 8.2, -3.8);
        ctx.bezierCurveTo(9.4, -1, 5.2, 3.3, 1, 2.2);
        ctx.bezierCurveTo(2, .2, 1.5, -1.2, .6, -2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = light > .4 ? `rgba(255,242,209,${alpha * .2})` : `rgba(146,103,43,${alpha * .22})`;
        ctx.lineWidth = .3;
        ctx.beginPath(); ctx.moveTo(1, -1.5); ctx.quadraticCurveTo(4.4, -2.7, 7.5, -3.5); ctx.stroke();
        // Two quiet leg strokes and a short antenna give the silhouette a living scale.
        ctx.strokeStyle = light > .4 ? `rgba(193,163,98,${alpha * .6})` : `rgba(111,80,38,${alpha * .55})`;
        ctx.lineWidth = .45;
        ctx.beginPath(); ctx.moveTo(.7, -.5); ctx.lineTo(2.5, .7); ctx.lineTo(3.3, 2);
        ctx.moveTo(.45, -4); ctx.quadraticCurveTo(1.1, -5.3, 1.7, -5.7); ctx.stroke();
        ctx.restore();
      }

      // A slender head and wing cases stay distinct from the warm luminous tail.
      ctx.fillStyle = light > .4 ? `rgba(91,75,37,${alpha})` : `rgba(105,74,34,${alpha})`;
      ctx.strokeStyle = `rgba(216,183,104,${alpha * (.3 + light * .4)})`; ctx.lineWidth = .4;
      ctx.beginPath(); ctx.ellipse(0, -.9, 1.25, 2.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -3.55, .85, .9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(222,189,122,${alpha * .45})`; ctx.lineWidth = .3;
      ctx.beginPath(); ctx.moveTo(0, -2.8); ctx.lineTo(0, 1); ctx.stroke();

      const tail = ctx.createLinearGradient(0, 1, 0, 5.4);
      tail.addColorStop(0, `rgba(175,137,55,${alpha * .8})`);
      tail.addColorStop(.45, `rgba(239,222,125,${alpha * (.7 + pulse * .3)})`);
      tail.addColorStop(1, `rgba(255,248,190,${alpha})`);
      ctx.fillStyle = tail; ctx.beginPath(); ctx.ellipse(0, 3, 1.45, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,220,${alpha * (.55 + pulse * .45)})`;
      ctx.beginPath(); ctx.ellipse(0, 4.05, .8, 1.15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    if (wishes.length && light > .1) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, nightBounds.top, width, nightBounds.height); ctx.clip();
      for (const wish of wishes) {
        const x = wish.x * width, y = nightBounds.top + wish.y * nightBounds.height;
        const life = wish.age / 4.2, fade = Math.sin(Math.PI * life), spread = Math.min(width, height) * .42;
        // Two thin rings and twelve small glints make a constellation bloom, not a flash.
        for (let ring = 0; ring < 2; ring++) {
          const radius = 12 + spread * clamp(life * 1.3 - ring * .12);
          ctx.strokeStyle = `rgba(239,195,112,${fade * (ring ? .12 : .24)})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
        }
        for (let i = 0; i < 12; i++) {
          const angle = i / 12 * Math.PI * 2 + life * .25;
          const radius = 15 + spread * life * (.65 + (i % 3) * .1);
          const sx = x + Math.cos(angle) * radius, sy = y + Math.sin(angle) * radius;
          const size = fade * (3 + i % 3);
          ctx.strokeStyle = `rgba(255,224,162,${fade * .65})`;
          ctx.beginPath(); ctx.moveTo(sx - size, sy); ctx.lineTo(sx + size, sy); ctx.moveTo(sx, sy - size); ctx.lineTo(sx, sy + size); ctx.stroke();
        }
      }
      ctx.restore();
    }
    host.dataset.rendered = 'true';
  }

  function tick(now: number) {
    frame = 0;
    if (dirty) measure();
    const delta = last ? Math.min((now - last) / 16.667, 2) : 1;
    last = now; time += delta / 60; step(delta); draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    const state = reducedMotion ? 'reduced' : paused ? 'paused' : document.hidden ? 'hidden' : 'running';
    host.dataset.fireflyState = state;
    if (state === 'running' && !destroyed) frame = requestAnimationFrame(tick);
    else { if (dirty) measure(); draw(); }
  }
  function invalidate() {
    dirty = true;
    // Still scenes adapt their colour/density to the new section, but never move.
    if (!frame && !document.hidden && !measureFrame) measureFrame = requestAnimationFrame(() => { measureFrame = 0; measure(); draw(); });
  }
  function move(event: PointerEvent) {
    if (!finePointer.matches || event.pointerType === 'touch' || event.target instanceof Element && event.target.closest('a,button,summary,input,textarea')) { leave(); return; }
    if (!pointer.active) {
      pointer.followX = event.clientX; pointer.followY = event.clientY;
    }
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
  }
  function makeWish(x = width * .5, y?: number) {
    if (reducedMotion || paused || document.hidden || menu.open) return;
    if (dirty) measure();
    if (duskTarget < .2) return;
    const visibleTop = Math.max(0, nightBounds.top), visibleBottom = Math.min(height, nightBounds.bottom);
    const centerY = y ?? visibleTop + (visibleBottom - visibleTop) * .65;
    wishes.push({ x: clamp(x / width), y: clamp((centerY - nightBounds.top) / nightBounds.height), age: .04 });
    wishes = wishes.slice(-3);
    host.dataset.fireflyWish = 'blooming';
  }
  function click(event: MouseEvent) {
    if (event.button !== 0 || event.target instanceof Element && event.target.closest('a,button,summary,input,textarea')) return;
    makeWish(event.clientX, event.clientY);
  }
  function leave() { pointer.active = false; }
  const resizeObserver = new ResizeObserver(resize);
  const layoutObserver = new ResizeObserver(invalidate);
  resize(); resizeObserver.observe(host); layoutObserver.observe(root);
  window.addEventListener('pointermove', move, { passive: true }); document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('scroll', invalidate, { passive: true }); window.addEventListener('blur', leave);
  root.addEventListener('toggle', invalidate, true); document.addEventListener('visibilitychange', sync);
  night.addEventListener('click', click);
  sync();
  return {
    setPaused(value: boolean) { paused = value; sync(); },
    setReducedMotion(value: boolean) { reducedMotion = value; if (value) { wishes = []; host.dataset.fireflyWish = 'idle'; } sync(); },
    setGathered(value: boolean) { gathered = value; host.dataset.fireflyFormation = value ? 'sun' : 'free'; },
    makeWish() { makeWish(); },
    destroy() {
      destroyed = true; cancelAnimationFrame(frame); cancelAnimationFrame(measureFrame); resizeObserver.disconnect(); layoutObserver.disconnect();
      window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', invalidate); window.removeEventListener('blur', leave);
      root.removeEventListener('toggle', invalidate, true); document.removeEventListener('visibilitychange', sync);
      night.removeEventListener('click', click); wishes = [];
      for (const key of ['rendered','fireflyState','fireflyFormation','fireflyPhase','fireflyPointer','fireflyWish','fireflyReading']) delete host.dataset[key];
    },
  };
}
