import React, { useState, useEffect } from 'react';
import { Property, Visit, User, SearchCriteria } from '@/types';
import PropertyList from '@/components/property/PropertyList';
import { PropertySearch } from '@/components/property/PropertySearch';
import { searchProperties } from '@/services/flatfox';
import { useVisits } from '@/hooks/useVisits';
import FilterBar from '@/components/shared/FilterBar';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<Partial<SearchCriteria> | null>(null);

  const { visits, loading: visitsLoading } = useVisits(user?.id || '', 'client');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const props = await searchProperties({
          location: searchCriteria?.location?.[0],
          priceMin: searchCriteria?.minPrice,
          priceMax: searchCriteria?.maxPrice,
          rooms: searchCriteria?.minRooms,
          propertyType: searchCriteria?.propertyType?.[0],
        });
        setProperties(props);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchCriteria]);

  const handleSearch = (criteria: Partial<SearchCriteria>) => {
    setSearchCriteria(criteria);
  };

  if (loading || visitsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Search Properties</h2>
        <PropertySearch onSearch={handleSearch} />
      </section>

      {/* Filter Section */}
      <section className="mb-8">
        <FilterBar
          total={properties.length}
          onFilter={() => {/* Implement filter logic */}}
          filters={[
            { label: 'Price', options: ['Low to High', 'High to Low'] },
            { label: 'Rooms', options: ['1+', '2+', '3+', '4+'] },
            { label: 'Type', options: ['Apartment', 'House', 'Studio'] },
          ]}
        />
      </section>

      {/* Properties List */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Available Properties</h2>
        <PropertyList properties={properties} />
      </section>

      {/* Upcoming Visits */}
      {visits.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Your Upcoming Visits</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visits.slice(0, 3).map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="text-sm text-gray-500">
                  {new Date(visit.date).toLocaleDateString()}
                </div>
                <div className="font-medium mt-1">
                  Property Visit
                </div>
                <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  visit.status === 'scheduled'
                    ? 'bg-green-100 text-green-800'
                    : visit.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
          {visits.length > 3 && (
            <div className="mt-4">
              <a
                href="/visits"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all visits ({visits.length})
              </a>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
