import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import { shuttles, UJJAIN_CENTER, Shuttle } from '../data/sampleData';
import { MapPin, Users, Route, Activity, Pause } from 'lucide-react';

const ShuttleLocation: React.FC = () => {
  const [selectedShuttle, setSelectedShuttle] = useState<string | null>(null);
  const [currentShuttles, setCurrentShuttles] = useState<Shuttle[]>(shuttles);

  // Simulate live shuttle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShuttles(prevShuttles =>
        prevShuttles.map(shuttle => ({
          ...shuttle,
          coordinates: [
            shuttle.coordinates[0] + (Math.random() - 0.5) * 0.002,
            shuttle.coordinates[1] + (Math.random() - 0.5) * 0.002,
          ] as [number, number],
          currentPassengers: shuttle.status === 'active'
            ? Math.max(0, Math.min(shuttle.capacity, shuttle.currentPassengers + Math.floor(Math.random() * 6) - 2))
            : 0,
        }))
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getMarkerColor = (status: string) => {
    return status === 'active' ? '#10B981' : '#6B7280'; // Green for active, gray for inactive
  };

  const markers = currentShuttles.map((shuttle) => ({
    id: shuttle.id,
    coordinates: shuttle.coordinates,
    title: shuttle.name,
    description: `${shuttle.status === 'active' ? '🟢 Active' : '⚫ Inactive'} • ${shuttle.currentPassengers}/${shuttle.capacity} passengers`,
    color: getMarkerColor(shuttle.status),
    onClick: () => setSelectedShuttle(shuttle.id),
  }));

  const selectedShuttleData = currentShuttles.find(shuttle => shuttle.id === selectedShuttle);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Shuttle Tracking
          </h1>
          <p className="text-gray-600">
            Real-time locations of shuttle services throughout Ujjain
          </p>
          <div className="mt-2 flex items-center space-x-2 text-sm">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-green-600">Live updates every 3 seconds</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Shuttle info sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Shuttle Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Active</span>
                  </div>
                  <span className="text-sm font-medium">
                    {currentShuttles.filter(s => s.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Inactive</span>
                  </div>
                  <span className="text-sm font-medium">
                    {currentShuttles.filter(s => s.status === 'inactive').length}
                  </span>
                </div>
              </div>
            </div>

            {selectedShuttleData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{selectedShuttleData.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedShuttleData.status === 'active' ? (
                        <Activity className="h-4 w-4 text-green-500" />
                      ) : (
                        <Pause className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={`text-sm capitalize ${
                        selectedShuttleData.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {selectedShuttleData.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {selectedShuttleData.currentPassengers} / {selectedShuttleData.capacity} passengers
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(selectedShuttleData.currentPassengers / selectedShuttleData.capacity) * 100}%`
                      }}
                    ></div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Route className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{selectedShuttleData.route}</span>
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

        {/* Shuttles grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">All Shuttles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentShuttles.map((shuttle) => (
              <div
                key={shuttle.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedShuttle === shuttle.id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedShuttle(shuttle.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{shuttle.name}</h3>
                  <div className="flex items-center space-x-1">
                    {shuttle.status === 'active' ? (
                      <>
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Inactive</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {shuttle.currentPassengers} / {shuttle.capacity} passengers
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      shuttle.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    style={{
                      width: `${(shuttle.currentPassengers / shuttle.capacity) * 100}%`
                    }}
                  ></div>
                </div>

                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <Route className="h-4 w-4 mt-0.5" />
                  <span>{shuttle.route}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShuttleLocation;