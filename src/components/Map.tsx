import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Using a demo token - replace with your actual Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxvazIwMDMiLCJhIjoiY201anNwZXRnMTAzbzJpc2ZtaHhudG1kNiJ9.3y0a5jiMDl42FUAN-Wy1Fg';

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    description?: string;
    color?: string;
    onClick?: () => void;
  }>;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center,
  zoom = 13,
  markers = [],
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (mapContainer.current) {
      // Set the access token
      mapboxgl.accessToken = MAPBOX_TOKEN;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center,
          zoom: zoom,
          attributionControl: false,
        });

        map.current.on('load', () => {
          setMapLoaded(true);
        });

        // Add navigation control
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add attribution control at bottom
        map.current.addControl(new mapboxgl.AttributionControl({
          compact: true
        }), 'bottom-right');

      } catch (error) {
        console.error('Mapbox initialization failed:', error);
        setMapLoaded(false);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers with drop pin style
    markers.forEach((marker) => {
      // Create custom drop pin element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 30px;
        height: 40px;
        background-color: ${marker.color || '#FF6B35'};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
        transition: all 0.2s ease;
      `;

      // Add inner dot
      const innerDot = document.createElement('div');
      innerDot.style.cssText = `
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
      el.appendChild(innerDot);

      // Add hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'rotate(-45deg) scale(1.1)';
        el.style.zIndex = '1000';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'rotate(-45deg) scale(1)';
        el.style.zIndex = 'auto';
      });

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: [0, -40],
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-lg text-gray-800 mb-2">${marker.title}</h3>
          ${marker.description ? `<p class="text-sm text-gray-600 leading-relaxed">${marker.description}</p>` : ''}
        </div>
      `);

      // Create and add marker
      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(mapboxMarker);

      // Add click handler
      if (marker.onClick) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          marker.onClick!();
        });
      }
    });
  }, [markers, mapLoaded]);

  // Update map center when it changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1000
      });
    }
  }, [center, zoom, mapLoaded]);

  // Show fallback for demo purposes when Mapbox token is not valid
  if (MAPBOX_TOKEN.includes('demo_token') || !mapLoaded) {
    return (
      <div className={`relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 max-w-2xl">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Interactive Ujjain Map</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Centered on Ujjain ({center[1].toFixed(4)}, {center[0].toFixed(4)})
            </p>
            
            {markers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {markers.map((marker, index) => (
                  <div
                    key={marker.id}
                    className="bg-white p-4 rounded-xl shadow-lg border cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                    onClick={marker.onClick}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="relative">
                        <div
                          className="w-6 h-8 border-2 border-white rounded-full shadow-md"
                          style={{ 
                            backgroundColor: marker.color || '#FF6B35',
                            borderRadius: '50% 50% 50% 0',
                            transform: 'rotate(-45deg)'
                          }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-800">{marker.title}</span>
                    </div>
                    {marker.description && (
                      <p className="text-sm text-gray-600 ml-9 leading-relaxed">{marker.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Replace the Mapbox token in Map.tsx with your actual token for full functionality
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mapbox-container relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default Map;