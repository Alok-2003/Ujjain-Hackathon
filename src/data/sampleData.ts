export interface Hotel {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  rating: number;
  price: string;
  bookingLink: string;
  amenities: string[];
}

export interface Shuttle {
  id: string;
  name: string;
  coordinates: [number, number];
  status: 'active' | 'inactive';
  capacity: number;
  currentPassengers: number;
  route: string;
}

export interface Temple {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  openingHours: string;
  significance: string;
  image: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'ghat' | 'event_area' | 'tourist_spot';
  description: string;
}

export const hotels: Hotel[] = [
  {
    id: '1',
    name: 'Mahakumbh Palace Hotel',
    address: 'Near Mahakaleshwar Temple, Ujjain',
    coordinates: [75.7849, 23.1765],
    rating: 4.5,
    price: '₹3,500/night',
    bookingLink: '#',
    amenities: ['Free WiFi', 'AC', 'Restaurant', 'Parking']
  },
  {
    id: '2',
    name: 'Shipra Heritage Resort',
    address: 'Shipra Ghat Road, Ujjain',
    coordinates: [75.7889, 23.1845],
    rating: 4.2,
    price: '₹2,800/night',
    bookingLink: '#',
    amenities: ['River View', 'AC', 'Restaurant', 'Spa']
  },
  {
    id: '3',
    name: 'Ujjain Grand Hotel',
    address: 'University Road, Ujjain',
    coordinates: [75.7719, 23.1965],
    rating: 4.0,
    price: '₹2,200/night',
    bookingLink: '#',
    amenities: ['Free WiFi', 'AC', 'Breakfast', 'Parking']
  },
  {
    id: '4',
    name: 'Kumbh Comfort Inn',
    address: 'Station Road, Ujjain',
    coordinates: [75.7659, 23.1825],
    rating: 3.8,
    price: '₹1,800/night',
    bookingLink: '#',
    amenities: ['AC', 'Restaurant', 'Room Service']
  }
];

export const shuttles: Shuttle[] = [
  {
    id: 'S1',
    name: 'Mahakal Express',
    coordinates: [75.7849, 23.1765],
    status: 'active',
    capacity: 50,
    currentPassengers: 32,
    route: 'Railway Station - Mahakaleshwar Temple'
  },
  {
    id: 'S2',
    name: 'Shipra Shuttle',
    coordinates: [75.7889, 23.1845],
    status: 'active',
    capacity: 40,
    currentPassengers: 18,
    route: 'Bus Stand - Shipra Ghat'
  },
  {
    id: 'S3',
    name: 'Temple Circuit',
    coordinates: [75.7719, 23.1965],
    status: 'inactive',
    capacity: 35,
    currentPassengers: 0,
    route: 'Hotel Zone - Multiple Temples'
  },
  {
    id: 'S4',
    name: 'Ghat Connect',
    coordinates: [75.7659, 23.1825],
    status: 'active',
    capacity: 45,
    currentPassengers: 28,
    route: 'Main Ghats Circuit'
  }
];

export const temples: Temple[] = [
  {
    id: '1',
    name: 'Mahakaleshwar Temple',
    coordinates: [75.7849, 23.1765],
    description: 'One of the twelve Jyotirlingas, this ancient temple is dedicated to Lord Shiva.',
    openingHours: '4:00 AM - 11:00 PM',
    significance: 'Sacred Jyotirlinga temple with divine energy',
    image: 'https://images.pexels.com/photos/3581913/pexels-photo-3581913.jpeg'
  },
  {
    id: '2',
    name: 'Kal Bhairav Temple',
    coordinates: [75.7789, 23.1685],
    description: 'Ancient temple dedicated to Kal Bhairav, the fierce manifestation of Lord Shiva.',
    openingHours: '5:00 AM - 10:00 PM',
    significance: 'Guardian deity of Ujjain city',
    image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg'
  },
  {
    id: '3',
    name: 'Harsiddhi Temple',
    coordinates: [75.7909, 23.1885],
    description: 'One of the 51 Shakti Peethas, dedicated to Goddess Harsiddhi.',
    openingHours: '6:00 AM - 9:00 PM',
    significance: 'Sacred Shakti Peetha temple',
    image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg'
  },
  {
    id: '4',
    name: 'Chintaman Ganesh Temple',
    coordinates: [75.7669, 23.1745],
    description: 'Famous Ganesh temple known for fulfilling devotees wishes.',
    openingHours: '5:30 AM - 10:30 PM',
    significance: 'Wish-fulfilling Ganesh temple',
    image: 'https://images.pexels.com/photos/3581913/pexels-photo-3581913.jpeg'
  }
];

export const touristSpots: TouristSpot[] = [
  {
    id: '1',
    name: 'Ram Ghat',
    coordinates: [75.7889, 23.1845],
    type: 'ghat',
    description: 'Sacred ghat on River Shipra for holy baths during Kumbh'
  },
  {
    id: '2',
    name: 'Triveni Ghat',
    coordinates: [75.7829, 23.1805],
    type: 'ghat',
    description: 'Confluence of three rivers, highly auspicious for pilgrims'
  },
  {
    id: '3',
    name: 'Main Kumbh Ground',
    coordinates: [75.7899, 23.1795],
    type: 'event_area',
    description: 'Primary event area for Mahakumbh festivities and gatherings'
  },
  {
    id: '4',
    name: 'Siddha Ashram',
    coordinates: [75.7759, 23.1875],
    type: 'event_area',
    description: 'Spiritual ashram hosting religious discourses and ceremonies'
  },
  {
    id: '5',
    name: 'Vikram University',
    coordinates: [75.7719, 23.1965],
    type: 'tourist_spot',
    description: 'Historic university campus with beautiful architecture'
  }
];

// Ujjain coordinates for map center
export const UJJAIN_CENTER: [number, number] = [75.7849, 23.1765];