import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: 'calc(100vh - 64px)',
};

const defaultCenter = { lat: 23.1765, lng: 75.7849 } as google.maps.LatLngLiteral;

type Point = { id: string; name: string; position: google.maps.LatLngLiteral };

const Dustbins: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const destInputRef = useRef<HTMLInputElement | null>(null);
  const originAutoRef = useRef<google.maps.places.Autocomplete | null>(null);

  const dustbins: Point[] = useMemo(() => [

    { id: 'dustbin-6', name: 'Dustbin 6', position: { lat: 23.1792562, lng: 75.7700855 } },
  ], []);

  // Keep track of selected dustbin to highlight it
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [route, setRoute] = useState<google.maps.DirectionsResult | null>(null);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude } as google.maps.LatLngLiteral;
      setOrigin(coords);
      map?.panTo(coords);
      map?.setZoom(15);
    });
  }, [map]);

  // Fit map to show all dustbins on load
  const onMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
    const bounds = new google.maps.LatLngBounds();
    dustbins.forEach((p) => bounds.extend(p.position));
    try {
      // try with padding first (some versions accept it)
      m.fitBounds(bounds, 64);
    } catch {
      m.fitBounds(bounds);
    }
  }, [dustbins]);

  const onPlaceChanged = useCallback(() => {
    const ac = originAutoRef.current; if (!ac) return;
    const place = ac.getPlace();
    if (place.geometry?.location) {
      const loc = place.geometry.location.toJSON();
      setOrigin(loc);
    }
  }, []);

  const routeToNearest = useCallback(() => {
    if (!origin) return;
    // find nearest locally
    const haversine = (a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral) => {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371000;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
      return 2*R*Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
    };
    let best = dustbins[0], bestD = haversine(origin, dustbins[0].position);
    for (let i=1;i<dustbins.length;i++){ const d = haversine(origin, dustbins[i].position); if (d<bestD){best=dustbins[i]; bestD=d;} }
    setSelectedId(best.id);
    if (destInputRef.current) destInputRef.current.value = best.name;
    const svc = new google.maps.DirectionsService();
    svc.route({ origin, destination: best.position, travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
      if (status === 'OK' && res) setRoute(res); else setRoute(null);
    });
  }, [origin, dustbins]);

  if (loadError) return <div className="p-4 text-red-600">Failed to load Google Maps. Check API key.</div>;

  // build data-url SVG icons (green square with 'D', and blue circle for origin)
  const dustbinSvg = (selected = false) => {
    const size = selected ? 48 : 36;
    const bg = '#16a34a'; // Green color for dustbin
    const stroke = '#000000';
    const textSize = selected ? 22 : 16;
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
        <rect x='2' y='2' width='${size-4}' height='${size-4}' rx='4' fill='${bg}' stroke='${stroke}' stroke-width='2'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='${textSize}' fill='white' font-weight='700'>D</text>
      </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const originSvg = () => {
    const size = 36;
    const bg = '#2563eb';
    const stroke = '#ffffff';
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
        <circle cx='${size / 2}' cy='${size / 2}' r='${size / 2 - 2}' fill='${bg}' stroke='${stroke}' stroke-width='2'/>
      </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  // helper to produce icon object safely (maps must be loaded for google.maps.Size/Point)
  const makeIcon = (url: string, sizePx = 36) => {
    if (typeof google !== 'undefined' && google.maps && google.maps.Size && google.maps.Point) {
      return {
        url,
        scaledSize: new google.maps.Size(sizePx, sizePx),
        anchor: new google.maps.Point(sizePx / 2, sizePx / 2),
      } as google.maps.Icon;
    }
    // fallback to url only
    return { url } as google.maps.Icon;
  };

  return (
    <div className="w-full">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={15}
          onLoad={onMapLoad}
          options={{ streetViewControl: false, mapTypeControl: false }}
        >
          {/* Debug center marker (use default marker to check rendering) */}
          <Marker 
            position={defaultCenter} 
            title="Center" 
            onLoad={(m) => console.log('center marker loaded', m)}
            // leave default icon so you can confirm markers show
          />
          {/* Controls */}
          <div className="absolute z-50 left-1/2 -translate-x-1/2 top-16 sm:top-20 flex gap-2 flex-wrap bg-white/90 p-2 rounded-lg shadow max-w-[95vw]">
            <Autocomplete onLoad={(ac)=>originAutoRef.current=ac} onPlaceChanged={onPlaceChanged}>
              <input className="px-3 py-2 border rounded w-56 sm:w-64 md:w-72" placeholder="From: Enter origin" />
            </Autocomplete>
            <button className="px-3 py-2 border rounded bg-blue-600 text-white text-sm sm:text-base" onClick={useCurrentLocation}>Use Current Location</button>
            <input ref={destInputRef} className="px-3 py-2 border rounded w-56 sm:w-64 md:w-72" placeholder="Destination" readOnly />
            <button className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded text-sm sm:text-base" onClick={routeToNearest} disabled={!origin}>Nearest Dustbin</button>
          </div>

          {/* Origin marker */}
          {origin && (
            <Marker
              position={origin}
              title="You are here"
              icon={makeIcon(originSvg(), 36)}
              zIndex={1300}
              // optimized={false} - removed as not supported in this version
              onLoad={(m) => console.log('origin marker loaded', m)}
              onClick={() => {
                map?.panTo(origin);
                map?.setZoom(15);
              }}
            />
          )}

          {/* Dustbin markers (robust SVG icons + fallback) */}
          {dustbins.map((d) => {
            const isSel = selectedId === d.id;
            const svgUrl = dustbinSvg(isSel);
            // Fallback external icon if for some reason data-url blocked
            // Fallback URL kept for reference if needed later
            // const fallbackUrl = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            const iconObj = makeIcon(svgUrl, isSel ? 48 : 36);
            return (
              <Marker
                key={d.id}
                position={d.position}
                title={d.name}
                icon={iconObj}
                zIndex={1200}
                // optimized={false} - removed as not supported in this version
                onLoad={(m) => console.log('dustbin marker loaded', d.id, m)}
                onClick={() => {
                  setSelectedId(d.id);
                  if (origin) {
                    const svc = new google.maps.DirectionsService();
                    svc.route(
                      { origin, destination: d.position, travelMode: google.maps.TravelMode.DRIVING },
                      (res, status) => {
                        if (status === 'OK' && res) setRoute(res);
                        else setRoute(null);
                      }
                    );
                  }
                  if (destInputRef.current) destInputRef.current.value = d.name;
                }}
                // if icon fails to render (rare) we still have a visible fallback by setting title and relying on default marker
              />
            );
          })}

          {/* Route renderer - render before markers and ensure it doesn't hide them */}
          {route && (
            <DirectionsRenderer 
              options={{ 
                directions: route, 
                suppressMarkers: true, // Don't show default markers
                polylineOptions: { 
                  strokeColor: '#16a34a', 
                  strokeWeight: 6,
                  zIndex: 100 // Higher value but still below markers (1200)
                },
                preserveViewport: true // Don't auto-zoom when route changes
              }} 
            />
          )}
        </GoogleMap>
      ) : (
        <div className="p-4">Loading map…</div>
      )}
    </div>
  );
};

export default Dustbins;
