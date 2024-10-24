interface MockProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  rooms: number;
  surface: number;
}

export async function mockHomegateAPI(): Promise<MockProperty[]> {
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
    }
  ];
}