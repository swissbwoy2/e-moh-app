import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { searchProperties } from '@/services/homegate';

interface SearchMandate {
  id: string;
  maxPrice: number;
  minRooms: number;
  location: string;
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

    // Get available properties
    const properties: Property[] = await searchProperties();

    // Match properties with mandates
    const matches = mandates.map(mandate => {
      const matchingProperties = properties.filter(property => {
        // Implement matching logic here based on mandate criteria
        const priceMatch = property.price <= (mandate.maxPrice || Infinity);
        const roomsMatch = property.rooms >= (mandate.minRooms || 0);
        const locationMatch = !mandate.location || property.location.toLowerCase().includes(mandate.location.toLowerCase());

        return priceMatch && roomsMatch && locationMatch;
      });

      return {
        mandateId: mandate.id,
        properties: matchingProperties
      };
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error in matches route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}