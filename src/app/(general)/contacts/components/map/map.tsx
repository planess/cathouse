'use client';

import { useEffect, useRef } from 'react';

export function Map() {
  const mref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mref.current) {
      // Додаємо стилі Leaflet, якщо їх ще немає
      const leafletCssId = 'leaflet-css';
      if (!document.querySelector(`#${leafletCssId}`)) {
        const link = document.createElement('link');
        link.id = leafletCssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';

        document.head.appendChild(link);
      }

      void (async () => {
        
        try {
          const L = await import('leaflet');

          const map = L.map(mref.current).setView([49.7988997, 24.0472929], 14);

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
            map,
          );

          const polygon = L.polygon(
            [
              [49.785393, 24.076386],
              [49.767324, 24.051324],
              [49.782511, 24.014245],
              [49.8183, 24.020425],
              [49.819075, 24.057332],
            ],
            { color: '#00ff00', opacity: .5, interactive: false, },
          ).addTo(map);


          map.fitBounds(polygon.getBounds());
        } catch (error) {
          console.error('Failed to load Leaflet:', error);
        }
      })();
    }
  }, []);

  return <div ref={mref} style={{ width: '100%', height: '400px' }} />;
}
