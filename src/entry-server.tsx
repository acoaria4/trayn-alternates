import { renderToString } from 'react-dom/server';
import Picker from './picker/Picker';

export function renderPicker() { return renderToString(<Picker />); }
export { render as renderNurture } from '../nurture-v01/src/entry-server';
