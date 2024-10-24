import type { Property } from '@/types';

// Mock service until we can set up the proper scraper
export const searchProperties = async (): Promise<Property[]> => {
  return [
    {
      id: '1',
      title: 'Modern Apartment in City Center',
      description: 'Bright and spacious apartment in the heart of the city',
      price: 2500,
      location: 'Zurich',
      type: 'apartment',
      rooms: 3.5,
      surface: 80,
      amenities: [
        'Elevator',
        'Balcony',
        'Parking',
        'Central Heating'
      ],
      images: ['https://picsum.photos/400/300'],
      source: 'homegate',
      sourceId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      available: true
    },
    {
      id: '2',
      title: 'Luxury Villa with Lake View',
      description: 'Stunning villa with panoramic views of Lake Geneva',
      price: 5000,
      location: 'Geneva',
      type: 'house',
      rooms: 5,
      surface: 200,
      amenities: [
        'Garden',
        'Pool',
        'Garage',
        'Lake View'
      ],
      images: ['https://picsum.photos/400/300'],
      source: 'homegate',
      sourceId: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
      available: true
    }
  ];
};