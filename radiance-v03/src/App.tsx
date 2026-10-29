import { useEffect, useRef } from 'react';
import { radiance } from '../../radiance-v01/src/content';
import FireflySection from './FireflySection';
import FireflyAtmosphere from './FireflyAtmosphere';
import { useCinematicMotion } from './useCinematicMotion';

const shared = '../radiance-v01/assets/';
function Arrow() { return <img src={`${shared}icons/arrow-up-right.svg`} width="24" height="24" alt="" aria-hidden="true" />; }
const statement = 'Small rituals. Bigger possibilities. A familiar cup. A different way to see your everyday.';

function WorldPicture({ name, className, alt, priority = false }: { name: string; className?: string; alt: string; priority?: boolean }) {
  return <picture className={className}>
    <source type="image/avif" srcSet={`./assets/world/${name}-800.avif 800w, ./assets/world/${name}.avif 1800w`} sizes="100vw" />
    <img src={`./assets/world/${name}.webp`} srcSet={`./assets/world/${name}-800.webp 800w, ./assets/world/${name}.webp 1800w`} sizes="100vw" width="1800" height="1200" alt={alt} fetchPriority={priority ? 'high' : 'auto'} loading={priority ? 'eager' : 'lazy'} />
  </picture>;
}

function FloatingTin({ className, alt, priority = false }: { className: string; alt: string; priority?: boolean }) {
  const sizes = className === 'rv3-floating-tin' ? '(max-width: 899px) 58vw, 31vw' : '(max-width: 899px) 64vw, 36vw';
  return <picture className="rv3-tin-asset"><source type="image/avif" srcSet="./assets/world/floating-tin-540.avif 540w, ./assets/world/floating-tin.avif 900w" sizes={sizes} /><img className={className} src="./assets/world/floating-tin.webp" srcSet="./assets/world/floating-tin-540.webp 540w, ./assets/world/floating-tin.webp 900w" sizes={sizes} width="900" height="1350" alt={alt} fetchPriority={priority ? 'high' : 'auto'} loading={priority ? 'eager' : 'lazy'} /></picture>;
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  useCinematicMotion(root);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) { menu.current.open = false; menu.current.querySelector('summary')?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);
  return <div className="rv3-site" ref={root}>
    <FireflyAtmosphere>
    <a className="rv3-skip" href="#main">Skip to content</a>
    <header className="rv3-header">
      <a className="rv3-brand" href="#top" aria-label="Radiance by TRAYN Nutrition, back to top"><img src="./assets/brand/radiance-small.webp" width="150" height="50" alt="Radiance" /><span>BY TRAYN NUTRITION</span></a>
      <div className="rv3-header-actions"><a className="rv3-all" href="../">All alternatives <Arrow /></a><details className="rv3-menu" ref={menu}><summary>Explore <span aria-hidden="true" /></summary><nav aria-label="Radiance navigation" onClick={event => { if ((event.target as Element).closest('a') && menu.current) menu.current.open = false; }}><a href="#the-idea">The idea</a><a href="#the-ritual">The ritual</a><a href="#a-little-wonder">After hours</a><a href="#questions">Questions</a><a href="../">All alternatives <Arrow /></a></nav></details></div>
    </header>
    <main id="main" tabIndex={-1}>
      <section className="rv3-hero" id="top" data-firefly-focus=".5,.5" aria-labelledby="rv3-title">
        <div className="rv3-world-depth"><WorldPicture name="sun-world" className="rv3-world-background" alt="An original surreal ivory landscape with a monumental champagne-gold sun portal." priority /></div>
        <h1 id="rv3-title" aria-label="Everyday. Reimagined."><span className="rv3-hero-line rv3-hero-line-one" aria-hidden="true">Everyday.</span><span className="rv3-hero-line rv3-hero-line-two" aria-hidden="true">Reimagined.</span></h1>
        <div className="rv3-floating-depth"><FloatingTin className="rv3-floating-tin" alt="Generated Radiance Cafe Latte concept tin floating in a world of warm light." priority /></div>
        <a className="rv3-orbit-link" href="#the-idea"><span className="rv3-orbit-arrow"><Arrow /></span><span>Step into<br />Radiance</span></a>
      </section>

      <section className="rv3-manifesto rv3-container" id="the-idea" data-firefly-focus=".58,.45" aria-labelledby="rv3-manifesto-title">
        <p className="rv3-eyebrow">A new way to see the familiar.</p>
        <h2 className="rv3-reading" id="rv3-manifesto-title" aria-label={statement}>{statement.split(' ').map((word, index) => <span key={index} aria-hidden="true" className="rv3-read-word">{word}{' '}</span>)}</h2>
        <div className="rv3-manifesto-foot"><p>Radiance<br /><span>Cafe Latte protein concept</span></p><div><p>Imagined for middle-aged and older men and women living with diabetes who need protein support.</p><p className="rv3-development-note">A product in development. Formulation and suitability require technical evaluation.</p></div></div>
      </section>

      <section className="rv3-journey" id="the-ritual" data-firefly-focus=".68,.43" aria-label="The Radiance experience">
        <div className="rv3-chapter-stage">
          <nav className="rv3-chapter-nav" aria-label="Explore the Radiance story"><a href="#rv3-ritual-panel" data-chapter-link="0">The ritual</a><a href="#rv3-sunburst-panel" data-chapter-link="1">The sunburst</a><span className="rv3-chapter-counter" aria-hidden="true">01 / 02</span></nav>
          <div className="rv3-chapter-track">
            <article className="rv3-chapter-panel rv3-chapter-latte" id="rv3-ritual-panel" aria-labelledby="rv3-ritual-title">
              <WorldPicture name="latte-world" className="rv3-chapter-background" alt="An original surreal Cafe Latte scene: an ivory cup floating above dunes with a ribbon of champagne gold." />
              <p className="rv3-chapter-caption">Familiar flavour.<br />Unfamiliar possibilities.</p>
              <h2 id="rv3-ritual-title" tabIndex={-1}>Your daily<br /><em>escape.</em></h2>
              <div className="rv3-chapter-description"><span>Cafe Latte</span><p>Warm coffee notes. A few minutes that belong to you. That is our flavour direction.</p></div>
            </article>
            <article className="rv3-chapter-panel rv3-chapter-detail" id="rv3-sunburst-panel" aria-labelledby="rv3-sunburst-title">
              <img className="rv3-macro-image" src={`${shared}product/detail.webp`} width="1000" height="1250" loading="lazy" alt={radiance.details[1].alt} />
              <h2 id="rv3-sunburst-title" tabIndex={-1}>Closer.<br /><em>Brighter.</em></h2>
              <div className="rv3-chapter-description"><span>The sunburst</span><p>Light caught in the smallest details. A sunshine signature, made to be seen up close.</p></div>
            </article>
          </div>
          <div className="rv3-journey-progress" aria-hidden="true"><span /></div>
        </div>
      </section>

      <div className="rv3-bridge" data-firefly-focus=".25,.5" aria-label="A little sunshine. Every day."><span>A little sunshine.</span><span>Every day.</span></div>
      <FireflySection />

      <section className="rv3-faq rv3-container" id="questions" data-firefly-focus=".18,.5" aria-labelledby="rv3-faq-title">
        <div><p className="rv3-eyebrow">Before we go any further.</p><h2 id="rv3-faq-title" data-reveal>A little<br />clarity.</h2><p className="rv3-faq-intro">A new world to explore.<br />A concept still taking shape.</p></div>
        <div className="rv3-answers">{radiance.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div>
      </section>
      <section className="rv3-closing" data-firefly-focus=".6,.5" aria-labelledby="rv3-closing-title"><a href="#top" className="rv3-closing-link"><h2 id="rv3-closing-title">Stay on the<br /><span>bright side.</span></h2><span className="rv3-closing-arrow"><Arrow /></span><span className="rv3-back-label">Back to the light</span></a></section>
    </main>
    <footer className="rv3-footer rv3-container"><a href="../" aria-label="TRAYN Nutrition, all alternatives"><img src="./assets/brand/trayn-small.webp" width="140" height="30" alt="TRAYN Nutrition" /></a><p>Radiance is a product in development. Formulation and suitability are not yet confirmed.<br />All product and campaign images are generated concepts.</p><a href="../">All alternatives <Arrow /></a></footer>
    </FireflyAtmosphere>
  </div>;
}
