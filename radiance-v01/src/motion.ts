import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function useRadianceMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.rd-hero-title .rd-word-inner', { yPercent: 105, duration: 1, stagger: .075 })
          .from('.rd-hero-eyebrow, .rd-hero-copy, .rd-hero-content .rd-button, .rd-hero-note', { y: 16, opacity: .8, stagger: .065, duration: .8 }, .15);
        gsap.utils.toArray<HTMLElement>('[data-heading]:not(.rd-hero-title)').forEach(heading => {
          gsap.from(heading.querySelectorAll('.rd-word-inner'), { yPercent: 105, duration: .9, stagger: .045, ease: 'power3.out', scrollTrigger: { trigger: heading, start: 'top 93%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
          gsap.from(element, { y: 24, opacity: .78, duration: .9, scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
        });
      }, root);
      return () => context.revert();
    });
    media.add('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 900px)', () => {
      const lenis = new Lenis({ duration: .95, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
      function radianceTick(time: number) { lenis.raf(time * 1000); }
      gsap.ticker.add(radianceTick);
      const element = root.current!;
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
        lenis.scrollTo(destination.getBoundingClientRect().top + window.scrollY - offset, { onComplete: () => destination.focus({ preventScroll: true }) });
      };
      element.addEventListener('click', onAnchor);
      return () => { element.removeEventListener('click', onAnchor); gsap.ticker.remove(radianceTick); lenis.destroy(); };
    });
    let cancelled = false;
    const refresh = () => { if (!cancelled) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { cancelled = true; window.removeEventListener('load', refresh); media.revert(); };
  }, [root]);
}
