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
        if (existingMap && existingMap._leaflet_id) return;

        const map = L.map('map', {
          center: [36.2048, 138.2529],
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
          [24.396308, 122.93457],
          [45.551483, 153.986672],
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
    <div className="min-h-screen bg-gradient-to-b from-[#692B2C] to-[#1F2163] p-4">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-4 px-0">
          <div className="flex items-center space-x-2">
            <span className="text-white text-2xl">
            <img
                src="/partnerlink.png"
                alt="PartnerLink Logo"
                className="h-25 w-auto object-contain"
              />
            </span>
            <h1 className="text-3xl font-bold text-white">MJL PartnerLink</h1>
          </div>
          <div className="flex items-center space-x-4">
          </div>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-0">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1F2163] to-[#3A3F9E] text-white p-8 rounded-t-2xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to MJL PartnerLink</h1>
              <p className="text-lg opacity-90">Explore our global partnerships and collaborations</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center bg-[#D9AC42] text-[#1F2163] px-7 py-2 rounded-lg shadow hover:bg-[#c6983b] transition-colors font-medium"
            >
              <span className="mr-2"></span>Login
            </button>

            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
       {/* Map Container with Enhanced Styling */}
<div className="lg:col-span-2">
  <div className="bg-#fae7d4 border border-[#e1d9c4] p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
    <div className="flex items-center mb-4">
      <span className="text-[#D9AC42] text-2xl mr-3">🗺️</span>
      <h2 className="text-2xl font-bold text-[#1F2163] tracking-tight">Our Partner Network</h2>
    </div>

    <div
      id="map"
      className="w-full h-96 rounded-xl border border-[#e1d9c4] bg-gray-100 shadow-inner"
      style={{
        boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.04)',
        borderColor: '#e2e8f0'
      }}
    ></div>

    <div className="mt-4 text-sm text-gray-600 text-right italic">
      Map highlights our active collaboration zones.
    </div>
  </div>
</div>

  {/* Side Panel with Enhanced Styling and Color */}
<div className="bg-white p-6 rounded-xl shadow-inner border border-[#e1d9c4] space-y-6 transition-all duration-300 hover:shadow-lg">
  {/* What is MJL PartnerLink */}
  <div className="bg-[#fff7e8] p-4 rounded-lg border border-[#e5c89c] shadow-sm hover:shadow-md transition">
    <h3 className="text-lg font-semibold text-[#1F2163] mb-2 flex items-center">
      <span className="mr-2 text-[#D9AC42]">🌍</span> What is MJL PartnerLink?
    </h3>
    <p className="text-sm text-[#3c2e1f] leading-relaxed">
      MJL PartnerLink is a collaboration management system designed for the MJIIT Japan Linkage Office. It centralizes agreements, activities and university collaborations on a unified platform.
    </p>
  </div>

  {/* Partner Institutions */}
  <div className="bg-[#fbe9e5] p-4 rounded-lg border border-[#e9c6bd] shadow-sm hover:shadow-md transition">
    <h3 className="text-lg font-semibold text-[#1F2163] mb-2 flex items-center">
      <span className="mr-2 text-[#D9AC42]">🏛️</span> Partner Institutions
    </h3>
    <p className="text-sm text-[#3c2e1f] leading-relaxed">
      MJIIT partners with top universities globally. Each institution manages MOUs, MOAs and academic or research collaborations through this system.
    </p>
  </div>

  {/* Types of Agreements */}
  <div className="bg-[#ece8f6] p-4 rounded-lg border border-[#cbc4e6] shadow-sm hover:shadow-md transition">
    <h3 className="text-lg font-semibold text-[#1F2163] mb-2 flex items-center">
      <span className="mr-2 text-[#D9AC42]">📑</span> Types of Agreements
    </h3>
    <p className="text-sm text-[#3c2e1f] leading-relaxed">
      Types include MOU, MOA, LOI, Exchange Agreement, Outsourcing Agreement, CRA, SEA and more. Agreements are grouped under their respective partner universities.
    </p>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}