import React, { useState } from 'react';
import { SearchCriteria } from '@/types';

interface PropertySearchProps {
  onSearch: (criteria: Partial<SearchCriteria>) => void;
  initialCriteria?: Partial<SearchCriteria>;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  onSearch,
  initialCriteria = {}
}) => {
  const [criteria, setCriteria] = useState<Partial<SearchCriteria>>({
    location: [],
    minPrice: undefined,
    maxPrice: undefined,
    minRooms: undefined,
    maxRooms: undefined,
    propertyType: [],
    amenities: [],
    ...initialCriteria
  });

  const locationOptions = [
    'Zürich',
    'Geneva',
    'Basel',
    'Lausanne',
    'Bern',
    'Lucerne',
    'St. Gallen',
    'Lugano'
  ];

  const propertyTypes = [
    'Apartment',
    'House',
    'Studio',
    'Loft',
    'Duplex',
    'Villa'
  ];

  const amenities = [
    'Parking',
    'Balcony',
    'Garden',
    'Elevator',
    'Storage',
    'Pet Friendly',
    'Furnished',
    'Dishwasher',
    'Laundry'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <select
          multiple
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={criteria.location}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, (option) => option.value);
            setCriteria({ ...criteria, location: options });
          }}
        >
          {locationOptions.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Price (CHF)</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={criteria.minPrice || ''}
            onChange={(e) =>
              setCriteria({ ...criteria, minPrice: Number(e.target.value) || undefined })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Price (CHF)</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={criteria.maxPrice || ''}
            onChange={(e) =>
              setCriteria({ ...criteria, maxPrice: Number(e.target.value) || undefined })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Rooms</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={criteria.minRooms || ''}
            onChange={(e) =>
              setCriteria({ ...criteria, minRooms: Number(e.target.value) || undefined })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Rooms</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={criteria.maxRooms || ''}
            onChange={(e) =>
              setCriteria({ ...criteria, maxRooms: Number(e.target.value) || undefined })
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Property Type</label>
        <select
          multiple
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={criteria.propertyType}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, (option) => option.value);
            setCriteria({ ...criteria, propertyType: options });
          }}
        >
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amenities</label>
        <select
          multiple
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={criteria.amenities}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, (option) => option.value);
            setCriteria({ ...criteria, amenities: options });
          }}
        >
          {amenities.map((amenity) => (
            <option key={amenity} value={amenity}>
              {amenity}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Search Properties
        </button>
      </div>
    </form>
  );
};