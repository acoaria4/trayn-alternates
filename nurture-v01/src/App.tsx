import { useRef } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ProductGallery from './components/ProductGallery';
import { Arrow, Heading, SectionLabel } from './components/Typography';
import { imageDisclosure, navigation, product, questions } from './content/product';
import { useMotion } from './useMotion';

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  useMotion(root);
  return <div className="site" ref={root} id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation />
    <main id="main" tabIndex={-1}>
      <Hero />
      <section className="intention section-pad" id="intention" aria-labelledby="intention-title">
        <SectionLabel number="01">The thought behind the tin</SectionLabel>
        <div className="intention-grid"><div><p className="eyebrow">Everyday Nutrition<br />for Every Woman.</p><span className="intention-rule" /></div><div><Heading id="intention-title" text="A small act of everyday care." className="display-heading" /><div className="intention-copy" data-reveal><p>For the many things you do.<br />And the person behind them all.</p><p>Nurture begins with a simple thought: make a little room for yourself. An everyday nutrition concept with care at the centre, from the idea to the object.</p></div></div></div>
      </section>
      <section className="details section-pad" id="details" aria-labelledby="details-title">
        <SectionLabel number="02">Considered, down to the detail</SectionLabel>
        <div className="material-spread"><figure className="detail-gold" data-reveal><div className="detail-image"><img src={product.media.detail} srcSet={`${product.media.detailSmall} 600w, ${product.media.detail} 1086w`} sizes="(max-width: 759px) 90vw, 48vw" width="1086" height="1448" alt="Generated three-quarter concept view of the complete Nurture cream-and-gold tin on pale stone" loading="lazy" /></div><figcaption><span>I / Cream &amp; gold</span><span>Generated study</span></figcaption></figure><div className="material-copy"><h2 id="details-title" className="display-heading" data-reveal>A quiet<br /><em>kind of luxury.</em></h2><p>Cream, gold, and a familiar silhouette. <br />A visual language that finds its character <br />in the smallest details.</p><figure className="detail-artwork" data-reveal><div className="detail-image"><img src={product.media.artwork} srcSet={`${product.media.artworkSmall} 450w, ${product.media.artwork} 900w`} sizes="(max-width: 759px) 70vw, 30vw" width="1122" height="1402" alt="Generated dedicated artwork study of the woman's profile and botanical lines on Nurture's concept artwork" loading="lazy" /></div><figcaption><span>II / The artwork</span><span>Concept detail</span></figcaption></figure></div></div>
        <div className="material-footnote"><p>A gold-toned lid frames the cream label.<br />Fine botanical lines bring a human touch.</p><p>A study of the packaging concept.<br />Final artwork and materials may change.</p></div>
      </section>
      <section className="object section-pad" id="object" aria-labelledby="object-title">
        <div className="object-heading"><SectionLabel number="03">Meet the concept</SectionLabel><h2 className="display-heading" id="object-title" data-reveal>Nurture.<br /><em>From every angle.</em></h2></div>
        <div className="object-grid"><ProductGallery /><div className="object-copy"><p className="eyebrow">Nurture Everyday</p><h3>Everyday care.<br />A considered object.</h3><p>Explore the silhouette, the artwork, and the finishing details of our packaging concept.</p><dl className="object-specs"><div><dt>By</dt><dd>{product.brand}</dd></div><div><dt>Reference pack</dt><dd>{product.packWeight} as pictured</dd></div><div><dt>Current stage</dt><dd>Product concept</dd></div></dl><p className="fine-print">These are generated concepts, not photographs of a manufactured product. Final packaging and product information may change.</p><a className="text-link" href="#development">Follow the idea <Arrow diagonal /></a></div></div>
      </section>
      <section className="vision" aria-label="The Nurture vision">
        <p className="eyebrow">The words that started it.</p><p className="vision-quote" data-reveal>To feel strong.<br />To live well.<br /><em>Every day.</em></p><div className="vision-side"><img src={product.media.ritual} srcSet={`${product.media.ritualSmall} 600w, ${product.media.ritual} 1000w`} sizes="(max-width: 759px) 50vw, 36vw" width="1122" height="1402" alt="Generated concept of the complete Nurture tin on pale stone beside a fold of ivory linen" loading="lazy" /><p>The Nurture vision,<br />as written on the reference pack.</p></div><span className="vision-credit">A brand aspiration · Product in development</span>
      </section>
      <section className="development section-pad" id="development" aria-labelledby="development-title">
        <SectionLabel number="04">A beginning, thoughtfully made</SectionLabel>
        <div className="development-grid"><div className="development-intro"><h2 className="display-heading" id="development-title" data-reveal>Still<br /><em>taking shape.</em></h2><p>This is an introduction to Nurture Everyday: the vision and the packaging, as the final product takes shape.</p><p>Confirmed formulation, product details, and launch plans will be shared here when they are ready.</p><span className="development-note">In development</span></div><div className="faq-list">{questions.map((item, index) => <details className="faq" key={item.question}><summary><span className="faq-index">0{index + 1}</span><span>{item.question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><div className="faq-answer"><p>{item.answer}</p></div></details>)}</div></div>
      </section>
      <section className="closing section-pad" aria-label="Explore Nurture Everyday"><div><p className="eyebrow">A little space. Just for you.</p><Heading text="Make room for the everyday." className="closing-statement" /></div><a className="primary-link" href="#object">Explore the concept <Arrow diagonal /></a></section>
    </main>
    <footer className="footer"><div className="footer-top"><a className="footer-brand" href="#top" aria-label="TRAYN Nutrition — back to top"><span className="trayn-symbol" /><span className="trayn-wordmark" /></a><p>Nurture Everyday.<br />A concept by TRAYN Nutrition.</p><nav aria-label="Footer navigation">{navigation.map(link => <a href={link.href} key={link.href}>{link.label}</a>)}<a href="#development">In the making</a><a href="../">All alternatives</a></nav><a className="back-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div><details className="image-disclosure"><summary>About the concept images <span aria-hidden="true">+</span></summary><p>{imageDisclosure}</p></details><div className="footer-baseline"><span>© TRAYN Nutrition</span><span>Product concept · Not yet available for purchase</span><span>Considered, every day.</span></div></footer>
  </div>;
}
