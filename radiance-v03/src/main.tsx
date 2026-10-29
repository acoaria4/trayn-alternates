import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const element = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
let mounted = element.querySelector('main') ? hydrateRoot(element, app) : createRoot(element);
if (!element.querySelector('main')) mounted.render(app);
if (import.meta.env.DEV) {
  (window as unknown as { __radianceV3Dev: object }).__radianceV3Dev = {
    unmount: () => mounted.unmount(),
    remount: () => { mounted = createRoot(element); mounted.render(app); },
    stats: () => ({ triggers: ScrollTrigger.getAll().length, lenis: document.documentElement.classList.contains('lenis'), tickers: (gsap.ticker as unknown as { _listeners: Function[] })._listeners.filter(callback => callback.name === 'radianceWorldTick').length }),
  };
}
