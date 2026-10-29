type Fly = { x: number; y: number; vx: number; vy: number; phase: number; depth: number; group: number };

/** Original loose flocking simulation; no assets or code from the reference site. */
export function createFireflyScene(canvas: HTMLCanvasElement, host: HTMLElement) {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return { setPaused: (_value: boolean) => {}, setReducedMotion: (_value: boolean) => {}, setGathered: (_value: boolean) => {}, destroy: () => {} };
  const ctx = context;
  let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 1, height = 1, flies: Fly[] = [], frame = 0, last = 0, time = 0;
  let visible = false, paused = false, destroyed = false, seed = 3703;
  let gathered = false;
  const pointer = { x: -1000, y: -1000, active: false };
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  function resize() {
    const oldWidth = width, oldHeight = height;
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
    const ratio = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 768 ? 65 : 150;
    if (flies.length !== count) {
      flies = Array.from({ length: count }, (_, i) => ({
        x: random() * width, y: random() * height,
        vx: (random() - .5) * .7, vy: (random() - .5) * .7,
        phase: random() * Math.PI * 2, depth: .35 + random() * .65, group: i % 3,
      }));
    } else flies.forEach(fly => { fly.x *= width / oldWidth; fly.y *= height / oldHeight; });
    draw();
  }

  function step(delta: number) {
    // Three wandering gathering points create arcs and small groups, not a rigid school.
    const centers = [0, 1, 2].map(group => ({
      x: width * (.5 + Math.sin(time * .15 + group * 2.1) * .34),
      y: height * (.5 + Math.cos(time * .19 + group * 2.5) * .3),
    }));
    // Read the same snapshot for every fly so updates are independent of iteration order.
    const previous = flies.map(fly => ({ x: fly.x, y: fly.y, vx: fly.vx, vy: fly.vy }));
    flies.forEach((fly, index) => {
      const center = centers[fly.group];
      let ax = (center.x - fly.x) * .000045, ay = (center.y - fly.y) * .000045;
      if (gathered) {
        const angle = index / flies.length * Math.PI * 2 + time * .045;
        const radius = Math.min(width, height) * (.235 + .03 * Math.sin(index * 2.4));
        ax = (width * .5 + Math.cos(angle) * radius - fly.x) * .0012 - fly.vx * .045;
        ay = (height * .54 + Math.sin(angle) * radius - fly.y) * .0012 - fly.vy * .045;
      }
      ax += Math.cos(time * .7 + fly.phase) * .008;
      ay += Math.sin(time * .8 + fly.phase * 1.3) * .012;
      let neighbors = 0, vx = 0, vy = 0;
      previous.forEach((other, j) => {
        if (j === index) return;
        const dx = fly.x - other.x, dy = fly.y - other.y, distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 900 && distanceSquared > .01) {
          ax += dx / distanceSquared * .15; ay += dy / distanceSquared * .15;
        }
        if (distanceSquared < 6400) { neighbors++; vx += other.vx; vy += other.vy; }
      });
      if (neighbors) { ax += (vx / neighbors - fly.vx) * .006; ay += (vy / neighbors - fly.vy) * .006; }
      if (pointer.active) {
        const dx = fly.x - pointer.x, dy = fly.y - pointer.y, distance = Math.hypot(dx, dy);
        if (distance < 150 && distance > .1) {
          const force = (1 - distance / 150) * .22;
          ax += dx / distance * force; ay += dy / distance * force;
        }
      }
      if (fly.x < 45) ax += .018; if (fly.x > width - 45) ax -= .018;
      if (fly.y < 45) ay += .018; if (fly.y > height - 45) ay -= .018;
      fly.vx += ax * delta; fly.vy += ay * delta;
      const speed = Math.hypot(fly.vx, fly.vy), limit = gathered ? 4 : .7 + fly.depth * 1.1;
      if (speed > limit) { fly.vx *= limit / speed; fly.vy *= limit / speed; }
      fly.x = Math.max(-15, Math.min(width + 15, fly.x + fly.vx * delta));
      fly.y = Math.max(-15, Math.min(height + 15, fly.y + fly.vy * delta));
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    flies.forEach(fly => {
      const pulse = .32 + Math.pow((Math.sin(time * 1.4 + fly.phase) + 1) / 2, 2) * .68;
      const radius = 1.2 + fly.depth * 1.9;
      // Keep the headline's reading area calm without a visible rectangular mask.
      const centerDistance = Math.hypot((fly.x / width - .5) * 2, (fly.y / height - .43) * 2);
      const alpha = pulse * fly.depth * (centerDistance < .45 ? .25 : 1);
      const halo = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, radius * 10);
      halo.addColorStop(0, `rgba(249,205,115,${alpha * .46})`);
      halo.addColorStop(.25, `rgba(229,169,64,${alpha * .13})`);
      halo.addColorStop(1, 'rgba(229,169,64,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(fly.x, fly.y, radius * 10, 0, Math.PI * 2); ctx.fill();
      // Occasional translucent paired wings turn luminous motes into living fireflies.
      if (fly.depth > .7 && pulse > .65) {
        ctx.save(); ctx.translate(fly.x, fly.y); ctx.rotate(Math.atan2(fly.vy, fly.vx) + Math.PI / 2);
        const wing = reducedMotion || paused ? 2 : 1.5 + Math.abs(Math.sin(time * 19 + fly.phase)) * 2;
        ctx.fillStyle = `rgba(238,218,166,${alpha * .27})`;
        ctx.beginPath(); ctx.ellipse(-wing, -2, wing, 3.6, -.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(wing, -2, wing, 3.6, .5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = `rgba(255,231,164,${alpha})`;
      ctx.beginPath(); ctx.ellipse(fly.x, fly.y, radius * .7, radius * 1.15, Math.atan2(fly.vy, fly.vx), 0, Math.PI * 2); ctx.fill();
    });
    host.dataset.rendered = 'true';
  }

  function tick(now: number) {
    frame = 0;
    const delta = last ? Math.min((now - last) / 16.667, 2) : 1;
    last = now; time += delta / 60; step(delta); draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    const state = reducedMotion ? 'reduced' : paused ? 'paused' : document.hidden ? 'hidden' : !visible ? 'offscreen' : 'running';
    host.dataset.fireflyState = state;
    if (state === 'running' && !destroyed) frame = requestAnimationFrame(tick);
    else draw();
  }
  function move(event: PointerEvent) {
    if (!finePointer.matches || event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true;
  }
  const leave = () => { pointer.active = false; };
  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .05 });
  resize(); resizeObserver.observe(host); visibilityObserver.observe(host);
  host.addEventListener('pointermove', move, { passive: true }); host.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', sync);
  sync();
  return {
    setPaused(value: boolean) { paused = value; sync(); },
    setReducedMotion(value: boolean) { reducedMotion = value; sync(); },
    setGathered(value: boolean) { gathered = value; host.dataset.fireflyFormation = value ? 'sun' : 'free'; },
    destroy() {
      destroyed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); visibilityObserver.disconnect();
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', sync);
      delete host.dataset.rendered; delete host.dataset.fireflyState;
      delete host.dataset.fireflyFormation;
    },
  };
}
