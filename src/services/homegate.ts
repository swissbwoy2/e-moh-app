import type { Property } from '@/types';
import { mockHomegateAPI } from './homegate-mock';

export const searchHomegate = async (
  query: string,
  location: string,
  minPrice?: number,
  maxPrice?: number,
  minRooms?: number,
  maxRooms?: number,
  propertyType?: string
): Promise<Property[]> => {
  // In a real implementation, this would call the Homegate API
  // For now, we'll return mock data
  const mockResults = await mockHomegateAPI();
  return mockResults.map(result => ({
    id: result.id,
    title: result.title,
    description: result.description,
    price: result.price,
    location: result.location,
    type: result.type,
    rooms: result.rooms,
    surface: result.surface,
    amenities: [
      'balcony', 'parking'
    ],
    images: ['https://picsum.photos/400/300'],
    source: 'flatfox' as const, // Changed from 'homegate' to match the allowed types
    sourceId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    available: true
  }));
};