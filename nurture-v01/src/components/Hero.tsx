import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { product } from '../content/product';
import { Arrow } from './Typography';

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const angle = useRef<HTMLImageElement>(null);
  const front = useRef<HTMLImageElement>(null);
  const [inspecting, setInspecting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (front.current?.complete && front.current.naturalWidth > 0) setLoaded(true);
  }, []);
  const active = useRef(false);
  const sequence = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 759px)' }, context => {
      const { reduce, mobile } = context.conditions!;
      const notes = root.current!.querySelectorAll('.hero-detail-note');
      sequence.current = null;
      gsap.set(angle.current, { opacity: active.current ? 0 : 1, scale: 1 });
      gsap.set(front.current, { opacity: active.current ? 1 : 0, scale: 1, y: 0 });
      gsap.set(notes, { opacity: active.current ? 1 : 0, y: active.current ? 0 : 8 });
      if (reduce) return;
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      timeline.fromTo(angle.current, { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.035, duration: .4 }, 0)
        .fromTo(front.current, { opacity: 0, scale: 1, y: 0 }, { opacity: 1, scale: mobile ? 1.025 : 1.055, y: mobile ? 0 : -7, duration: .8 }, .05)
        .fromTo(notes, { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: .08, duration: .45 }, .4);
      sequence.current = timeline;
      timeline.progress(active.current ? 1 : 0).pause();
      return () => { timeline.kill(); sequence.current = null; };
    }, root);
    return () => media.revert();
  }, []);
  useEffect(() => {
    active.current = inspecting;
    if (sequence.current) {
      if (inspecting) sequence.current.play();
      else sequence.current.reverse();
    } else {
      gsap.set(angle.current, { opacity: inspecting ? 0 : 1 });
      gsap.set(front.current, { opacity: inspecting ? 1 : 0, scale: 1, y: 0 });
      gsap.set(root.current!.querySelectorAll('.hero-detail-note'), { opacity: inspecting ? 1 : 0, y: 0 });
    }
  }, [inspecting]);
  return <section ref={root} className="hero" aria-labelledby="hero-title">
    <div className="hero-copy">
      <p className="eyebrow">Nurture Everyday · By TRAYN Nutrition</p>
      <h1 className="hero-word" id="hero-title" aria-label="Nurture Everyday — The everyday, considered."><span>The everyday,</span><em>considered.</em></h1>
      <p className="hero-description">Everyday Nutrition for Every Woman.<br />A little room in the day, just for you.</p>
      <a className="primary-link hero-cta" href="#object">Explore the concept <Arrow diagonal /></a>
      <div className="hero-status"><span className="status-line" /><p>A product concept, taking shape.<br /><span>Discover the idea before the launch.</span></p></div>
    </div>
    <div className="hero-study" id="hero-study" role="region" aria-label="Nurture packaging study">
      <div className="hero-stage">
        <div className="hero-stage-top"><span>Object study / 01</span><span>400g on reference artwork</span></div>
        <div className="hero-product" role="img" aria-label={inspecting ? 'Front view of the Nurture cream tin, gold lid and botanical artwork' : 'Three-quarter view of the Nurture Everyday concept tin'}>
          <picture>
            <source media="(max-width: 759px)" srcSet={`${product.media.heroMobileSmall} 360w, ${product.media.heroMobile} 720w`} sizes="(max-width: 370px) 190px, 215px" />
            <img className="hero-angle" ref={angle} src={product.media.hero} srcSet={`${product.media.heroSmall} 600w, ${product.media.hero} 1000w`} sizes="29vw" width="1000" height="1500" alt="" fetchPriority="high" />
          </picture>
          <picture>
            <source media="(max-width: 759px)" srcSet={`${product.media.frontMobileSmall} 360w, ${product.media.frontMobile} 720w`} sizes="(max-width: 370px) 190px, 215px" />
            <img className="hero-front" ref={front} src={product.media.front} srcSet={`${product.media.frontSmall} 600w, ${product.media.front} 1000w`} sizes="29vw" width="1000" height="1500" alt="" loading="eager" onLoad={() => { setLoaded(true); setFailed(false); }} onError={() => setFailed(true)} />
          </picture>
        </div>
        <div className="hero-detail-notes" aria-hidden={!inspecting}>
          <p className="hero-detail-note"><span>01</span>A warm gold finish.</p>
          <p className="hero-detail-note"><span>02</span>Botanical linework.</p>
        </div>
        <span className="hero-stage-edition" aria-hidden="true">Everyday, by design.</span>
      </div>
      <div className="hero-study-bottom"><span>Generated packaging concept</span><button className="hero-inspect" type="button" aria-controls="hero-study" aria-pressed={inspecting} disabled={!loaded || failed} onClick={() => setInspecting(value => !value)}>{failed ? 'Front view unavailable' : !loaded ? 'Loading detail view…' : inspecting ? 'Return to the silhouette' : 'A closer look'}<span aria-hidden="true">{inspecting ? '−' : '+'}</span></button></div>
      <p className="sr-only" aria-live="polite">{inspecting ? 'Front artwork: warm gold finish and botanical linework.' : 'Three-quarter silhouette of the packaging concept.'}</p>
    </div>
    <div className="hero-baseline"><span>Everyday care, thoughtfully imagined.</span><a href="#intention">The idea behind Nurture <span aria-hidden="true">↓</span></a></div>
  </section>;
}
