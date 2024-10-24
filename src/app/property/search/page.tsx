'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PropertyList from '@/components/property/PropertyList';
import PropertyFilters from '@/components/property/PropertyFilters';
import { searchProperties } from '@/services/homegate';
import { Property } from '@/types';

interface SearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  propertyType?: string;
}

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchProperties();
      
      // Filter results based on search criteria
      const filteredResults = results.filter(property => {
        const matchLocation = !filters.location || 
          property.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchMinPrice = !filters.minPrice || property.price >= filters.minPrice;
        const matchMaxPrice = !filters.maxPrice || property.price <= filters.maxPrice;
        const matchRooms = !filters.minRooms || property.rooms >= filters.minRooms;
        const matchType = !filters.propertyType || 
          property.type === filters.propertyType;

        return matchLocation && matchMinPrice && matchMaxPrice && 
               matchRooms && matchType;
      });

      setProperties(filteredResults);
    } catch (err) {
      console.error('Error searching properties:', err);
      setError('Failed to search properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Search Properties
          </h1>
          
          <div className="mt-6">
            <PropertyFilters onSearch={handleSearch} />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              </div>
            ) : (
              <PropertyList properties={properties} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}