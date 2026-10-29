import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createFireflyScene } from './fireflyScene';

const LightContext = createContext({ paused: false, reduced: false, enhanced: false, gathered: false, toggleGathered: () => {}, makeWish: () => {} });
export const useFireflyWorld = () => useContext(LightContext);

/** A single persistent swarm and a pause control available from the opening scene. */
export default function FireflyAtmosphere({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const scene = useRef<ReturnType<typeof createFireflyScene> | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [gathered, setGathered] = useState(false);

  useEffect(() => {
    if (!host.current || !canvas.current) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { setReduced(media.matches); scene.current?.setReducedMotion(media.matches); };
    scene.current = createFireflyScene(canvas.current, host.current);
    change(); media.addEventListener('change', change); setEnhanced(true);
    // Hide only this variant's scrollbar, and only after the replacement is mounted.
    document.documentElement.classList.add('rv3-world-active');
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - innerHeight;
      const amount = range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${amount})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    update();
    return () => {
      scene.current?.destroy(); scene.current = null; media.removeEventListener('change', change);
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      document.documentElement.classList.remove('rv3-world-active');
    };
  }, []);
  useEffect(() => { scene.current?.setPaused(paused); }, [paused]);
  useEffect(() => { scene.current?.setGathered(gathered); }, [gathered]);

  return <LightContext.Provider value={{ paused, reduced, enhanced, gathered, toggleGathered: () => setGathered(value => !value), makeWish: () => scene.current?.makeWish() }}>
    <div className="rv3-scroll-progress" ref={progress} aria-hidden="true" hidden={!enhanced} />
    <div className="rv3-atmosphere" ref={host} aria-hidden="true">
      <canvas className="rv3-fireflies" ref={canvas} />
      <div className="rv3-still-flies">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 7) % 97}%`, top: `${18 + (i * 23) % 65}%`, opacity: .35 + i % 3 * .13 }} />)}</div>
    </div>
    {children}
    <button type="button" className="rv3-motion-toggle rv3-world-toggle" hidden={!enhanced} onClick={() => setPaused(value => !value)} disabled={reduced} aria-pressed={paused || reduced} aria-label={reduced ? 'Still lights: reduced motion enabled' : undefined}><span className="rv3-play-pause" aria-hidden="true" data-paused={paused || reduced} />{reduced ? 'Still lights' : paused ? 'Play lights' : 'Pause lights'}</button>
  </LightContext.Provider>;
}
