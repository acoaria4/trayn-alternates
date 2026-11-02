import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { radiance } from './content';
import { radianceMotion } from './motion';

type MediaState = { active: number; previous: number | null; busy: boolean; failed: boolean; revision: number };

export function DetailMedia({ selected, animate, enhanced }: { selected: number; animate: boolean; enhanced: boolean }) {
  const [media, setMedia] = useState<MediaState>({ active: 0, previous: null, busy: false, failed: false, revision: 0 });
  const incoming = useRef<HTMLImageElement>(null);
  const revision = useRef(0);
  const active = useRef(0);
  const animateNext = useRef(animate);
  animateNext.current = animate;

  useEffect(() => {
    if (selected === active.current) {
      setMedia(state => ({ ...state, busy: false, previous: null, failed: false }));
      return;
    }
    let cancelled = false;
    setMedia(state => ({ ...state, busy: true, failed: false }));
    const image = new Image();
    image.src = radiance.details[selected].image;
    // Keep the displayed photograph until its replacement has decoded. A stale
    // request may finish caching, but cannot replace a newer user selection.
    image.decode().then(() => {
      if (cancelled) return;
      const previous = animateNext.current && !matchMedia('(prefers-reduced-motion: reduce)').matches ? active.current : null;
      active.current = selected;
      setMedia({ active: selected, previous, busy: false, failed: false, revision: ++revision.current });
    }).catch(() => {
      if (!cancelled) setMedia(state => ({ ...state, busy: false, previous: null, failed: true }));
    });
    return () => { cancelled = true; };
  }, [selected]);

  useLayoutEffect(() => {
    if (media.previous === null || !incoming.current) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => setMedia(state => state.revision === media.revision ? { ...state, previous: null } : state);
    if (!animate || preference.matches) { finish(); return; }
    const tween = gsap.fromTo(incoming.current, { opacity: 0 }, { opacity: 1, duration: radianceMotion.detail, ease: 'power2.out', onComplete: finish });
    const onPreference = () => { if (preference.matches) tween.progress(1); };
    preference.addEventListener('change', onPreference);
    return () => { preference.removeEventListener('change', onPreference); tween.kill(); };
  }, [media.revision, media.previous, animate]);

  const current = radiance.details[media.active];
  return <div className="rd-detail-frame" id="rd-detail-panel" role={enhanced ? 'tabpanel' : undefined} aria-labelledby={enhanced ? `rd-tab-${radiance.details[selected].id}` : undefined} aria-busy={media.busy || undefined} tabIndex={enhanced ? 0 : undefined}>
    {media.failed ? <div className="rd-media-error" role="status"><p>This detail could not be loaded.</p><a href="./assets/product/packaging.webp">Open the packaging image</a></div> : <>
      {media.previous !== null && <img className="rd-detail-outgoing" src={radiance.details[media.previous].image} width="1000" height="1500" alt="" aria-hidden="true" />}
      <img className="rd-detail-image" ref={incoming} key={current.id} src={current.image} width="1000" height="1500" loading="lazy" alt={current.alt} style={{ opacity: media.previous === null ? 1 : 0 }} onError={() => setMedia(state => ({ ...state, busy: false, previous: null, failed: true }))} />
    </>}
    <span className="rd-detail-caption">RADIANCE <span>CAFE LATTE / CONCEPT 02</span></span>
  </div>;
}
