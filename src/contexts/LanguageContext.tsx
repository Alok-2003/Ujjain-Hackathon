import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';

// Comprehensive translations for the entire app
export const translations = {
  en: {
    // Navigation
    home: 'Home',
    ghats: 'Ghats',
    accommodation: 'Accommodation',
    parkingShuttle: 'Parking & Shuttle',
    entryExit: 'Entry/Exit',
    temples: 'Temples',
    ujjainMahakumbh: 'Ujjain Mahakumbh',
    
    // Map Interface
    categories: 'Categories',
    showAll: 'Show All',
    hideAll: 'Hide All',
    loadingMapData: 'Loading map data...',
    mapInitializing: 'Map initializing...',
    showing: 'Showing',
    of: 'of',
    locations: 'locations',
    language: 'Language',
    phone: 'Phone',
    address: 'Address',
    description: 'Description',
    
    // Categories in CSV
    restaurant: 'Restaurant',
    familyRestaurant: 'Family Restaurant',
    fastFoodRestaurant: 'Fast Food Restaurant',
    dhaba: 'Dhaba',
    hotel: 'Hotel',
    guestHouse: 'Guest House',
    homestay: 'Homestay',
    temple: 'Temple',
    shoppingMall: 'Shopping Mall',
    lodging: 'Lodging',
    other: 'Other',
    
    // Common UI
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    viewDetails: 'View Details',
    contactInfo: 'Contact Information',
    ratings: 'Ratings',
    availability: 'Availability',
    
    // Card/Popup specific
    location: 'Location',
    details: 'Details',
    about: 'About',
    facilities: 'Facilities',
    timing: 'Timing',
    price: 'Price',
    booking: 'Booking',
    reviews: 'Reviews',
    photos: 'Photos',
    website: 'Website',
    directions: 'Directions',
    share: 'Share',
    favorite: 'Favorite',
    openNow: 'Open Now',
    closed: 'Closed',
    hotelStars: 'Star Rating',
    capacity: 'Capacity',
    currentStatus: 'Current Status'
  },
  hi: {
    // Navigation
    home: 'घर',
    ghats: 'घाट',
    accommodation: 'आवास',
    parkingShuttle: 'पार्किंग और शटल',
    entryExit: 'प्रवेश/निकास',
    temples: 'मंदिर',
    ujjainMahakumbh: 'उज्जैन महाकुंभ',
    
    // Map Interface
    categories: 'श्रेणियां',
    showAll: 'सभी दिखाएं',
    hideAll: 'सभी छुपाएं',
    loadingMapData: 'मैप डेटा लोड हो रहा है...',
    mapInitializing: 'मैप प्रारंभ हो रहा है...',
    showing: 'दिखा रहा है',
    of: 'का',
    locations: 'स्थान',
    language: 'भाषा',
    phone: 'फोन',
    address: 'पता',
    description: 'विवरण',
    
    // Categories in CSV
    restaurant: 'रेस्टोरेंट',
    familyRestaurant: 'पारिवारिक रेस्टोरेंट',
    fastFoodRestaurant: 'फास्ट फूड रेस्टोरेंट',
    dhaba: 'ढाबा',
    hotel: 'होटल',
    guestHouse: 'गेस्ट हाउस',
    homestay: 'होमस्टे',
    temple: 'मंदिर',
    shoppingMall: 'शॉपिंग मॉल',
    lodging: 'लॉजिंग',
    other: 'अन्य',
    
    // Common UI
    close: 'बंद करें',
    back: 'वापस',
    next: 'आगे',
    search: 'खोजें',
    filter: 'फिल्टर',
    sort: 'क्रमबद्ध करें',
    viewDetails: 'विवरण देखें',
    contactInfo: 'संपर्क जानकारी',
    ratings: 'रेटिंग',
    availability: 'उपलब्धता',
    
    // Card/Popup specific
    location: 'स्थान',
    details: 'विवरण',
    about: 'के बारे में',
    facilities: 'सुविधाएं',
    timing: 'समय',
    price: 'कीमत',
    booking: 'बुकिंग',
    reviews: 'समीक्षाएं',
    photos: 'फोटो',
    website: 'वेबसाइट',
    directions: 'दिशाएं',
    share: 'साझा करें',
    favorite: 'पसंदीदा',
    openNow: 'अभी खुला',
    closed: 'बंद',
    hotelStars: 'स्टार रेटिंग',
    capacity: 'क्षमता',
    currentStatus: 'वर्तमान स्थिति'
  },
  mr: {
    // Navigation
    home: 'मुख्यपृष्ठ',
    ghats: 'घाट',
    accommodation: 'निवास',
    parkingShuttle: 'पार्किंग आणि शटल',
    entryExit: 'प्रवेश/बाहेर पडणे',
    temples: 'मंदिरे',
    ujjainMahakumbh: 'उज्जैन महाकुंभ',
    
    // Map Interface
    categories: 'श्रेणी',
    showAll: 'सर्व दाखवा',
    hideAll: 'सर्व लपवा',
    loadingMapData: 'नकाशा डेटा लोड होत आहे...',
    mapInitializing: 'नकाशा सुरू होत आहे...',
    showing: 'दाखवत आहे',
    of: 'चे',
    locations: 'ठिकाणे',
    language: 'भाषा',
    phone: 'फोन',
    address: 'पत्ता',
    description: 'वर्णन',
    
    // Categories in CSV
    restaurant: 'रेस्टॉरंट',
    familyRestaurant: 'कौटुंबिक रेस्टॉरंट',
    fastFoodRestaurant: 'फास्ट फूड रेस्टॉरंट',
    dhaba: 'ढाबा',
    hotel: 'हॉटेल',
    guestHouse: 'गेस्ट हाऊस',
    homestay: 'होमस्टे',
    temple: 'मंदिर',
    shoppingMall: 'शॉपिंग मॉल',
    lodging: 'लॉजिंग',
    other: 'इतर',
    
    // Common UI
    close: 'बंद करा',
    back: 'मागे',
    next: 'पुढे',
    search: 'शोधा',
    filter: 'फिल्टर',
    sort: 'क्रमवारी लावा',
    viewDetails: 'तपशील पहा',
    contactInfo: 'संपर्क माहिती',
    ratings: 'रेटिंग',
    availability: 'उपलब्धता',
    
    // Card/Popup specific
    location: 'ठिकाण',
    details: 'तपशील',
    about: 'बद्दल',
    facilities: 'सुविधा',
    timing: 'वेळ',
    price: 'किंमत',
    booking: 'बुकिंग',
    reviews: 'पुनरावलोकन',
    photos: 'फोटो',
    website: 'वेबसाइट',
    directions: 'दिशा',
    share: 'शेअर करा',
    favorite: 'आवडते',
    openNow: 'आता उघडे',
    closed: 'बंद',
    hotelStars: 'स्टार रेटिंग',
    capacity: 'क्षमता',
    currentStatus: 'सद्याची स्थिती'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
  translateCategory: (category: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = translations[language];
  
  // Function to translate category names from CSV
  const translateCategory = (category: string): string => {
    const categoryMap: Record<string, keyof typeof translations.en> = {
      'Restaurant': 'restaurant',
      'Family restaurant': 'familyRestaurant',
      'Fast food restaurant': 'fastFoodRestaurant',
      'Dhaba': 'dhaba',
      'Hotel': 'hotel',
      'Guest house': 'guestHouse',
      'Homestay': 'homestay',
      'Temple': 'temple',
      'Shopping mall': 'shoppingMall',
      'Lodging': 'lodging'
    };
    
    const key = categoryMap[category];
    return key ? t[key] : t.other;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
