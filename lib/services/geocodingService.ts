// lib/services/geocodingService.ts

export type GeocodeResult = {
    displayName: string;
    latitude: number;
    longitude: number;
  };
  
  const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  
  const HEADERS = {
    'User-Agent': 'OnTimeApp/1.0',
  };
  
  export async function searchAddress(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 3) return [];
  
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: '5',
      addressdetails: '0',
    });
  
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: HEADERS,
    });
  
    if (!response.ok) {
      throw new Error('Impossible de rechercher cette adresse');
    }
  
    const data = await response.json();
  
    return data.map((item: any) => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  }