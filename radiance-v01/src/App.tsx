import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { radiance } from './content';
import { useRadianceMotion } from './motion';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <img src={`./assets/icons/arrow-${diagonal ? 'up-right' : 'right'}.svg`} width="20" height="20" alt="" aria-hidden="true" />;
}

function Heading({ text, as = 'h2', className = '' }: { text: string; as?: 'h1' | 'h2'; className?: string }) {
  const Tag = as;
  return <Tag className={className} aria-label={text.replaceAll('\n', ' ')} data-heading>
    {text.split('\n').map((line, index) => <span className="rd-heading-line" aria-hidden="true" key={index}>{line.split(' ').map((word, i) => <span className="rd-word" key={i}><span className="rd-word-inner">{word}</span>{i < line.split(' ').length - 1 ? ' ' : ''}</span>)}</span>)}
  </Tag>;
}

function Brand() {
  const [failed, setFailed] = useState(false);
  return <a className="rd-brand" href="#top" aria-label="Radiance by TRAYN Nutrition — home">
    {failed ? <span className="rd-brand-fallback">Radiance</span> : <img src="./assets/brand/radiance-wordmark.webp" width="284" height="100" alt="Radiance" onError={() => setFailed(true)} />}
    <span>BY TRAYN NUTRITION</span>
  </a>;
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const [selected, setSelected] = useState(0);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const detailImage = useRef<HTMLImageElement>(null);
  const current = radiance.details[selected];
  useRadianceMotion(root);

  useEffect(() => {
    setEnhanced(true);
    document.documentElement.dataset.radianceReady = 'true';
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('keydown', close); delete document.documentElement.dataset.radianceReady; };
  }, []);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !detailImage.current) return;
    const tween = gsap.fromTo(detailImage.current, { opacity: .65, y: 12 }, { opacity: 1, y: 0, duration: .55, ease: 'power2.out', clearProps: 'all' });
    return () => { tween.revert(); };
  }, [selected]);

  function choose(index: number) { setSelected(index); setMediaFailed(false); }
  function detailKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? radiance.details.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + radiance.details.length) % radiance.details.length;
    choose(next);
    document.getElementById(`rd-tab-${radiance.details[next].id}`)?.focus();
  }

  const links = <><a href="#idea">The idea</a><a href="#ritual">The everyday</a><a href="#details">The details</a></>;
  return <div className="rd-site" ref={root}>
    <a className="rd-skip" href="#main">Skip to content</a>
    <header className="rd-header">
      <Brand />
      <nav className="rd-desktop-nav" aria-label="Radiance navigation">{links}</nav>
      <div className="rd-header-actions">
        <a className="rd-all" href="../">All alternatives <Arrow diagonal /></a>
        <details className="rd-menu" ref={menu}>
          <summary>Explore <span aria-hidden="true" className="rd-menu-mark" /></summary>
          <nav aria-label="Radiance mobile navigation" onClick={event => { if ((event.target as Element).closest('a') && menu.current) menu.current.open = false; }}>{links}<a href="../">All alternatives <Arrow diagonal /></a></nav>
        </details>
      </div>
    </header>

    <main id="main" tabIndex={-1}>
      <section className="rd-hero" id="top" aria-labelledby="rd-hero-label">
        <picture className="rd-hero-media">
          <source media="(max-width: 700px)" srcSet="./assets/product/packaging-600.webp 600w, ./assets/product/packaging.webp 1000w" sizes="100vw" />
          <img src="./assets/product/hero.webp" srcSet="./assets/product/hero-1000.webp 1000w, ./assets/product/hero.webp 1800w" sizes="100vw" width="1800" height="1125" alt="Generated Radiance Cafe Latte concept tin and a ceramic coffee cup in warm morning sunlight." fetchPriority="high" />
        </picture>
        <div className="rd-hero-content">
          <p className="rd-eyebrow rd-hero-eyebrow" id="rd-hero-label"><span className="rd-sun-dot" aria-hidden="true" /> A lovely little everyday</p>
          <Heading as="h1" text={'A little sunshine.\nEvery day.'} className="rd-hero-title" />
          <p className="rd-hero-copy">Meet Radiance. A Cafe Latte protein concept,<br className="rd-desktop-break" /> made with a brighter everyday in mind.</p>
          <a className="rd-button" href="#idea">Discover Radiance <span><Arrow diagonal /></span></a>
          <p className="rd-hero-note">Cafe Latte <span aria-hidden="true">·</span> A product in development</p>
        </div>
        <div className="rd-hero-foot"><span>GOOD THINGS, IN EVERYDAY MOMENTS.</span><a href="#idea">Take a little look <span aria-hidden="true">↓</span></a></div>
      </section>

      <section className="rd-intro rd-section" id="idea" tabIndex={-1}>
        <p className="rd-eyebrow" data-reveal>A little care goes a long way</p>
        <Heading text={'Made for a life\nwell lived.'} />
        <p className="rd-intro-lead" data-reveal>There is something lovely about the little things.<br />A familiar cup. A slower moment. A little care for yourself.</p>
        <p className="rd-body rd-intro-body" data-reveal>That is the feeling behind Radiance: an everyday protein concept for middle-aged and older men and women living with diabetes. Thoughtfully imagined, with the warmth of Cafe Latte and a little sunshine in the details.</p>
        <div className="rd-intro-signature" data-reveal><span className="rd-fine-line" /><span>For the everyday. For you.</span><span className="rd-fine-line" /></div>
      </section>

      <section className="rd-ritual rd-section" id="ritual" tabIndex={-1}>
        <div className="rd-photo-frame" data-reveal>
          <figure className="rd-ritual-photo"><img src="./assets/product/ritual.webp" srcSet="./assets/product/ritual-700.webp 700w, ./assets/product/ritual.webp 1400w" sizes="(max-width: 800px) 90vw, 49vw" width="1400" height="933" loading="lazy" alt="Generated concept still life: a comforting Cafe Latte cup beside the Radiance tin, linen and a book in soft sunlight." /><figcaption>A moment, just for you. <span>Concept imagery</span></figcaption></figure>
        </div>
        <div className="rd-ritual-copy">
          <p className="rd-eyebrow" data-reveal>The everyday, a little brighter</p>
          <Heading text={'Make room for\na lovely little ritual.'} />
          <p className="rd-body" data-reveal>Something to look forward to. A familiar flavour. A few quiet minutes in a day that belongs to you.</p>
          <p className="rd-body" data-reveal>Radiance brings those everyday moments into the way we think about nutrition. Warm, considered, and made to feel at home in your routine.</p>
          <div className="rd-ritual-note" data-reveal><span className="rd-small-sun" aria-hidden="true">✳</span><p><strong>Cafe Latte</strong><span>Our flavour direction. A familiar kind of comfort.</span></p></div>
          <a className="rd-text-link" href="#details">Get to know the details <Arrow diagonal /></a>
        </div>
      </section>

      <section className="rd-details" id="details" tabIndex={-1}>
        <div className="rd-details-inner">
          <div className="rd-details-copy">
            <p className="rd-eyebrow" data-reveal>Thoughtfully imagined, inside & out</p>
            <Heading text={'Beauty in\nthe little things.'} />
            <p className="rd-body" data-reveal>Warm ivory. A touch of gold. A name with a little life. Discover the small details that make Radiance feel like Radiance.</p>
            <div className="rd-tabs" hidden={!enhanced} role={enhanced ? 'tablist' : undefined} aria-orientation={enhanced ? 'vertical' : undefined} aria-label="Explore the Radiance packaging">
              {radiance.details.map((detail, index) => <button type="button" key={detail.id} id={`rd-tab-${detail.id}`} role={enhanced ? 'tab' : undefined} aria-selected={enhanced ? selected === index : undefined} aria-controls={enhanced ? 'rd-detail-panel' : undefined} tabIndex={enhanced && selected !== index ? -1 : 0} onKeyDown={event => detailKey(event, index)} onClick={() => choose(index)} className={selected === index ? 'is-selected' : ''}><span className="rd-tab-number">0{index + 1}</span>{detail.label}<span className="rd-tab-arrow"><Arrow diagonal /></span></button>)}
            </div>
            <div className="rd-detail-description" aria-live="polite"><h3>{current.title}</h3><p>{current.text}</p></div>
            <p className="rd-detail-disclosure">Generated packaging study. Final artwork may evolve.</p>
          </div>
          <div className="rd-detail-frame" id="rd-detail-panel" role={enhanced ? 'tabpanel' : undefined} aria-labelledby={enhanced ? `rd-tab-${current.id}` : undefined} tabIndex={enhanced ? 0 : undefined}>
            {mediaFailed ? <div className="rd-media-error" role="status"><p>This detail could not be loaded.</p><a href="./assets/product/packaging.webp">Open the packaging image</a></div> : <img ref={detailImage} key={current.id} src={current.image} width="1000" height="1500" loading="lazy" alt={current.alt} onError={() => setMediaFailed(true)} />}
            <span className="rd-detail-caption">RADIANCE <span>CAFE LATTE / CONCEPT 02</span></span>
          </div>
          <noscript><div className="rd-no-js-details">Explore the photographs: <a href="./assets/product/detail.webp">The embossed sunburst</a><a href="./assets/product/ritual.webp">The morning ritual</a></div></noscript>
        </div>
      </section>

      <section className="rd-faq rd-section" id="questions" tabIndex={-1}>
        <div className="rd-faq-intro"><p className="rd-eyebrow" data-reveal>A little more to know</p><Heading text={'Good questions.\nThoughtful answers.'} /><p className="rd-body" data-reveal>Radiance is taking shape. Here is where we are, and what is still to come.</p></div>
        <div className="rd-faq-items">{radiance.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div>
      </section>

      <section className="rd-closing">
        <p className="rd-eyebrow" data-reveal>Here is to your everyday</p>
        <Heading text={'A little care.\nA brighter everyday.'} />
        <a className="rd-button" href="#top">Back to the sunshine <span><Arrow diagonal /></span></a>
        <img className="rd-closing-wordmark" src="./assets/brand/radiance-wordmark.webp" width="852" height="300" alt="Radiance" loading="lazy" />
      </section>
    </main>
    <footer className="rd-footer"><a href="../" className="rd-footer-brand"><img src="./assets/brand/trayn-wordmark.webp" width="140" height="46" alt="TRAYN Nutrition" /></a><p>Radiance is a product in development. Formulation and suitability are not yet confirmed.<br />All product photographs are generated concepts.</p><a href="../">All alternatives <Arrow diagonal /></a></footer>
  </div>;
}
