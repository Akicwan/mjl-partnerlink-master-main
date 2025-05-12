'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

export default function PublicDashboard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        const existingMap = L.DomUtil.get('map');

        // Prevent re-initialization if the map is already set up
        if (existingMap && existingMap._leaflet_id) return;

        const map = L.map('map', {
          center: [36.2048, 138.2529], // Center of Japan
          zoom: 5,
          zoomControl: false,
          scrollWheelZoom: false,
          attributionControl: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        }).addTo(map);

        const bounds = [
          [24.396308, 122.93457],  // Southwest corner
          [45.551483, 153.986672], // Northeast corner
        ];

        map.setMaxBounds(bounds);
        map.on('drag', () => {
          map.panInsideBounds(bounds, { animate: true });
        });

        window.leafletMap = map;
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#692B2C] p-6">
      <div className="bg-[#1F2163] text-white px-6 py-4 rounded-t-2xl shadow-md max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Public Dashboard</h1>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#D9AC42] text-white px-4 py-2 rounded-lg shadow hover:bg-[#c6983b] transition"
          >
            Login
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-xl p-6 max-w-6xl mx-auto min-h-[70vh]">
        <h2 className="text-2xl font-semibold text-[#1F2163] mb-6">
          Welcome to the MJL Public Dashboard
        </h2>

        <div id="map" className="w-full h-96 rounded-xl shadow-lg mb-6"></div>

        <p className="text-gray-700">
          Only the public parts are displayed here. Please log in to view or manage more details.
        </p>
      </div>
    </div>
  );
}
