import { StrictMode } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../assets/fonts/fonts.css';
import 'lenis/dist/lenis.css';
import './styles.css';
import App from './App';

document.documentElement.classList.add('has-js');
document.documentElement.classList.remove('js-pending');
const element = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
let mounted: Root;
if (element.querySelector('main')) mounted = hydrateRoot(element, app);
else { mounted = createRoot(element); mounted.render(app); }

// Development-only lifecycle diagnostics, removed by the production build.
if (import.meta.env.DEV) {
  const diagnosticWindow = window as unknown as { __nurtureDev: { unmount: () => void; remount: () => void; stats: () => object } };
  diagnosticWindow.__nurtureDev = {
    unmount: () => mounted.unmount(),
    remount: () => { mounted = createRoot(element); mounted.render(app); },
    stats: () => ({
      triggers: ScrollTrigger.getAll().length,
      animations: gsap.globalTimeline.getChildren(true, true, true).filter(item => item.vars.onComplete?.name !== '_refreshAll').length,
      libraryRefreshCalls: gsap.globalTimeline.getChildren(true, true, true).filter(item => item.vars.onComplete?.name === '_refreshAll').length,
      lenisActive: document.documentElement.classList.contains('lenis'),
      lenisTickers: (gsap.ticker as unknown as { _listeners: Function[] })._listeners.filter(callback => callback.name === 'tick').length,
    }),
  };
}
