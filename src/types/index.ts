export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'fr' | 'de' | 'it';
  visitsReminders: boolean;
  messagesDigest: 'instant' | 'daily' | 'weekly';
  documentsExpiration: boolean;
  propertyAlerts: boolean;
  twoFactorAuth: boolean;
  automaticMatching?: boolean;
  matchingFrequency?: 'Immediately' | 'Daily' | 'Weekly';
  workingDays?: 'Monday-Friday' | 'Monday-Saturday' | 'All Week';
  autoResponder?: boolean;
  automaticApproval?: boolean;
  agentAssignmentMethod?: 'Round Robin' | 'Load Balanced' | 'Manual';
}

export interface User {
  id: string;
  uid: string;
  email: string;
  role: 'admin' | 'agent' | 'client';
  displayName?: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  lastLogin: Date;
  subscriptionStatus?: 'active' | 'expired' | 'none';
  subscriptionEndDate?: Date;
  settings?: UserSettings;
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

export interface PropertyMatch {
  propertyId: string;
  userId: string;
  score: number;
  matchReasons: string[];
  status: 'pending' | 'viewed' | 'liked' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyStats {
  totalViews: number;
  uniqueViews: number;
  favoriteCount: number;
  inquiryCount: number;
  visitRequestCount: number;
  lastUpdated: Date;
}

export interface AgentStats {
  activeClients: number;
  totalVisits: number;
  completedVisits: number;
  successfulMatches: number;
  responseRate: number;
  averageResponseTime: number;
  clientSatisfactionScore: number;
  lastUpdated: Date;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxClientsPerAgent: number;
  visitTimeSlotDuration: number;
  propertyMatchingThreshold: number;
  documentExpirationWarningDays: number;
  subscriptionPeriodDays: number;
  systemAnnouncement?: {
    title: string;
    message: string;
    startDate: Date;
    endDate: Date;
    severity: 'info' | 'warning' | 'critical';
  };
}
