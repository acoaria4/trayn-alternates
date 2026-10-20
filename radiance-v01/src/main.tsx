import { StrictMode } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import './styles.css';
import App from './App';

const element = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
let mounted: Root;
if (element.querySelector('main')) mounted = hydrateRoot(element, app);
else { mounted = createRoot(element); mounted.render(app); }

if (import.meta.env.DEV) {
  (window as unknown as { __radianceDev: object }).__radianceDev = {
    unmount: () => mounted.unmount(),
    remount: () => { mounted = createRoot(element); mounted.render(app); },
    stats: () => ({ triggers: ScrollTrigger.getAll().length, lenisActive: document.documentElement.classList.contains('lenis'), lenisTickers: (gsap.ticker as unknown as { _listeners: Function[] })._listeners.filter(callback => callback.name === 'radianceTick').length }),
  };
}
