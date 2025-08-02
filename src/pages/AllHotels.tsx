import React, { useState } from 'react';
import Map from '../components/Map';
import { hotels, UJJAIN_CENTER } from '../data/sampleData';
import { MapPin, Star, ExternalLink, Wifi, Car, Coffee, Waves } from 'lucide-react';

const AllHotels: React.FC = () => {
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'restaurant':
        return <Coffee className="h-4 w-4" />;
      case 'river view':
        return <Waves className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const markers = hotels.map((hotel) => ({
    id: hotel.id,
    coordinates: hotel.coordinates,
    title: hotel.name,
    description: `${hotel.rating}⭐ • ${hotel.price}`,
    color: '#3B82F6',
    onClick: () => setSelectedHotel(hotel.id),
  }));

  const selectedHotelData = hotels.find(hotel => hotel.id === selectedHotel);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hotels in Ujjain
          </h1>
          <p className="text-gray-600">
            Find comfortable accommodation for your Mahakumbh visit
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Hotel info sidebar */}
          <div className="lg:col-span-1">
            {selectedHotelData ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{selectedHotelData.name}</h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{selectedHotelData.rating}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{selectedHotelData.address}</p>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {selectedHotelData.price}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHotelData.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-sm"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={selectedHotelData.bookingLink}
                  className="inline-flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 w-full justify-center"
                >
                  <span>Book Now</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">Select a Hotel</h3>
                <p className="text-gray-600 text-sm">
                  Click on a hotel marker or card to view details and booking information.
                </p>
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

        {/* Hotels grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">All Hotels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedHotel === hotel.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedHotel(hotel.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{hotel.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{hotel.address}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-green-600">{hotel.price}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {hotel.amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-xs px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">
                      +{hotel.amenities.length - 3} more
                    </span>
                  )}
                </div>

                <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors duration-200">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllHotels;