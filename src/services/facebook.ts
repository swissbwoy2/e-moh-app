import axios from 'axios';
import { Property } from '@/types';

const FACEBOOK_API_URL = 'https://graph.facebook.com/v18.0';
const FACEBOOK_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;

interface FacebookSearchParams {
  location?: string;
  maxPrice?: number;
  minPrice?: number;
  propertyType?: string;
  limit?: number;
}

interface FacebookProperty {
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
  rooms?: number;
  surface?: number;
  images: string[];
  created_time: string;
  updated_time: string;
}

const facebookAxios = axios.create({
  baseURL: FACEBOOK_API_URL,
  params: {
    access_token: FACEBOOK_ACCESS_TOKEN
  }
});

export const searchMarketplaceListings = async (params: FacebookSearchParams): Promise<Property[]> => {
  try {
    const response = await facebookAxios.get('/marketplace_search', {
      params: {
        q: params.location,
        category: 'property_for_sale',
        price_max: params.maxPrice,
        price_min: params.minPrice,
        property_type: params.propertyType,
        limit: params.limit || 20
      }
    });

    return response.data.data.map((item: FacebookProperty) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      location: `${item.location.address}, ${item.location.zip} ${item.location.city}`,
      type: item.property_type,
      rooms: item.rooms || 0,
      surface: item.surface || 0,
      amenities: [], // Facebook API doesn't provide amenities
      images: item.images,
      source: 'facebook',
      sourceId: item.id,
      createdAt: new Date(item.created_time),
      updatedAt: new Date(item.updated_time),
      available: true
    }));
  } catch (error) {
    console.error('Error fetching properties from Facebook:', error);
    throw error;
  }
};

export const getMarketplaceListing = async (listingId: string): Promise<Property> => {
  try {
    const response = await facebookAxios.get(`/${listingId}`);
    const item: FacebookProperty = response.data;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      location: `${item.location.address}, ${item.location.zip} ${item.location.city}`,
      type: item.property_type,
      rooms: item.rooms || 0,
      surface: item.surface || 0,
      amenities: [],
      images: item.images,
      source: 'facebook',
      sourceId: item.id,
      createdAt: new Date(item.created_time),
      updatedAt: new Date(item.updated_time),
      available: true
    };
  } catch (error) {
    console.error('Error fetching marketplace listing:', error);
    throw error;
  }
};
