import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Picker from './picker/Picker';
import './picker/styles.css';

const root = document.getElementById('root')!;
const app = <StrictMode><Picker /></StrictMode>;
if (root.querySelector('main')) hydrateRoot(root, app);
else createRoot(root).render(app);
