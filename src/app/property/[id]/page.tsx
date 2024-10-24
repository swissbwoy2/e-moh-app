'use client';

import { Layout } from '@/components/layout/Layout';
import { Property } from '@/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getPropertyById } from '@/services/flatfox';
import { getMarketplaceListing } from '@/services/facebook';
import { searchHomegate } from '@/services/homegate';

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Fetch property details based on source
        const [source, sourceId] = params.id.split('-');
        let propertyData;

        switch (source) {
          case 'flatfox':
            propertyData = await getPropertyById(sourceId);
            break;
          case 'facebook':
            propertyData = await getMarketplaceListing(sourceId);
            break;
          case 'homegate':
            const properties = await searchHomegate('', '', undefined, undefined, undefined);
            propertyData = properties.find(p => p.id === sourceId);
            if (!propertyData) {
              throw new Error('Property not found');
            }
            break;
          default:
            throw new Error('Unknown property source');
        }

        setProperty(propertyData);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  const handleScheduleVisit = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: params.id,
          clientId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule visit');
      }

      // Show success message or redirect
    } catch (error) {
      console.error('Error scheduling visit:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 rounded-md p-4">
            <div className="text-red-700">
              {error || 'Property not found'}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col">
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src={selectedImage || property.images[0]}
                alt={property.title}
                fill
                className="object-cover object-center"
              />
            </div>

            {/* Image selector */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    selectedImage === image ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image}
                    alt={`View ${index + 1}`}
                    fill
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Property info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {property.title}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Property information</h2>
              <p className="text-3xl text-gray-900">CHF {property.price.toLocaleString()}</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{property.description}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <h4 className="text-sm text-gray-900 font-medium">Location:</h4>
                <p className="ml-2 text-sm text-gray-500">{property.location}</p>
              </div>

              <div className="mt-4 flex items-center">
                <h4 className="text-sm text-gray-900 font-medium">Rooms:</h4>
                <p className="ml-2 text-sm text-gray-500">{property.rooms}</p>
              </div>

              <div className="mt-4 flex items-center">
                <h4 className="text-sm text-gray-900 font-medium">Surface:</h4>
                <p className="ml-2 text-sm text-gray-500">{property.surface}m²</p>
              </div>

              {property.amenities.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm text-gray-900 font-medium">Amenities:</h4>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <li
                        key={index}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col space-y-4">
              <button
                type="button"
                onClick={handleScheduleVisit}
                className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
              >
                Schedule a Visit
              </button>

              <button
                type="button"
                onClick={() => {/* Handle contact agent */}}
                className="w-full bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
              >
                Contact Agent
              </button>
            </div>

            {/* Source information */}
            <div className="mt-8 text-sm text-gray-500">
              <p>
                Listed on {property.source.charAt(0).toUpperCase() + property.source.slice(1)}{' '}
                {new Date(property.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};