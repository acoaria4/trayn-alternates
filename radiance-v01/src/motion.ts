import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const radianceMotion = { hero: 1.2, heading: .7, section: .65, detail: .2, scrub: .6 } as const;

export function useRadianceMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let activeLenis: Lenis | undefined;
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(pointer: fine) and (min-width: 900px)' }, match => {
      if (!match.conditions?.motion) return;
      const desktop = Boolean(match.conditions.desktop);
      const context = gsap.context(() => {
        const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (desktop) hero.from('.rd-hero-media > img', { scale: 1.025, duration: radianceMotion.hero, ease: 'power2.out', clearProps: 'transform' }, 0);
        hero.from('.rd-hero-eyebrow', { y: 8, opacity: .7, duration: .45 }, .04);
        // Words in each logical line move together; the existing masks retain
        // the exact typography and accessible, unsplit heading.
        element.querySelectorAll('.rd-hero-title .rd-heading-line').forEach((line, index) => {
          hero.from(line.querySelectorAll('.rd-word-inner'), { yPercent: 105, duration: desktop ? .72 : .58 }, .12 + index * .08);
        });
        hero.from('.rd-hero-copy', { y: 10, opacity: .8, duration: .5 }, .38)
          .from('.rd-hero-content .rd-button, .rd-hero-note', { y: 8, opacity: .8, duration: .45, stagger: .07 }, .52);
        element.querySelectorAll<HTMLElement>('[data-heading]:not(.rd-hero-title)').forEach(heading => {
          gsap.from(heading.querySelectorAll('.rd-word-inner'), { yPercent: 105, duration: radianceMotion.heading, stagger: desktop ? .045 : .03, ease: 'power3.out', scrollTrigger: { trigger: heading, start: 'top 93%', once: true } });
        });
        element.querySelectorAll<HTMLElement>('[data-reveal]').forEach(item => {
          gsap.from(item, { y: desktop ? 20 : 12, opacity: .8, duration: radianceMotion.section, scrollTrigger: { trigger: item, start: 'top 94%', once: true } });
        });
        if (desktop) {
          gsap.fromTo('.rd-ritual-photo > img', { scale: 1.06, yPercent: -2 }, {
            scale: 1.06, yPercent: 2, ease: 'none',
            scrollTrigger: { trigger: '.rd-ritual-photo', start: 'top bottom', end: 'bottom top', scrub: radianceMotion.scrub, invalidateOnRefresh: true },
          });
        }
      }, root);
      return () => context.revert();
    });
    media.add('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 900px)', () => {
      const lenis = new Lenis({ duration: .95, smoothWheel: true, syncTouch: false });
      activeLenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      function radianceTick(time: number) { lenis.raf(time * 1000); }
      gsap.ticker.add(radianceTick);
      const onAnchor = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        const hash = link?.getAttribute('href');
        if (!hash || hash === '#') return;
        const destination = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!destination) return;
        event.preventDefault();
        if (location.hash !== hash) history.pushState(null, '', hash);
        const offset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        lenis.scrollTo(destination.getBoundingClientRect().top + window.scrollY - offset, { immediate: event.detail === 0, onComplete: () => destination.focus({ preventScroll: true }) });
      };
      element.addEventListener('click', onAnchor);
      return () => { element.removeEventListener('click', onAnchor); gsap.ticker.remove(radianceTick); lenis.destroy(); activeLenis = undefined; };
    });
    let cancelled = false;
    let refreshFrame = 0;
    const refresh = () => {
      if (cancelled || refreshFrame) return;
      refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; if (!cancelled) { activeLenis?.resize(); ScrollTrigger.refresh(); } });
    };
    const onToggle = (event: Event) => { if ((event.target as Element).matches('.rd-faq-items details')) refresh(); };
    const onImageLoad = (event: Event) => { if (event.target instanceof HTMLImageElement) refresh(); };
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    element.addEventListener('toggle', onToggle, true);
    element.addEventListener('load', onImageLoad, true);
    return () => {
      cancelled = true; cancelAnimationFrame(refreshFrame);
      window.removeEventListener('load', refresh);
      element.removeEventListener('toggle', onToggle, true);
      element.removeEventListener('load', onImageLoad, true);
      media.revert();
    };
  }, [root]);
}
