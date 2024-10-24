import React from 'react';
import Image from 'next/image';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  matchScore?: number;
  onScheduleVisit?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  matchScore,
  onScheduleVisit
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-48">
        <Image
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.title}
          fill
          className="object-cover"
        />
        {matchScore && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full">
            {matchScore}% Match
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-blue-600">
            CHF {property.price.toLocaleString()}
          </span>
          <span className="text-gray-600">
            {property.rooms} rooms • {property.surface}m²
          </span>
        </div>
        
        <p className="text-gray-600 mb-2">{property.location}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-gray-500 text-sm">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Listed {new Date(property.createdAt).toLocaleDateString()}
          </span>
          {onScheduleVisit && (
            <button
              onClick={onScheduleVisit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Schedule Visit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};