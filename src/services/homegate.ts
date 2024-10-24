// Mock service until we can set up the proper scraper
export const searchProperties = async () => {
  return [
    {
      id: '1',
      title: 'Modern Apartment in City Center',
      description: 'Bright and spacious apartment in the heart of the city',
      price: 2500,
      location: 'Zurich',
      images: ['https://picsum.photos/400/300'],
      area: 80,
      rooms: 3.5,
      available: true
    },
    {
      id: '2',
      title: 'Luxury Villa with Lake View',
      description: 'Stunning villa with panoramic views of Lake Geneva',
      price: 5000,
      location: 'Geneva',
      images: ['https://picsum.photos/400/300'],
      area: 200,
      rooms: 5,
      available: true
    }
  ];
};