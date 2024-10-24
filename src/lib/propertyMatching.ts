import type { Property } from '@/types';
import type { SearchMandate } from '@/types/search-mandate';

interface PropertyScore {
  property: Property;
  score: number;
  matchDetails: {
    priceMatch: number;
    locationMatch: number;
    roomsMatch: number;
    amenitiesMatch: number;
  };
}

export function calculatePropertyScore(property: Property, searchMandate: SearchMandate): PropertyScore {
  // Initialize base score
  let score = 0;
  
  // Price matching (30% weight)
  const priceMatch = calculatePriceMatch(property.price, searchMandate.maxBudget);
  score += priceMatch * 0.3;
  
  // Location matching (30% weight)
  const locationMatch = calculateLocationMatch(property.location, searchMandate.region);
  score += locationMatch * 0.3;
  
  // Rooms matching (20% weight)
  const roomsMatch = calculateRoomsMatch(property.rooms, searchMandate.rooms);
  score += roomsMatch * 0.2;
  
  // Special requirements matching (20% weight)
  const amenitiesMatch = calculateSpecialMatch(property, searchMandate);
  score += amenitiesMatch * 0.2;

  return {
    property,
    score,
    matchDetails: {
      priceMatch,
      locationMatch,
      roomsMatch,
      amenitiesMatch
    }
  };
}

function calculatePriceMatch(propertyPrice: number, maxBudget: number): number {
  if (propertyPrice > maxBudget) {
    // Penalize properties over budget, but still consider them if close
    const overBudgetPercentage = (propertyPrice - maxBudget) / maxBudget;
    return Math.max(0, 1 - overBudgetPercentage);
  }
  
  // Reward properties under budget, but not too far under (might indicate lower quality)
  const priceRatio = propertyPrice / maxBudget;
  return priceRatio >= 0.8 ? 1 : 0.8;
}

function calculateLocationMatch(propertyLocation: string, preferredRegions: string[]): number {
  if (preferredRegions.includes(propertyLocation)) {
    return 1;
  }
  
  // Check if location is in the same general area as any preferred region
  for (const region of preferredRegions) {
    if (propertyLocation.includes(region) || region.includes(propertyLocation)) {
      return 0.8;
    }
  }
  
  // Location is not in preferred regions but might be nearby
  return 0.4;
}

function calculateRoomsMatch(propertyRooms: number, desiredRooms: string): number {
  // Convert desired rooms string to number (e.g., "3+" becomes 3)
  const minDesiredRooms = parseInt(desiredRooms);
  
  if (isNaN(minDesiredRooms)) {
    return 0.5; // Handle "Other" case
  }
  
  if (propertyRooms >= minDesiredRooms) {
    // Property has enough or more rooms
    const extraRooms = propertyRooms - minDesiredRooms;
    return extraRooms <= 1 ? 1 : 0.8; // Slightly penalize if too many extra rooms
  }
  
  // Property has fewer rooms than desired
  const difference = minDesiredRooms - propertyRooms;
  return difference <= 0.5 ? 0.7 : 0.3;
}

function calculateSpecialMatch(property: Property, mandate: SearchMandate): number {
  let score = 1;
  const requirements: string[] = [];
  
  // Add special requirements based on mandate
  if (mandate.hasAnimals) {
    requirements.push('pets_allowed');
  }
  if (mandate.playsInstrument) {
    requirements.push('sound_insulation');
  }
  if (mandate.hasVehicles) {
    requirements.push('parking');
  }
  if (mandate.specialRequirements) {
    // Parse special requirements and add relevant keywords
    const keywords = parseSpecialRequirements(mandate.specialRequirements);
    requirements.push(...keywords);
  }
  
  if (requirements.length === 0) {
    return 1; // No special requirements
  }
  
  // Check how many requirements are met
  const matchedRequirements = requirements.filter(req => 
    property.amenities.some(amenity => amenity.toLowerCase().includes(req.toLowerCase()))
  );
  
  return matchedRequirements.length / requirements.length;
}

function parseSpecialRequirements(requirements: string): string[] {
  // Common keywords to look for in special requirements
  const keywords = [
    'elevator', 'balcony', 'terrace', 'garden', 'storage',
    'washer', 'dryer', 'dishwasher', 'garage', 'parking',
    'wheelchair', 'accessible', 'furnished', 'unfurnished',
    'quiet', 'view', 'exposure', 'renovated', 'modern'
  ];
  
  return keywords.filter(keyword => 
    requirements.toLowerCase().includes(keyword.toLowerCase())
  );
}

export function rankProperties(properties: Property[], searchMandate: SearchMandate): PropertyScore[] {
  const scoredProperties = properties
    .map(property => calculatePropertyScore(property, searchMandate))
    .sort((a, b) => b.score - a.score);

  return scoredProperties;
}

export function getTopMatches(properties: Property[], searchMandate: SearchMandate, limit: number = 10): PropertyScore[] {
  const rankedProperties = rankProperties(properties, searchMandate);
  return rankedProperties.slice(0, limit);
}

export function generateMatchingSummary(propertyScore: PropertyScore): string {
  const { matchDetails } = propertyScore;
  const summary = [];

  if (matchDetails.priceMatch > 0.8) {
    summary.push("Prix idéal pour votre budget");
  } else if (matchDetails.priceMatch > 0.6) {
    summary.push("Prix raisonnable pour votre budget");
  }

  if (matchDetails.locationMatch > 0.8) {
    summary.push("Emplacement parfait");
  } else if (matchDetails.locationMatch > 0.6) {
    summary.push("Bon emplacement");
  }

  if (matchDetails.roomsMatch > 0.8) {
    summary.push("Nombre de pièces idéal");
  }

  if (matchDetails.amenitiesMatch > 0.8) {
    summary.push("Correspond à vos critères spécifiques");
  }

  return summary.join(" • ");
}