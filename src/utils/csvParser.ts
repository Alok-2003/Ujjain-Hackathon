export interface LocationData {
  id: string;
  website?: string;
  hotelStars?: string;
  city: string;
  state: string;
  postalCode?: string;
  description?: string;
  lat: number;
  lng: number;
  categoryName: string;
  title: string;
  address: string;
  hotelDescription?: string;
  phone?: string;
  imageUrl?: string;
  url?: string;
  imagesCount?: string;
}

export const parseCSV = async (csvPath: string): Promise<LocationData[]> => {
  try {
    const response = await fetch(csvPath);
    const csvText = await response.text();
    
    console.log('CSV loaded, first 500 chars:', csvText.substring(0, 500));
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('Total lines:', lines.length);
    
    // Parse headers more carefully
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(header => header.replace(/"/g, '').trim());
    console.log('Headers:', headers);
    
    const latIndex = headers.indexOf('location/lat');
    const lngIndex = headers.indexOf('location/lng');
    const categoryIndex = headers.indexOf('categoryName');
    const titleIndex = headers.indexOf('title');
    
    console.log('Column indices - lat:', latIndex, 'lng:', lngIndex, 'category:', categoryIndex, 'title:', titleIndex);
    
    const data: LocationData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Parse CSV line - handle quoted values properly
      const values = parseCSVLine(line);
      
      if (values.length >= headers.length && latIndex >= 0 && lngIndex >= 0) {
        const latStr = values[latIndex] || '';
        const lngStr = values[lngIndex] || '';
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        
        // Debug first few entries
        if (i <= 3) {
          console.log(`Row ${i}: lat='${latStr}' (${lat}), lng='${lngStr}' (${lng})`);
        }
        
        // Only include items with valid coordinates
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          const item: LocationData = {
            id: `location-${i}`,
            website: values[headers.indexOf('website')] || '',
            hotelStars: values[headers.indexOf('hotelStars')] || '',
            city: values[headers.indexOf('city')] || '',
            state: values[headers.indexOf('state')] || '',
            postalCode: values[headers.indexOf('postalCode')] || '',
            description: values[headers.indexOf('description')] || '',
            lat,
            lng,
            categoryName: values[categoryIndex] || 'Other',
            title: values[titleIndex] || 'Unknown Location',
            address: values[headers.indexOf('address')] || '',
            hotelDescription: values[headers.indexOf('hotelDescription')] || '',
            phone: values[headers.indexOf('phone')] || '',
            imageUrl: values[headers.indexOf('imageUrl')] || '',
            url: values[headers.indexOf('url')] || '',
            imagesCount: values[headers.indexOf('imagesCount')] || ''
          };
          
          data.push(item);
        }
      }
    }
    
    console.log('Parsed data points:', data.length);
    if (data.length > 0) {
      console.log('Sample data point:', data[0]);
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Start or end of quoted section
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  values.push(current.trim());
  
  return values;
};

export const getCategoryColors = (category: string): string => {
  const colors: Record<string, string> = {
    'Restaurant': '#ef4444',
    'Family restaurant': '#f97316',
    'Fast food restaurant': '#f59e0b',
    'Dhaba': '#eab308',
    'Hotel': '#8b5cf6',
    'Guest house': '#a855f7',
    'Homestay': '#3b82f6',
    'Temple': '#dc2626',
    'Shopping mall': '#10b981',
    'Lodging': '#06b6d4',
    'Other': '#6b7280'
  };
  
  return colors[category] || colors['Other'];
};
