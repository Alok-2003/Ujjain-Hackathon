import React, { useState } from 'react';
import Map from '../components/Map';
import { touristSpots, hotels, temples, shuttles, UJJAIN_CENTER } from '../data/sampleData';
import { MapPin, Info } from 'lucide-react';

const ExploreMap: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<{id: string, type: string} | null>(null);
  const [showLayer, setShowLayer] = useState({
    touristSpots: true,
    hotels: true,
    temples: true,
    shuttles: true
  });

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'ghat':
        return '#3B82F6'; // Blue
      case 'event_area':
        return '#EF4444'; // Red
      case 'tourist_spot':
        return '#10B981'; // Green
      case 'hotel':
        return '#8B5CF6'; // Purple
      case 'temple':
        return '#DC2626'; // Dark Red
      case 'shuttle':
        return '#F59E0B'; // Amber
      default:
        return '#FF6B35'; // Orange
    }
  };

  // Combine all markers
  const allMarkers = [
    ...(showLayer.touristSpots ? touristSpots.map((spot) => ({
      id: `spot-${spot.id}`,
      coordinates: spot.coordinates,
      title: spot.name,
      description: `${spot.description} (${spot.type.replace('_', ' ')})`,
      color: getMarkerColor(spot.type),
      onClick: () => setSelectedItem({id: spot.id, type: 'spot'}),
    })) : []),
    ...(showLayer.hotels ? hotels.map((hotel) => ({
      id: `hotel-${hotel.id}`,
      coordinates: hotel.coordinates,
      title: hotel.name,
      description: `${hotel.rating}⭐ • ${hotel.price}`,
      color: getMarkerColor('hotel'),
      onClick: () => setSelectedItem({id: hotel.id, type: 'hotel'}),
    })) : []),
    ...(showLayer.temples ? temples.map((temple) => ({
      id: `temple-${temple.id}`,
      coordinates: temple.coordinates,
      title: temple.name,
      description: temple.significance,
      color: getMarkerColor('temple'),
      onClick: () => setSelectedItem({id: temple.id, type: 'temple'}),
    })) : []),
    ...(showLayer.shuttles ? shuttles.map((shuttle) => ({
      id: `shuttle-${shuttle.id}`,
      coordinates: shuttle.coordinates,
      title: shuttle.name,
      description: `${shuttle.status} • ${shuttle.currentPassengers}/${shuttle.capacity}`,
      color: getMarkerColor('shuttle'),
      onClick: () => setSelectedItem({id: shuttle.id, type: 'shuttle'}),
    })) : [])
  ];

  const getSelectedItemData = () => {
    if (!selectedItem) return null;
    
    switch (selectedItem.type) {
      case 'spot':
        return touristSpots.find(spot => spot.id === selectedItem.id);
      case 'hotel':
        return hotels.find(hotel => hotel.id === selectedItem.id);
      case 'temple':
        return temples.find(temple => temple.id === selectedItem.id);
      case 'shuttle':
        return shuttles.find(shuttle => shuttle.id === selectedItem.id);
      default:
        return null;
    }
  };

  const selectedItemData = getSelectedItemData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Ujjain Mahakumbh Map
          </h1>
          <p className="text-gray-600">
            Explore all locations: temples, hotels, shuttles, ghats, and tourist spots
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with legend and info */}
          <div className="lg:col-span-1">
            {/* Layer Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Map Layers</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLayer.touristSpots}
                    onChange={(e) => setShowLayer(prev => ({...prev, touristSpots: e.target.checked}))}
                    className="rounded"
                  />
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Tourist Spots & Ghats</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLayer.hotels}
                    onChange={(e) => setShowLayer(prev => ({...prev, hotels: e.target.checked}))}
                    className="rounded"
                  />
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Hotels</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLayer.temples}
                    onChange={(e) => setShowLayer(prev => ({...prev, temples: e.target.checked}))}
                    className="rounded"
                  />
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span className="text-sm">Temples</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLayer.shuttles}
                    onChange={(e) => setShowLayer(prev => ({...prev, shuttles: e.target.checked}))}
                    className="rounded"
                  />
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Shuttles</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Ghats & Tourist Spots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">Event Areas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span className="text-sm">Sacred Temples</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Hotels</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Shuttle Services</span>
                </div>
              </div>
            </div>

            {/* Selected spot info */}
            {selectedItemData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedItemData.name || selectedItemData.title}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-orange-100 text-xs rounded-full mt-1 capitalize">
                      {selectedItem?.type}
                    </span>
                  </div>
                </div>
                <div className="text-gray-600 text-sm">
                  {selectedItemData.description || 
                   selectedItemData.significance || 
                   selectedItemData.address ||
                   `${selectedItemData.route || ''}`}
                </div>
                {selectedItem?.type === 'hotel' && selectedItemData.price && (
                  <div className="mt-2 text-green-600 font-semibold">
                    {selectedItemData.price}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Map
                center={UJJAIN_CENTER}
                zoom={14}
                markers={allMarkers}
                className="h-96 lg:h-[600px]"
              />
            </div>
          </div>
        </div>

        {/* Tourist spots grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">All Locations ({allMarkers.length} total)</h2>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-blue-600">{touristSpots.length}</div>
              <div className="text-sm text-gray-600">Tourist Spots</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-purple-600">{hotels.length}</div>
              <div className="text-sm text-gray-600">Hotels</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-red-600">{temples.length}</div>
              <div className="text-sm text-gray-600">Temples</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-amber-600">{shuttles.length}</div>
              <div className="text-sm text-gray-600">Shuttles</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {touristSpots.map((spot) => (
              <div
                key={spot.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedItem?.id === spot.id && selectedItem?.type === 'spot' ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setSelectedItem({id: spot.id, type: 'spot'})}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{spot.name}</h3>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getMarkerColor(spot.type) }}
                  ></div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{spot.description}</p>
                <span className="inline-block px-3 py-1 bg-gray-100 text-xs rounded-full capitalize">
                  {spot.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreMap;