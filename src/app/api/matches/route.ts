import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { searchHomegate } from '@/services/homegate';

interface SearchMandate {
  id: string;
  maxPrice: number;
  minRooms: number;
  region: string[];
  [key: string]: any;
}

interface Property {
  price: number;
  rooms: number;
  location: string;
  [key: string]: any;
}

export async function GET() {
  try {
    // Get search mandates from Firestore
    const mandatesSnapshot = await getDocs(collection(db, 'searchMandates'));
    const mandates: SearchMandate[] = mandatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SearchMandate));

    // Get unique locations from all mandates
    const uniqueLocations = Array.from(new Set(mandates.flatMap(mandate => mandate.region)));
    
    // Create a promise for each unique location
    const propertyPromises = uniqueLocations.map(location => 
      searchHomegate('', location)
    );

    // Get available properties for all locations
    const propertiesArrays = await Promise.all(propertyPromises);
    const allProperties = propertiesArrays.flat();

    // Match properties with mandates
    const matches = mandates.map(mandate => {
      const matchingProperties = allProperties.filter(property => {
        // Implement matching logic here based on mandate criteria
        const priceMatch = property.price <= mandate.maxPrice;
        const roomsMatch = property.rooms >= mandate.minRooms;
        const locationMatch = mandate.region.some(region =>
          property.location.toLowerCase().includes(region.toLowerCase())
        );

        return priceMatch && roomsMatch && locationMatch;
      });

      return {
        mandateId: mandate.id,
        properties: matchingProperties.map(property => ({
          ...property,
          matchScore: calculateMatchScore(property, mandate)
        }))
      };
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error in matches route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateMatchScore(property: Property, mandate: SearchMandate): number {
  let score = 0;

  // Price match (0-40 points)
  const priceRatio = property.price / mandate.maxPrice;
  if (priceRatio <= 1) {
    score += 40 * (1 - priceRatio/2); // Better score for lower prices, but not too low
  }

  // Rooms match (0-30 points)
  const minRooms = mandate.minRooms;
  const roomsDiff = property.rooms - minRooms;
  if (roomsDiff >= 0) {
    score += 30 * (1 / (1 + roomsDiff)); // Perfect match gets full points, decreases with extra rooms
  }

  // Location match (0-30 points)
  const locationScore = mandate.region.some(region => 
    property.location.toLowerCase() === region.toLowerCase()
  ) ? 30 : 15; // Exact match gets full points, partial match gets half
  score += locationScore;

  return Math.min(100, score); // Cap at 100
}