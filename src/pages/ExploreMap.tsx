import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parseCSV, LocationData, getCategoryColors } from '../utils/csvParser';
import { useLanguage } from '../contexts/LanguageContext';

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxvazIwMDMiLCJhIjoiY201anNwZXRnMTAzbzJpc2ZtaHhudG1kNiJ9.3y0a5jiMDl42FUAN-Wy1Fg';



const ExploreMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { t, translateCategory } = useLanguage();

  // Function to create custom marker element based on category
  const createMarkerElement = (categoryName: string) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cursor = 'pointer';
    el.style.zIndex = '1000';
    
    if (categoryName.toLowerCase() === 'restaurant') {
      // Use custom restaurant icon
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = 'url(/restaurant.png)';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.borderRadius = '8px';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4)';
    } else if (categoryName.toLowerCase() === 'hindu temple') {
      // Use custom temple icon
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = 'url(/temple.png)';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.borderRadius = '8px';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4)';
    } else {
      // Use colored circle for other categories
      el.style.backgroundColor = getCategoryColors(categoryName);
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
    }
    
    return el;
  };

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      console.log('Starting to load CSV data...');
      try {
        const data = await parseCSV('/Dataset.csv');
        console.log('CSV data loaded:', data.length, 'items');
        setLocationData(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.categoryName))].filter(Boolean);
        console.log('Unique categories found:', uniqueCategories);
        setCategories(uniqueCategories);
        setSelectedCategories(new Set(uniqueCategories)); // Show all categories by default
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    console.log('Initializing map...');
    
    if (mapContainer.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [75.7849, 23.1765], // Ujjain coordinates
          zoom: 12
        });

        map.current.on('load', () => {
          console.log('Map loaded successfully!');
          setMapLoaded(true);
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        console.log('Map initialized');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    } else {
      console.error('Map container not found');
    }
  }, []);

  // Update markers when data or filters change
  useEffect(() => {
    if (!map.current || loading) {
      console.log('Map not ready or still loading:', { mapReady: !!map.current, loading });
      return;
    }

    console.log('Updating markers. Location data:', locationData.length, 'Selected categories:', selectedCategories.size);

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);

    // Filter data based on selected categories
    const filteredData = locationData.filter(item => 
      selectedCategories.has(item.categoryName)
    );

    console.log('Filtered data for markers:', filteredData.length);

    // Create new markers
    const newMarkers = filteredData.map((item, index) => {
      console.log(`Creating marker ${index + 1}: ${item.title} at [${item.lng}, ${item.lat}]`);
      
      // Create custom marker element based on category
      const el = createMarkerElement(item.categoryName);

      // Create enhanced popup content with comprehensive translations
      const popupContent = `
        <div class="p-4 max-w-sm bg-white rounded-lg shadow-lg">
          <h3 class="font-bold text-lg mb-2 text-gray-900">${item.title}</h3>
          <div class="flex items-center mb-3">
            <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              ${translateCategory(item.categoryName)}
            </span>
            ${item.hotelStars ? `<span class="ml-2 text-sm text-yellow-600">${item.hotelStars} ${t.hotelStars}</span>` : ''}
          </div>
          
          ${item.hotelDescription ? `
          <div class="mb-3">
            <h4 class="font-medium text-sm text-gray-700 mb-1">${t.about}:</h4>
            <p class="text-sm text-gray-600 leading-relaxed">${item.hotelDescription}</p>
          </div>` : ''}
          
          <div class="space-y-2 text-sm">
            ${item.address ? `
            <div class="flex items-start">
              <span class="font-medium text-gray-700 min-w-0 flex-shrink-0 mr-2">${t.address}:</span>
              <span class="text-gray-600">${item.address}</span>
            </div>` : ''}
            
            ${item.phone ? `
            <div class="flex items-center">
              <span class="font-medium text-gray-700 mr-2">${t.phone}:</span>
              <a href="tel:${item.phone}" class="text-blue-600 hover:text-blue-800">${item.phone}</a>
            </div>` : ''}
            
            ${item.website ? `
            <div class="flex items-center">
              <span class="font-medium text-gray-700 mr-2">${t.website}:</span>
              <a href="${item.website}" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs truncate">
                ${t.viewDetails}
              </a>
            </div>` : ''}
          </div>
          
          ${item.imageUrl ? `
          <div class="mt-3">
            <img src="${item.imageUrl}" alt="${item.title}" 
                 class="w-full h-32 object-cover rounded-lg" 
                 onerror="this.style.display='none'" />
          </div>` : ''}
          
          <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            <span>${t.location}: ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}</span>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.lng, item.lat])
        .setPopup(popup)
        .addTo(map.current!);

      return marker;
    });

    console.log('Created markers:', newMarkers.length);
    setMarkers(newMarkers);

    // Fit map to show all markers if we have data
    if (newMarkers.length > 0 && filteredData.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredData.forEach(item => {
        bounds.extend([item.lng, item.lat]);
      });
      
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 300, right: 50 } // Account for sidebar
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [locationData, selectedCategories, loading]);

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const toggleAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories));
    }
  };

  return (
    <div className="w-full h-screen relative">
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-xl">{t.loadingMapData}</div>
        </div>
      )}
      
      {/* Map Status */}
      {!mapLoaded && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm z-10">
          {t.mapInitializing}
        </div>
      )}
      

      {/* Category Filter Box */}
      <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-[45rem] overflow-y-auto">
        <h3 className="font-bold text-lg mb-3">{t.categories}</h3>
        
        {/* Toggle All Button */}
        <button
          onClick={toggleAll}
          className="w-full mb-3 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {selectedCategories.size === categories.length ? t.hideAll : t.showAll}
        </button>
        
        {/* Category Checkboxes */}
        <div className="space-y-2">
          {categories.map(category => {
            const isSelected = selectedCategories.has(category);
            const color = getCategoryColors(category);
            const count = locationData.filter(item => item.categoryName === category).length;
            
            return (
              <label key={category} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCategory(category)}
                  className="form-checkbox"
                />
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm flex-1">{translateCategory(category)}</span>
                <span className="text-xs text-gray-500">({count})</span>
              </label>
            );
          })}
        </div>
        
        {/* Stats */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-600">
          <p>{t.showing} {markers.length} {t.of} {locationData.length} {t.locations}</p>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ 
          minHeight: '100vh',
          position: 'relative',
          backgroundColor: '#f0f0f0'
        }}
      />
    </div>
  );
};

export default ExploreMap;