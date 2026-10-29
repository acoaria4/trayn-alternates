'use client';
import { useEffect, useRef, useState } from 'react';
import { createFireflyScene } from './fireflyScene';

export default function FireflySection() {
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
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
    return () => { scene.current?.destroy(); scene.current = null; media.removeEventListener('change', change); };
  }, []);
  useEffect(() => { scene.current?.setPaused(paused); }, [paused]);
  useEffect(() => { scene.current?.setGathered(gathered); }, [gathered]);
  return <section className="rv3-night" id="a-little-wonder" ref={host} aria-labelledby="rv3-night-title">
    <canvas className="rv3-fireflies" ref={canvas} aria-hidden="true" />
    <div className="rv3-still-flies" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 7) % 97}%`, top: `${(i * 23 + 9) % 92}%`, opacity: .3 + i % 4 * .16 }} />)}</div>
    <div className="rv3-night-top"><span>An invitation to play.</span><span>Radiance after hours</span></div>
    <div className="rv3-night-copy">
      <h2 id="rv3-night-title">Let there<span>be light.</span></h2>
      <p>Some things are better felt.<br />A little light. A moment of wonder.<br />A world that responds to you.</p>
    </div>
    <div className="rv3-night-bottom">
      <p className="rv3-pointer-note">{reduced ? 'A still moment of light.' : <><span className="rv3-mouse-note">Move through the light. Or gather it into a sun.</span><span className="rv3-touch-note">A little world of light, at your fingertips.</span></>}</p>
      <div className="rv3-night-actions" hidden={!enhanced}><button type="button" className="rv3-gather" disabled={reduced || paused} aria-pressed={gathered} onClick={() => setGathered(value => !value)}>{gathered ? 'Release the light' : 'Gather the light'}</button><button type="button" className="rv3-motion-toggle" onClick={() => setPaused(value => !value)} disabled={reduced} aria-pressed={paused || reduced} aria-label={reduced ? 'Still lights: reduced motion enabled' : undefined}><span className="rv3-play-pause" aria-hidden="true" data-paused={paused || reduced} />{reduced ? 'Still lights' : paused ? 'Play fireflies' : 'Pause fireflies'}</button></div>
    </div>
  </section>;
}
