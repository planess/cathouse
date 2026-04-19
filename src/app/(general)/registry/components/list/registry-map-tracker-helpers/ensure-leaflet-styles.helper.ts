import {
  LEAFLET_CSS_ID,
  LEAFLET_TRACKER_STYLE_CONTENT,
  LEAFLET_TRACKER_STYLE_ID,
} from './constants';

export function ensureLeafletStyles() {
  if (typeof document === 'undefined') {
    return;
  }

  if (!document.querySelector(`#${LEAFLET_CSS_ID}`)) {
    const link = document.createElement('link');
    link.id = LEAFLET_CSS_ID;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  if (document.querySelector(`#${LEAFLET_TRACKER_STYLE_ID}`)) {
    return;
  }

  const style = document.createElement('style');
  style.id = LEAFLET_TRACKER_STYLE_ID;
  style.textContent = LEAFLET_TRACKER_STYLE_CONTENT;
  document.head.appendChild(style);
}
