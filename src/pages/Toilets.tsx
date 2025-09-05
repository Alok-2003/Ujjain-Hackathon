import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: 'calc(100vh - 64px)',
};

const defaultCenter = { lat: 23.1765, lng: 75.7849 } as google.maps.LatLngLiteral;

type Point = { id: string; name: string; position: google.maps.LatLngLiteral };

const Toilets: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const destInputRef = useRef<HTMLInputElement | null>(null);
  const originAutoRef = useRef<google.maps.places.Autocomplete | null>(null);

  const toilets: Point[] = useMemo(
    () => [
      { id: 'toilet-1', name: 'Public Toilet 1', position: { lat: 23.1765, lng: 75.7849 } },
      { id: 'toilet-2', name: 'Public Toilet 2', position: { lat: 23.1797, lng: 75.7812 } },
      { id: 'toilet-3', name: 'Public Toilet 3', position: { lat: 23.1726, lng: 75.7860 } },
      { id: 'toilet-4', name: 'Public Toilet 4', position: { lat: 23.1840, lng: 75.7833 } },
      { id: 'toilet-5', name: 'Public Toilet 5', position: { lat: 23.1774, lng: 75.7922 } },
      { id: 'toilet-6', name: 'Public Toilet 6', position: { lat: 23.1792562, lng: 75.7700855 } },
    ],
    []
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [route, setRoute] = useState<google.maps.DirectionsResult | null>(null);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude } as google.maps.LatLngLiteral;
        setOrigin(coords);
        map?.panTo(coords);
        map?.setZoom(15);
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true }
    );
  }, [map]);

  const onMapLoad = useCallback(
    (m: google.maps.Map) => {
      setMap(m);
      const bounds = new google.maps.LatLngBounds();
      toilets.forEach((p) => bounds.extend(p.position));
      try {
        // try with padding first (some versions accept it)
        m.fitBounds(bounds, 64);
      } catch {
        m.fitBounds(bounds);
      }
    },
    [toilets]
  );

  const onPlaceChanged = useCallback(() => {
    const ac = originAutoRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    if (place.geometry?.location) {
      const loc = place.geometry.location.toJSON() as google.maps.LatLngLiteral;
      setOrigin(loc);
      map?.panTo(loc);
      map?.setZoom(14);
    }
  }, [map]);

  const routeToNearest = useCallback(() => {
    if (!origin) return;
    const haversine = (a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral) => {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371000;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    };
    let best = toilets[0],
      bestD = haversine(origin, toilets[0].position);
    for (let i = 1; i < toilets.length; i++) {
      const d = haversine(origin, toilets[i].position);
      if (d < bestD) {
        best = toilets[i];
        bestD = d;
      }
    }
    setSelectedId(best.id);
    if (destInputRef.current) destInputRef.current.value = best.name;
    const svc = new google.maps.DirectionsService();
    svc.route(
      { origin, destination: best.position, travelMode: google.maps.TravelMode.DRIVING },
      (res, status) => {
        if (status === 'OK' && res) setRoute(res);
        else setRoute(null);
      }
    );
  }, [origin, toilets]);

  if (loadError) return <div className="p-4 text-red-600">Failed to load Google Maps. Check API key.</div>;

  // build data-url SVG icons (purple circle with 'T', and blue circle for origin)
  const toiletSvg = (selected = false) => {
    const size = selected ? 48 : 36;
    const bg = '#7c3aed';
    const stroke = '#000000';
    const textSize = selected ? 22 : 16;
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
        <circle cx='${size / 2}' cy='${size / 2}' r='${size / 2 - 2}' fill='${bg}' stroke='${stroke}' stroke-width='2'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='${textSize}' fill='white' font-weight='700'>T</text>
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
            <Autocomplete onLoad={(ac) => (originAutoRef.current = ac)} onPlaceChanged={onPlaceChanged}>
              <input className="px-3 py-2 border rounded w-56 sm:w-64 md:w-72" placeholder="From: Enter origin" />
            </Autocomplete>
            <button
              className="px-3 py-2 border rounded bg-blue-600 text-white text-sm sm:text-base"
              onClick={useCurrentLocation}
            >
              Use Current Location
            </button>
            <input
              ref={destInputRef}
              className="px-3 py-2 border rounded w-56 sm:w-64 md:w-72"
              placeholder="Destination"
              readOnly
            />
            <button
              className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded text-sm sm:text-base"
              onClick={routeToNearest}
              disabled={!origin}
            >
              Nearest Toilet
            </button>
          </div>

          {/* Origin marker */}
          {origin && (
            <Marker
              position={origin}
              title="You are here"
              icon={makeIcon(originSvg(), 36)}
              zIndex={1300}
              optimized={false} // render as DOM for reliability
              onLoad={(m) => console.log('origin marker loaded', m)}
              onClick={() => {
                map?.panTo(origin);
                map?.setZoom(15);
              }}
            />
          )}

          {/* Toilet markers (robust SVG icons + fallback) */}
          {toilets.map((t) => {
            const isSel = selectedId === t.id;
            const svgUrl = toiletSvg(isSel);
            // Fallback external icon if for some reason data-url blocked
            const fallbackUrl = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
            const iconObj = makeIcon(svgUrl, isSel ? 48 : 36);
            return (
              <Marker
                key={t.id}
                position={t.position}
                title={t.name}
                icon={iconObj}
                zIndex={1200}
                optimized={false}
                onLoad={(m) => console.log('toilet marker loaded', t.id, m)}
                onClick={() => {
                  setSelectedId(t.id);
                  if (origin) {
                    const svc = new google.maps.DirectionsService();
                    svc.route(
                      { origin, destination: t.position, travelMode: google.maps.TravelMode.DRIVING },
                      (res, status) => {
                        if (status === 'OK' && res) setRoute(res);
                        else setRoute(null);
                      }
                    );
                  }
                  if (destInputRef.current) destInputRef.current.value = t.name;
                }}
                // if icon fails to render (rare) we still have a visible fallback by setting title and relying on default marker
                // note: you can swap icon={makeIcon(fallbackUrl, 36)} to force fallback behavior for testing
              />
            );
          })}

          {/* Route renderer */}
          {route && (
            <DirectionsRenderer
              options={{
                directions: route,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#7c3aed',
                  strokeWeight: 6,
                  zIndex: 100,
                },
                preserveViewport: true,
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

export default Toilets;
