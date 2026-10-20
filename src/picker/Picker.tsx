import { concepts } from './concepts';

export default function Picker() {
  return <div className="picker">
    <a className="picker-skip" href="#main">Skip to concepts</a>
    <header className="picker-header">
      <a className="picker-brand" href="./" aria-label="TRAYN Nutrition — product alternatives">
        <img className="picker-symbol" src="./shared/brand/trayn-symbol.webp" width="35" height="42" alt="" />
        <img className="picker-wordmark" src="./shared/brand/trayn-wordmark.webp" width="140" height="46" alt="TRAYN Nutrition" />
      </a>
      <span className="picker-header-note">Product development</span>
    </header>
    <main id="main" tabIndex={-1}>
      <section className="picker-intro" aria-labelledby="picker-title">
        <p className="picker-eyebrow">Beyond the usual scoop</p>
        <h1 id="picker-title">Product<br />{' '}alternatives.</h1>
        <p className="picker-intro-copy">Exploring alternatives to TRAYN Nutrition Whey,<br className="desktop-break" /> made for everyday routines.</p>
      </section>
      <section className="picker-collection" aria-label="Product concepts">
        <div className="picker-collection-heading"><span>Explore the concepts</span><span>{concepts.length} {concepts.length === 1 ? 'option' : 'options'}</span></div>
        <div className="picker-options">
          {concepts.map((concept, index) => <article className="picker-option" key={concept.id}>
            <a className="picker-option-link" href={concept.href} aria-labelledby={`${concept.id}-title`}>
              <div className="picker-image-stage">
                <img src={concept.image} srcSet={`${concept.image} 600w, ${concept.imageLarge} 1000w`} sizes="(max-width: 700px) 90vw, 40vw" width="1000" height="1500" alt={concept.imageAlt} fetchPriority={index === 0 ? 'high' : 'auto'} />
                <span className="picker-image-note">Generated packaging concept</span>
              </div>
              <div className="picker-option-content">
                <span className="picker-status"><span aria-hidden="true" />{concept.status}</span>
                <h2 id={`${concept.id}-title`}>{index + 1}) {concept.title}</h2>
                <p className="picker-audience">{concept.audience}</p>
                <p className="picker-description">{concept.description}</p>
                <dl className="picker-details">
                  <div><dt>Direction</dt><dd>{concept.base}</dd></div>
                  <div><dt>Nutrition</dt><dd>{concept.protein}</dd></div>
                  <div><dt>Occasion</dt><dd>{concept.occasion}</dd></div>
                </dl>
                <span className="picker-open">{concept.action}<img src="./nurture-v01/assets/icons/arrow-up-right.svg" width="20" height="20" alt="" aria-hidden="true" /></span>
              </div>
            </a>
          </article>)}
        </div>
      </section>
    </main>
    <footer className="picker-footer"><span>TRAYN Nutrition</span><p>Concepts in development. Formulations, packaging and nutrition targets remain subject to validation.</p></footer>
  </div>;
}
