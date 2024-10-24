'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types';

interface PropertyListProps {
  properties: Property[];
}

export default function PropertyList({ properties }: PropertyListProps) {
  if (!properties.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No properties found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <Link
          href={`/property/${property.id}`}
          key={property.id}
          className="group"
        >
          <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="relative h-48 w-full">
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                {property.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {property.location}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  CHF {property.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">
                  {property.rooms} rooms
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}