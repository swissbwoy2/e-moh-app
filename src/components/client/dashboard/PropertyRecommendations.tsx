import { useEffect, useState } from 'react';
import { getTopMatches, generateMatchingSummary } from '@/lib/propertyMatching';
import type { Property } from '@/types';
import type { SearchMandate } from '@/types/search-mandate';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface PropertyRecommendationsProps {
  userId: string;
}

export function PropertyRecommendations({ userId }: PropertyRecommendationsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchMandate, setSearchMandate] = useState<SearchMandate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's search mandate
        const mandateQuery = query(
          collection(db, 'search-mandates'),
          where('userId', '==', userId)
        );
        const mandateSnapshot = await getDocs(mandateQuery);
        if (!mandateSnapshot.empty) {
          setSearchMandate(mandateSnapshot.docs[0].data() as SearchMandate);
        }

        // Fetch properties from your database
        const propertiesSnapshot = await getDocs(collection(db, 'properties'));
        const propertiesData = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];
        setProperties(propertiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!searchMandate) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Pas de critères de recherche</h3>
        <p className="mt-1 text-sm text-gray-500">
          Veuillez remplir votre mandat de recherche pour recevoir des recommandations personnalisées.
        </p>
      </div>
    );
  }

  const topMatches = getTopMatches(properties, searchMandate, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Propriétés Recommandées
      </h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topMatches.map(({ property, score, matchDetails }) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
          >
            {property.images?.[0] && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {property.title}
              </h3>
              
              <div className="space-y-2">
                <p className="text-gray-600">
                  {property.location} • {property.rooms} pièces
                </p>
                <p className="text-xl font-bold text-gray-900">
                  CHF {property.price.toLocaleString()}
                </p>
                
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${score * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {Math.round(score * 100)}% match
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  {generateMatchingSummary({ property, score, matchDetails })}
                </p>

                <button
                  onClick={() => {/* TODO: Implement property details navigation */}}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Voir les détails
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {topMatches.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Aucune propriété ne correspond à vos critères pour le moment.
            Nous vous notifierons dès que de nouvelles propriétés seront disponibles.
          </p>
        </div>
      )}
    </div>
  );
}