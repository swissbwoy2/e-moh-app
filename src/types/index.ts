export interface User {
  id: string;
  uid: string;
  email: string;
  role: 'admin' | 'agent' | 'client';
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
  subscriptionStatus?: 'active' | 'expired' | 'none';
  subscriptionEndDate?: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  rooms: number;
  surface: number;
  amenities: string[];
  images: string[];
  source: 'flatfox' | 'facebook' | 'manual';
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
  available: boolean;
}

export interface Visit {
  id: string;
  propertyId: string;
  clientId: string;
  agentId: string;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

export interface Document {
  id: string;
  userId: string;
  type: 'salary' | 'id' | 'permit' | 'debt' | 'residence' | 'employment' | 'insurance';
  status: 'pending' | 'approved' | 'rejected';
  url: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  validUntil?: Date;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'visit' | 'document' | 'match' | 'system';
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

export interface SearchCriteria {
  userId: string;
  location: string[];
  minPrice?: number;
  maxPrice: number;
  minRooms?: number;
  maxRooms?: number;
  propertyType?: string[];
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}
