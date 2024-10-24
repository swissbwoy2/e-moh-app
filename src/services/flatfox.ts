import axios from 'axios';
import { Property } from '../types';

const FLATFOX_API_KEY = 'api_4x6Y20yEoTXPa18ag8ds5Dh7i0EzTShF';
const FLATFOX_API_URL = 'https://api.flatfox.ch/v1';

interface FlatfoxSearchParams {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rooms?: number;
  propertyType?: string;
  page?: number;
  limit?: number;
}

interface FlatfoxProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    zip: string;
  };
  property_type: string;
  rooms: number;
  living_space: number;
  features: string[];
  images: { url: string }[];
  created_at: string;
  updated_at: string;
  status: string;
}

const flatfoxAxios = axios.create({
  baseURL: FLATFOX_API_URL,
  headers: {
    'Authorization': `Bearer ${FLATFOX_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const searchProperties = async (params: FlatfoxSearchParams): Promise<Property[]> => {
  try {
    const response = await flatfoxAxios.get('/properties', {
      params: {
        location: params.location,
        price_min: params.priceMin,
        price_max: params.priceMax,
        rooms: params.rooms,
        property_type: params.propertyType,
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });

    return response.data.items.map((item: FlatfoxProperty) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      location: `${item.location.address}, ${item.location.zip} ${item.location.city}`,
      type: item.property_type,
      rooms: item.rooms,
      surface: item.living_space,
      amenities: item.features,
      images: item.images.map(img => img.url),
      source: 'flatfox',
      sourceId: item.id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      available: item.status === 'active',
    }));
  } catch (error) {
    console.error('Error fetching properties from Flatfox:', error);
    throw error;
  }
};

export const getPropertyById = async (propertyId: string): Promise<Property> => {
  try {
    const response = await flatfoxAxios.get(`/properties/${propertyId}`);
    const item: FlatfoxProperty = response.data;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      location: `${item.location.address}, ${item.location.zip} ${item.location.city}`,
      type: item.property_type,
      rooms: item.rooms,
      surface: item.living_space,
      amenities: item.features,
      images: item.images.map(img => img.url),
      source: 'flatfox',
      sourceId: item.id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      available: item.status === 'active',
    };
  } catch (error) {
    console.error('Error fetching property details from Flatfox:', error);
    throw error;
  }
};
