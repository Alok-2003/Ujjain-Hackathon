import React, { useState } from 'react';
import Map from '../components/Map';
import { temples, UJJAIN_CENTER } from '../data/sampleData';
import { MapPin, Clock, Info, Navigation } from 'lucide-react';

const MandirList: React.FC = () => {
  const [selectedTemple, setSelectedTemple] = useState<string | null>(null);

  const markers = temples.map((temple) => ({
    id: temple.id,
    coordinates: temple.coordinates,
    title: temple.name,
    description: temple.significance,
    color: '#DC2626', // Red color for temples
    onClick: () => setSelectedTemple(temple.id),
  }));

  const selectedTempleData = temples.find(temple => temple.id === selectedTemple);

  const getDirections = (coordinates: [number, number]) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sacred Temples of Ujjain
          </h1>
          <p className="text-gray-600">
            Discover the divine temples and their spiritual significance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Temple info sidebar */}
          <div className="lg:col-span-1">
            {selectedTempleData ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <img
                    src={selectedTempleData.image}
                    alt={selectedTempleData.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTempleData.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Opening Hours</div>
                      <div className="text-sm text-gray-600">{selectedTempleData.openingHours}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Significance</div>
                      <div className="text-sm text-gray-600">{selectedTempleData.significance}</div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{selectedTempleData.description}</p>

                <button
                  onClick={() => getDirections(selectedTempleData.coordinates)}
                  className="inline-flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 w-full justify-center"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">Select a Temple</h3>
                <p className="text-gray-600 text-sm">
                  Click on a temple marker or card to view details and get directions.
                </p>
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-800">
                    <strong>Total Temples:</strong> {temples.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Map
                center={UJJAIN_CENTER}
                zoom={13}
                markers={markers}
                className="h-96 lg:h-[600px]"
              />
            </div>
          </div>
        </div>

        {/* Temples grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">All Temples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {temples.map((temple) => (
              <div
                key={temple.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTemple === temple.id ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => setSelectedTemple(temple.id)}
              >
                <img
                  src={temple.image}
                  alt={temple.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-2">{temple.name}</h3>
                  
                  <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{temple.openingHours}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{temple.description}</p>
                  
                  <div className="bg-orange-50 p-3 rounded-lg mb-4">
                    <div className="text-sm text-orange-800">
                      <strong>Significance:</strong> {temple.significance}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(temple.coordinates);
                    }}
                    className="inline-flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 w-full justify-center"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandirList;