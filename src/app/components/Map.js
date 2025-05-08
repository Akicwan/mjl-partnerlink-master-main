import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !mapRef.current) {
      const map = L.map('map', {
        center: [36.2048, 138.2529],
        zoom: 5,
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Bounds to restrict movement
      const bounds = [
        [24.396308, 122.93457],
        [45.551483, 153.986672],
      ];
      map.setMaxBounds(bounds);
      map.on('drag', function () {
        map.panInsideBounds(bounds, { animate: true });
      });

      // WORLD COVERING POLYGON with a hole over Japan
      const world = [
        [[-90, -180], [-90, 180], [90, 180], [90, -180]], // World box
      ];

      // Japan bounding polygon (a rough rectangle)
      const japanHole = [
        [24.396308, 122.93457],
        [24.396308, 153.986672],
        [45.551483, 153.986672],
        [45.551483, 122.93457],
      ];

      // Add the hole to the world polygon
      world.push(japanHole);

      // Create the masking polygon
      L.polygon(world, {
        color: '#000000',
        fillColor: '#000000',
        fillOpacity: 0.7,
        stroke: false,
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map" className="w-full h-96 rounded-xl shadow-lg z-0"></div>;
};

export default Map;
