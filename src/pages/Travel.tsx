 import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: 'calc(100vh - 64px)', // account for navbar height
};

// Ujjain center
const defaultCenter = { lat: 23.1765, lng: 75.7849 } as google.maps.LatLngLiteral;

const Travel: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const originAutoRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destAutoRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destInputRef = useRef<HTMLInputElement | null>(null);

  type Hospital = { id: string; name: string; position: google.maps.LatLngLiteral };
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<
    { hospitalId: string; name: string; directions: google.maps.DirectionsResult; color: string }[]
  >([]);
  const [renderersVersion] = useState<number>(0);
  const [showRenderers] = useState<boolean>(true);
  const [isFindingNearest, setIsFindingNearest] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  type Category = 'hospital' | 'dustbin' | 'toilet';
  const [selectedCategory, setSelectedCategory] = useState<Category>('hospital');

  // Dummy data for dustbins and toilets around Ujjain
  const dustbins: Hospital[] = useMemo(
    () => [
      { id: 'dustbin-1', name: 'Dustbin 1', position: { lat: 23.1765, lng: 75.7849 } },
      { id: 'dustbin-2', name: 'Dustbin 2', position: { lat: 23.1745, lng: 75.7825 } },
      { id: 'dustbin-3', name: 'Dustbin 3', position: { lat: 23.1802, lng: 75.7901 } },
      { id: 'dustbin-4', name: 'Dustbin 4', position: { lat: 23.1718, lng: 75.7799 } },
      { id: 'dustbin-5', name: 'Dustbin 5', position: { lat: 23.1831, lng: 75.7868 } },
    ],
    []
  );

  // Build a self-contained SVG icon with an embedded letter so it renders reliably
  const getLetterIcon = useCallback((letter: 'D' | 'T', fill: string, selected: boolean): google.maps.Icon => {
    const size = selected ? 72 : 60; // bigger when selected
    const radius = size / 2 - 3;
    const fontSize = Math.round(size * 0.5);
    const strokeWidth = Math.max(2, Math.round(size * 0.06));
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
        <circle cx='${size/2}' cy='${size/2}' r='${radius}' fill='${fill}' stroke='white' stroke-width='3'/>
        <text x='50%' y='54%' text-anchor='middle' dominant-baseline='middle'
              font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' font-weight='800'
              stroke='black' stroke-width='${strokeWidth}' paint-order='stroke' fill='white'>${letter}</text>
      </svg>`;
    const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    const scaledSize = new google.maps.Size(size, size);
    const anchor = new google.maps.Point(size / 2, size / 2);
    return { url, scaledSize, anchor };
  }, []);

  // No custom SVGs; we will use labeled circular markers like hospitals

  const toilets: Hospital[] = useMemo(
    () => [
      { id: 'toilet-1', name: 'Public Toilet 1', position: { lat: 23.1765, lng: 75.7849 } },
      { id: 'toilet-2', name: 'Public Toilet 2', position: { lat: 23.1797, lng: 75.7812 } },
      { id: 'toilet-3', name: 'Public Toilet 3', position: { lat: 23.1726, lng: 75.7860 } },
      { id: 'toilet-4', name: 'Public Toilet 4', position: { lat: 23.1840, lng: 75.7833 } },
      { id: 'toilet-5', name: 'Public Toilet 5', position: { lat: 23.1774, lng: 75.7922 } },
    ],
    []
  );

  const onLoadMap = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  // Cleanup any stale renderers not present in selectedRoutes
  React.useEffect(() => {
    const active = new Set(selectedRoutes.map((r) => r.hospitalId));
    Object.keys(dirRenderersRef.current).forEach((id) => {
      if (!active.has(id)) {
        const inst = dirRenderersRef.current[id];
        try {
          (inst as unknown as { setDirections: (d: any) => void }).setDirections(null);
          (inst as google.maps.DirectionsRenderer).setMap(null);
        } catch {}
        delete dirRenderersRef.current[id];
      }
    });
  }, [selectedRoutes]);

  const onUnmountMap = useCallback(() => {
    // Clear all DirectionsRenderers from the map on unmount
    Object.keys(dirRenderersRef.current).forEach((id) => {
      const inst = dirRenderersRef.current[id];
      try {
        (inst as unknown as { setDirections: (d: any) => void }).setDirections(null);
        (inst as google.maps.DirectionsRenderer).setMap(null);
      } catch {}
      delete dirRenderersRef.current[id];
    });
    setMap(null);
  }, []);

  const handlePlaceChanged = useCallback((type: 'origin' | 'destination') => {
    const ac = type === 'origin' ? originAutoRef.current : destAutoRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    if (place.geometry && place.geometry.location) {
      const loc = place.geometry.location.toJSON();
      if (type === 'origin') setOrigin(loc);
      // For destination input typed by user, we don't manage a separate destination state
      // Multi-route uses hospital selection; still keep input for user reference
    }
  }, []);

  const fetchRoutesForHospital = useCallback(
    async (h: Hospital) => {
      if (!origin || !isLoaded) return;
      const service = new google.maps.DirectionsService();
      const result = await service.route({
        origin,
        destination: h.position,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      });

      // Fit to new route
      if (map && result.routes[0]) {
        const bounds = new google.maps.LatLngBounds();
        const leg = result.routes[0].legs[0];
        if (leg) {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        }
        map.fitBounds(bounds, 64);
      }

      setSelectedRoutes((prev) => {
        const existingIdx = prev.findIndex((r) => r.hospitalId === h.id);
        if (existingIdx !== -1) {
          const copy = [...prev];
          copy[existingIdx] = { ...copy[existingIdx], directions: result };
          setSelectedIndex(existingIdx);
          return copy;
        }
        const color = colors[prev.length % colors.length];
        const next = [...prev, { hospitalId: h.id, name: h.name, directions: result, color }];
        setSelectedIndex(next.length - 1);
        return next;
      });
    },
    [origin, isLoaded, map]
  );

  const loadHospitals = useCallback(() => {
    if (!isLoaded || !map) return;
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: defaultCenter,
        radius: 10000, // 10 km
        type: 'hospital',
        keyword: 'hospital',
      },
      (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
        const hs: Hospital[] = results
          .filter(r => !!r.geometry?.location)
          .map(r => ({
            id: r.place_id!,
            name: r.name || 'Hospital',
            position: r.geometry!.location!.toJSON(),
          }));
        setHospitals(hs);
      }
    );
  }, [isLoaded, map]);

  // Load hospitals once map is ready
  React.useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  // Removed route summaries list as per requirement

  const colors = ['#1d4ed8', '#16a34a', '#f59e0b', '#ef4444'];
  const dirRenderersRef = useRef<Record<string, google.maps.DirectionsRenderer>>({});

  // Removed removeRoute as route list UI was removed

  // Use browser geolocation to set origin
  const useCurrentLocation = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude } as google.maps.LatLngLiteral;
        setOrigin(coords);
        if (map) {
          map.panTo(coords);
          map.setZoom(14);
        }
      },
      (err) => {
        setGeoError(err.message || 'Failed to get your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  // Utility: Haversine distance in meters
  const haversine = useCallback((a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const s =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    return R * c;
  }, []);

  // Find nearest item in a list
  const nearestFromList = useCallback(
    (list: Hospital[], from: google.maps.LatLngLiteral): Hospital | null => {
      if (list.length === 0) return null;
      let best: Hospital = list[0];
      let bestDist = haversine(from, list[0].position);
      for (let i = 1; i < list.length; i++) {
        const d = haversine(from, list[i].position);
        if (d < bestDist) {
          best = list[i];
          bestDist = d;
        }
      }
      return best;
    },
    [haversine]
  );

  // Find nearest based on selected category and draw route
  const routeToNearest = useCallback(() => {
    if (!isLoaded || !map) return;
    if (!origin) {
      setGeoError('Please set an origin (use current location or enter an address).');
      return;
    }
    setGeoError(null);
    setIsFindingNearest(true);

    if (selectedCategory === 'hospital') {
      const svc = new google.maps.places.PlacesService(map);
      svc.nearbySearch(
        {
          location: origin,
          rankBy: google.maps.places.RankBy.DISTANCE,
          type: 'hospital',
          keyword: 'hospital',
        },
        (results, status) => {
          setIsFindingNearest(false);
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
            setGeoError('Could not find nearby hospitals from the chosen origin.');
            return;
          }
          const r = results[0];
          if (!r.place_id || !r.geometry?.location) {
            setGeoError('Invalid hospital location received.');
            return;
          }
          const h: Hospital = {
            id: r.place_id,
            name: r.name || 'Hospital',
            position: r.geometry.location.toJSON(),
          };
          const hs: Hospital[] = results.slice(0, 10).filter(x => !!x.geometry?.location).map(x => ({
            id: x.place_id!,
            name: x.name || 'Hospital',
            position: x.geometry!.location!.toJSON(),
          }));
          setHospitals(hs);
          setSelectedHospitalId(h.id);

          if (destInputRef.current) {
            const detailsSvc = new google.maps.places.PlacesService(map);
            detailsSvc.getDetails({ placeId: h.id, fields: ['name', 'formatted_address'] }, (det, detStatus) => {
              if (detStatus === google.maps.places.PlacesServiceStatus.OK && det) {
                destInputRef.current!.value = det.formatted_address ? `${det.name} - ${det.formatted_address}` : det.name || 'Hospital';
              } else {
                destInputRef.current!.value = h.name;
              }
            });
          }

          fetchRoutesForHospital(h);
        }
      );
    } else {
      // Dummy categories: compute nearest locally
      const list = selectedCategory === 'dustbin' ? dustbins : toilets;
      const nearest = nearestFromList(list, origin);
      setIsFindingNearest(false);
      if (!nearest) {
        setGeoError('No locations available for the selected category.');
        return;
      }
      setSelectedHospitalId(nearest.id);
      if (destInputRef.current) destInputRef.current.value = nearest.name;
      fetchRoutesForHospital(nearest);
    }
  }, [isLoaded, map, origin, selectedCategory, dustbins, toilets, nearestFromList, fetchRoutesForHospital]);

  if (loadError) {
    return <div className="p-4 text-red-600">Failed to load Google Maps. Check API key.</div>;
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="absolute z-10 left-1/2 -translate-x-1/2 top-16 sm:top-20 flex gap-2 sm:gap-3 flex-wrap bg-white/90 p-2 sm:p-3 rounded-lg shadow max-w-[95vw]">
        {isLoaded && (
          <>
            <Autocomplete
              onLoad={(ac: google.maps.places.Autocomplete) => (originAutoRef.current = ac)}
              onPlaceChanged={() => handlePlaceChanged('origin')}
            >
              <input
                className="px-3 py-2 border rounded w-56 sm:w-64 md:w-72"
                placeholder="From: Enter origin"
                type="text"
              />
            </Autocomplete>
            <button
              className="px-3 py-2 border rounded bg-blue-600 text-white text-sm sm:text-base"
              type="button"
              onClick={useCurrentLocation}
              title="Use your current location as origin"
            >
              Use Current Location
            </button>
            <Autocomplete
              onLoad={(ac: google.maps.places.Autocomplete) => (destAutoRef.current = ac)}
              onPlaceChanged={() => handlePlaceChanged('destination')}
            >
              <input
                ref={destInputRef}
                className="px-3 py-2 border rounded w-56 sm:w-64 md:w-72"
                placeholder="To: Enter destination (optional)"
                type="text"
              />
            </Autocomplete>
            {/* Category selection */}
            <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 text-sm sm:text-base">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategory === 'hospital'}
                  onChange={() => setSelectedCategory('hospital')}
                />
                Hospital
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategory === 'dustbin'}
                  onChange={() => setSelectedCategory('dustbin')}
                />
                Dustbin
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategory === 'toilet'}
                  onChange={() => setSelectedCategory('toilet')}
                />
                Toilet
              </label>
            </div>
            <button
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 text-sm sm:text-base"
              disabled={!origin || isFindingNearest}
              onClick={routeToNearest}
              title="Find the nearest selected category from your origin and route"
            >
              {isFindingNearest ? 'Finding nearest…' : 'Nearest Route'}
            </button>
          </>
        )}
      </div>

      {/* Notices */}
      {geoError && (
        <div className="absolute z-10 top-40 left-1/2 -translate-x-1/2 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded shadow">
          {geoError}
        </div>
      )}

      {/* Route list removed as per requirement */}

      {/* Map */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={15}
          onLoad={onLoadMap}
          onUnmount={onUnmountMap}
          options={{ streetViewControl: false, mapTypeControl: false }}
        >
          {!origin && selectedRoutes.length === 0 && <Marker position={defaultCenter} />}
          {origin && (
            <Marker
              position={origin}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#2563eb',
                fillOpacity: 1,
                scale: 6,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              title="Origin"
            />
          )}

          {/* Hospital markers */}
          {hospitals.map((h) => (
            <Marker
              key={h.id}
              position={h.position}
              label={{ text: 'H', color: 'white', fontWeight: 'bold' }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: selectedHospitalId === h.id ? '#dc2626' : '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: selectedHospitalId === h.id ? 18 : 14,
              }}
              zIndex={1000}
              onClick={() => {
                setSelectedHospitalId(h.id);
                // Write hospital name/address to destination input
                if (destInputRef.current) {
                  // Try to get details for better address
                  if (map) {
                    const svc = new google.maps.places.PlacesService(map);
                    svc.getDetails({ placeId: h.id, fields: ['name', 'formatted_address'] }, (det, status) => {
                      if (status === google.maps.places.PlacesServiceStatus.OK && det) {
                        destInputRef.current!.value = det.formatted_address ? `${det.name} - ${det.formatted_address}` : det.name || 'Hospital';
                      } else {
                        destInputRef.current!.value = h.name;
                      }
                    });
                  } else {
                    destInputRef.current.value = h.name;
                  }
                }
                // Compute and add route for this hospital if origin already chosen
                if (origin) {
                  fetchRoutesForHospital(h);
                }
              }}
              title={h.name}
            />
          ))}

          {/* Dustbin markers (dummy) with label 'D' */}
          {dustbins.map((d) => (
            <Marker
              key={d.id}
              position={d.position}
              icon={getLetterIcon('D', '#16a34a', selectedHospitalId === d.id)}
              zIndex={1900}
              title={d.name}
              onClick={() => {
                setSelectedHospitalId(d.id);
                if (destInputRef.current) destInputRef.current.value = d.name;
                if (origin) fetchRoutesForHospital(d);
              }}
              options={{ optimized: false }}
            />
          ))}

          {/* Toilet markers (dummy) with label 'T' */}
          {toilets.map((t) => (
            <Marker
              key={t.id}
              position={t.position}
              icon={getLetterIcon('T', '#7c3aed', selectedHospitalId === t.id)}
              zIndex={1800}
              title={t.name}
              onClick={() => {
                setSelectedHospitalId(t.id);
                if (destInputRef.current) destInputRef.current.value = t.name;
                if (origin) fetchRoutesForHospital(t);
              }}
              options={{ optimized: false }}
            />
          ))}

          {showRenderers && selectedRoutes.map((r, idx) => (
            <DirectionsRenderer
              key={`${r.hospitalId}-${renderersVersion}`}
              onLoad={(dr) => {
                dirRenderersRef.current[r.hospitalId] = dr;
              }}
              onUnmount={() => {
                const inst = dirRenderersRef.current[r.hospitalId];
                if (inst) {
                  try {
                    (inst as unknown as { setDirections: (d: any) => void }).setDirections(null);
                    (inst as google.maps.DirectionsRenderer).setMap(null);
                  } catch {}
                }
                delete dirRenderersRef.current[r.hospitalId];
              }}
              options={{
                directions: r.directions,
                polylineOptions: {
                  strokeColor: r.color,
                  strokeOpacity: selectedIndex === idx ? 1 : 0.6,
                  strokeWeight: selectedIndex === idx ? 6 : 4,
                },
                suppressMarkers: true,
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <div className="p-4">Loading map…</div>
      )}
    </div>
  );
};

export default Travel;