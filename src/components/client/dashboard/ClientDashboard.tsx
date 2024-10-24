import React, { useState, useEffect } from 'react';
import { Property, Visit, User, SearchCriteria } from '@/types';
import { PropertyList } from '@/components/property/PropertyList';
import { PropertySearch } from '@/components/property/PropertySearch';
import { searchProperties } from '@/services/flatfox';
import { useVisits } from '@/hooks/useVisits';
import { matchPropertiesToCriteria, calculateMatchScore } from '@/services/matching';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<Partial<SearchCriteria>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { visits, loading: visitsLoading } = useVisits(user.id, 'client');

  const fetchProperties = async (criteria: Partial<SearchCriteria>) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch properties from Flatfox API
      const flatfoxProperties = await searchProperties({
        location: criteria.location?.[0],
        priceMin: criteria.minPrice,
        priceMax: criteria.maxPrice,
        rooms: criteria.minRooms,
        propertyType: criteria.propertyType?.[0],
      });

      // Match and score properties based on criteria
      const matchedProperties = matchPropertiesToCriteria(flatfoxProperties, criteria as SearchCriteria);
      const scoredProperties = matchedProperties.map(property => ({
        ...property,
        matchScore: calculateMatchScore(property, criteria as SearchCriteria),
      }));

      // Sort by match score
      scoredProperties.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setProperties(scoredProperties);
    } catch (err: any) {
      setError(err.message || 'Error fetching properties');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (criteria: Partial<SearchCriteria>) => {
    setSearchCriteria(criteria);
    fetchProperties(criteria);
  };

  // Initial fetch with empty criteria
  useEffect(() => {
    fetchProperties({});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar - Search filters */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Search Properties</h2>
          <PropertySearch onSearch={handleSearch} initialCriteria={searchCriteria} />
        </div>

        {/* Main content - Property listings */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Matching Properties</h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading properties...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <PropertyList
                properties={properties}
                showMatchScore={true}
                userId={user.id}
                userRole="client"
              />
            )}
          </div>

          {/* Upcoming Visits */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Visits</h2>
            {visitsLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading visits...</p>
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming visits scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((visit: Visit) => (
                  <div
                    key={visit.id}
                    className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">Visit on {new Date(visit.date).toLocaleDateString()}</p>
                      <p className="text-gray-500">Status: {visit.status}</p>
                    </div>
                    {visit.notes && (
                      <div className="text-sm text-gray-600">
                        Notes: {visit.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
