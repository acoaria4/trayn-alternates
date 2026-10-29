'use client';
import { useFireflyWorld } from './FireflyAtmosphere';

export default function FireflySection() {
  const { paused, reduced, enhanced, gathered, toggleGathered, makeWish } = useFireflyWorld();
  return <section className="rv3-night" id="a-little-wonder" data-firefly-focus=".5,.54" aria-labelledby="rv3-night-title">
    <div className="rv3-night-top"><span>Follow the light into dusk.</span><span>Radiance after hours</span></div>
    <div className="rv3-night-copy">
      <h2 id="rv3-night-title">Let there<span>be light.</span></h2>
      <p>The same little lights.<br />A different time of day.<br />Make a wish. Watch it glow.</p>
    </div>
    <div className="rv3-night-bottom">
      <p className="rv3-pointer-note">{reduced ? 'A still moment of light.' : <><span className="rv3-mouse-note">Click anywhere to leave a little light.</span><span className="rv3-touch-note">Tap anywhere to leave a little light.</span></>}</p>
      <div className="rv3-night-actions" hidden={!enhanced}><button type="button" className="rv3-wish" disabled={reduced || paused} onClick={makeWish}>Make a wish <span aria-hidden="true">✧</span></button><button type="button" className="rv3-gather" disabled={reduced || paused} aria-pressed={gathered} onClick={toggleGathered}>{gathered ? 'Release the light' : 'Gather the light'}</button></div>
    </div>
  </section>;
}
