import { useEffect, useRef, useState } from 'react';
import { product } from '../content/product';
import { Arrow } from './Typography';
import { useModal } from './useModal';

export default function ProductGallery() {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(true);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const enlarge = useRef<HTMLButtonElement>(null);
  const image = product.gallery[selected];
  const select = (index: number) => {
    const next = (index + product.gallery.length) % product.gallery.length;
    if (next === selected) return;
    setSelected(next);
    setReady(false); setFailed(false);
  };
  useModal(expanded, dialog, enlarge, () => setExpanded(false));
  useEffect(() => {
    if (!expanded) return;
    const element = dialog.current!;
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); select(selected + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(selected - 1); }
    };
    element.addEventListener('keydown', keys);
    return () => element.removeEventListener('keydown', keys);
  }, [expanded, selected]);
  return <div className="product-gallery">
    <div className="gallery-topline"><span>Packaging study</span><span>0{selected + 1} / 04</span></div>
    <figure className={`gallery-stage ${image.cutout ? 'is-cutout' : 'is-studio'}`} aria-busy={!ready && !failed}>
      <img key={image.id} src={image.source} srcSet={`${image.small} 600w, ${image.source} 1000w`} sizes="(max-width: 759px) 90vw, 50vw" alt={image.alt} width={image.width} height={image.height} loading="lazy" onLoad={() => setReady(true)} onError={() => { setFailed(true); setReady(true); }} />
      {!ready && !failed && <span className="gallery-loading" role="status">Loading view…</span>}
      {failed && <p className="media-error" role="status">This view could not be loaded. Please choose another view.</p>}
      <button ref={enlarge} className="gallery-enlarge" type="button" disabled={failed} onClick={() => setExpanded(true)} aria-label={`Enlarge ${image.label.toLowerCase()}`}><span>Look closer</span><Arrow diagonal /></button>
    </figure>
    <div className="gallery-caption" aria-live="polite"><span>{image.note}</span><span>Generated concept</span></div>
    <div className="gallery-views" role="group" aria-label="Product views">{product.gallery.map((view, index) => <button type="button" key={view.id} aria-pressed={index === selected} onClick={() => select(index)}><span className="view-number">0{index + 1}</span><span>{view.label}</span></button>)}</div>
    <noscript><p className="no-js-note">Open the additional product views: {product.gallery.slice(1).map(view => <a key={view.id} href={view.source}>{view.label}</a>)}</p></noscript>
    <dialog ref={dialog} className="gallery-dialog" aria-labelledby="gallery-dialog-title" data-lenis-prevent onClick={event => { if (event.target === dialog.current) setExpanded(false); }}>
      <div className="lightbox-inner">
        <div className="lightbox-top"><h3 id="gallery-dialog-title">{image.label} <span> / Nurture Everyday</span></h3><button type="button" className="circle-control" aria-label="Close enlarged view" onClick={() => setExpanded(false)}>×</button></div>
        <div className={`lightbox-image ${image.cutout ? 'is-cutout' : ''}`}><img src={image.source} alt={image.alt} width={image.width} height={image.height} loading="lazy" /></div>
        <div className="lightbox-controls"><button type="button" className="circle-control" aria-label="Previous product view" onClick={() => select(selected - 1)}>←</button><p aria-live="polite">0{selected + 1} / 04 <span>{image.note}</span></p><button type="button" className="circle-control" aria-label="Next product view" onClick={() => select(selected + 1)}>→</button></div>
      </div>
    </dialog>
  </div>;
}
