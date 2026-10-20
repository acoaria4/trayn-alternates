import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export function useMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-word', { y: 20, opacity: .65, duration: .85 })
          .from('.hero-product', { y: 18, duration: 1 }, .05)
          .from('.hero-description, .hero-cta', { y: 12, opacity: .7, stagger: .08, duration: .65 }, .2);
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
          gsap.from(element, { y: 22, duration: .85, scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('[data-word-reveal]').forEach(element => {
          gsap.from(element.querySelectorAll('.word-inner'), { yPercent: 105, duration: .85, stagger: .035, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
        });
      }, root);
      return () => context.revert();
    });
    media.add('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 900px)', () => {
      const lenis = new Lenis({ duration: .9, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      const element = root.current!;
      const onAnchor = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        const hash = link?.getAttribute('href');
        if (!hash || hash === '#') return;
        const destination = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!destination) return;
        event.preventDefault();
        if (location.hash !== hash) history.pushState(null, '', hash);
        const offset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        lenis.scrollTo(destination.getBoundingClientRect().top + window.scrollY - offset, { onComplete: () => { if (destination.id === 'main') destination.focus({ preventScroll: true }); } });
      };
      element.addEventListener('click', onAnchor);
      return () => { element.removeEventListener('click', onAnchor); gsap.ticker.remove(tick); lenis.destroy(); };
    });
    let cancelled = false;
    const refresh = () => { if (!cancelled) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { cancelled = true; window.removeEventListener('load', refresh); media.revert(); };
  }, [root]);
}
