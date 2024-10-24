import { Property } from '../types';

interface SearchCriteria {
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  location: string[];
  propertyType?: string[];
  amenities?: string[];
}

export const matchPropertiesToCriteria = (
  properties: Property[],
  criteria: SearchCriteria
): Property[] => {
  return properties.filter(property => {
    // Price matching
    if (criteria.minPrice && property.price < criteria.minPrice) return false;
    if (criteria.maxPrice && property.price > criteria.maxPrice) return false;

    // Rooms matching
    if (criteria.minRooms && property.rooms < criteria.minRooms) return false;
    if (criteria.maxRooms && property.rooms > criteria.maxRooms) return false;

    // Location matching - check if property location is in desired locations
    if (!criteria.location.some(loc => 
      property.location.toLowerCase().includes(loc.toLowerCase()))) {
      return false;
    }

    // Property type matching
    if (criteria.propertyType && 
        !criteria.propertyType.includes(property.type)) {
      return false;
    }

    // Amenities matching
    if (criteria.amenities) {
      const hasAllAmenities = criteria.amenities.every(amenity =>
        property.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });
};

export const calculateMatchScore = (
  property: Property,
  criteria: SearchCriteria
): number => {
  let score = 0;
  const weights = {
    price: 0.3,
    location: 0.3,
    rooms: 0.2,
    propertyType: 0.1,
    amenities: 0.1,
  };

  // Price score
  if (criteria.maxPrice && criteria.minPrice) {
    const priceRange = criteria.maxPrice - criteria.minPrice;
    const priceDiff = Math.abs(
      property.price - (criteria.minPrice + priceRange / 2)
    );
    score += weights.price * (1 - priceDiff / priceRange);
  }

  // Location score
  if (criteria.location.some(loc => 
    property.location.toLowerCase().includes(loc.toLowerCase()))) {
    score += weights.location;
  }

  // Rooms score
  if (criteria.maxRooms && criteria.minRooms) {
    const roomsRange = criteria.maxRooms - criteria.minRooms;
    const roomsDiff = Math.abs(
      property.rooms - (criteria.minRooms + roomsRange / 2)
    );
    score += weights.rooms * (1 - roomsDiff / roomsRange);
  }

  // Property type score
  if (criteria.propertyType?.includes(property.type)) {
    score += weights.propertyType;
  }

  // Amenities score
  if (criteria.amenities) {
    const matchingAmenities = criteria.amenities.filter(amenity =>
      property.amenities.includes(amenity)
    );
    score += weights.amenities * (matchingAmenities.length / criteria.amenities.length);
  }

  return Math.round(score * 100);
};

export const getSuggestedProperties = (
  properties: Property[],
  criteria: SearchCriteria,
  limit = 10
): Property[] => {
  const matchedProperties = matchPropertiesToCriteria(properties, criteria);
  
  // Calculate scores for all matched properties
  const scoredProperties = matchedProperties.map(property => ({
    ...property,
    matchScore: calculateMatchScore(property, criteria),
  }));

  // Sort by match score and return top suggestions
  return scoredProperties
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};
