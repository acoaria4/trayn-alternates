import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/** One motion owner; native touch and reduced-motion alternatives. */
export function useCinematicMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const refresh = () => { clearTimeout(refreshTimer); if (!disposed) refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100); };

    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 900px)', fine: '(hover: hover) and (pointer: fine)' }, context => {
      const { motion, desktop, fine } = context.conditions!;
      if (!motion) { element.dataset.motion = 'reduced'; return () => { delete element.dataset.motion; }; }
      element.dataset.motion = desktop ? 'full' : 'touch';
      let lenis: Lenis | undefined;
      if (desktop && fine) {
        lenis = new Lenis({ lerp: .085, smoothWheel: true, anchors: true, autoRaf: false });
        lenis.on('scroll', ScrollTrigger.update);
      }
      function radianceWorldTick(time: number) { lenis?.raf(time * 1000); }
      if (lenis) gsap.ticker.add(radianceWorldTick);
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.from('.rv3-hero-line', { yPercent: 35, opacity: .65, duration: 1.2, stagger: .12 })
        .from('.rv3-floating-tin', { y: 70, rotate: -8, duration: 1.4 }, .1)
        .from(['.rv3-hero-label','.rv3-orbit-link','.rv3-hero-description'], { opacity: .8, y: 18, stagger: .08, duration: .8 }, .35);
      if (desktop) {
        gsap.timeline({ scrollTrigger: { trigger: '.rv3-hero', start: 'top top', end: 'bottom top', scrub: .9 } })
          .to('.rv3-hero-line-one', { xPercent: -16, yPercent: -12, ease: 'none' }, 0)
          .to('.rv3-hero-line-two', { xPercent: 14, ease: 'none' }, 0)
          .to('.rv3-floating-tin', { yPercent: -15, rotate: 15, scale: .9, ease: 'none' }, 0)
          .to('.rv3-world-background', { scale: 1.13, yPercent: 6, ease: 'none' }, 0);
      }
      gsap.fromTo('.rv3-read-word', { color: '#8b7a66' }, { color: '#3d2b1d', stagger: .18, ease: 'none', scrollTrigger: { trigger: '.rv3-reading', start: 'top 80%', end: 'bottom 45%', scrub: .4 } });
      gsap.utils.toArray<HTMLElement>('[data-reveal]', element).forEach(target => {
        gsap.from(target, { opacity: .7, y: 36, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: target, start: 'top 90%', once: true } });
      });
      const journey = element.querySelector<HTMLElement>('.rv3-journey')!;
      const stage = element.querySelector<HTMLElement>('.rv3-chapter-stage')!;
      const track = element.querySelector<HTMLElement>('.rv3-chapter-track')!;
      const links = [...element.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')];
      let selected = -1;
      const setChapter = (index: number) => {
        if (index === selected) return;
        selected = index;
        links.forEach((link, i) => { if (i === index) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current'); });
        const counter = element.querySelector('.rv3-chapter-counter');
        if (counter) counter.textContent = `0${index + 1} / 03`;
      };
      let journeyTrigger: ScrollTrigger | undefined;
      if (desktop) {
        const tween = gsap.to(track, { x: () => -(track.scrollWidth - stage.clientWidth), ease: 'none', scrollTrigger: { trigger: journey, start: 'top top', end: () => `+=${stage.clientWidth * 2.25}`, scrub: 1, pin: stage, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: self => { setChapter(Math.min(2, Math.round(self.progress * 2))); } } });
        journeyTrigger = tween.scrollTrigger;
        gsap.fromTo('.rv3-journey-progress>span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: journey, start: 'top top', end: () => `+=${stage.clientWidth * 2.25}`, scrub: true } });
        setChapter(0);
      } else {
        element.querySelectorAll<HTMLElement>('.rv3-chapter-panel').forEach((panel, index) => { ScrollTrigger.create({ trigger: panel, start: 'top 55%', end: 'bottom 55%', onEnter: () => setChapter(index), onEnterBack: () => setChapter(index) }); });
      }
      const chapterClick = (event: MouseEvent) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>('[data-chapter-link]');
        if (!link || !journeyTrigger || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        event.stopPropagation();
        const index = Number(link.dataset.chapterLink), target = journeyTrigger.start + (journeyTrigger.end - journeyTrigger.start) * index / 2;
        if (lenis) lenis.scrollTo(target, { duration: event.detail === 0 ? 0 : .9, immediate: event.detail === 0 });
        else window.scrollTo({ top: target, behavior: 'instant' });
        history.replaceState(null, '', link.hash);
      };
      stage.addEventListener('click', chapterClick);
      const pointer = (event: PointerEvent) => {
        if (!desktop || !fine || event.pointerType === 'touch') return;
        const rect = element.querySelector('.rv3-hero')!.getBoundingClientRect();
        const x = event.clientX / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
        gsap.to('.rv3-floating-depth', { x: x * 30, y: y * 20, rotateY: x * 8, rotateX: -y * 5, duration: 1.1, ease: 'power3.out', overwrite: true });
        gsap.to('.rv3-world-depth', { x: x * -12, y: y * -8, duration: 1.1, overwrite: true });
      };
      const resetPointer = () => { gsap.to(['.rv3-floating-depth','.rv3-world-depth'], { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: .8, overwrite: true }); };
      const hero = element.querySelector<HTMLElement>('.rv3-hero')!;
      hero.addEventListener('pointermove', pointer, { passive: true }); hero.addEventListener('pointerleave', resetPointer);
      const onVisibility = () => { if (document.hidden) lenis?.stop(); else { lenis?.start(); refresh(); } };
      document.addEventListener('visibilitychange', onVisibility);
      refresh();
      return () => {
        stage.removeEventListener('click', chapterClick); hero.removeEventListener('pointermove', pointer); hero.removeEventListener('pointerleave', resetPointer);
        document.removeEventListener('visibilitychange', onVisibility);
        gsap.killTweensOf(['.rv3-floating-depth','.rv3-world-depth']);
        gsap.set(['.rv3-floating-depth','.rv3-world-depth'], { clearProps: 'transform' });
        if (lenis) { gsap.ticker.remove(radianceWorldTick); lenis.destroy(); }
        links.forEach(link => link.removeAttribute('aria-current')); delete element.dataset.motion;
      };
    }, element);
    element.addEventListener('load', refresh, true); element.addEventListener('toggle', refresh, true);
    document.fonts.ready.then(() => { if (!disposed) refresh(); });
    return () => { disposed = true; clearTimeout(refreshTimer); element.removeEventListener('load', refresh, true); element.removeEventListener('toggle', refresh, true); media.revert(); };
  }, [root]);
}
