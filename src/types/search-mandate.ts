export interface SearchMandate {
  // Personal Information
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate: Date;
  nationality: string;
  residencePermit: 'B' | 'C' | 'F' | 'N' | 'Swiss' | null;
  maritalStatus: string;
  
  // Current Housing
  currentPropertyManager: string;
  propertyManagerContact: string;
  currentRent: number;
  livingAtCurrentAddressSince: Date;
  currentRooms: number;
  
  // Financial Information
  extraordinaryCharges: boolean;
  chargesDetails?: string;
  hasProsecution: boolean;
  hasGuardianship: boolean;
  reasonForMoving: string;
  profession: string;
  employer: string;
  monthlyIncome: number;
  employmentStartDate: Date;
  
  // Property Usage
  usageType: 'Professional' | 'Primary' | 'Secondary';
  hasAnimals: boolean;
  playsInstrument: boolean;
  hasVehicles: boolean;
  vehiclePlates?: string;
  
  // Discovery Source
  discoverySource: 'Recommendation' | 'Internet' | 'Advertising' | 'Network' | 'Newspapers';
  
  // Search Criteria
  occupants: number;
  propertyType: 'Villa' | 'Apartment' | 'Colocation' | 'Sublease' | 'Commercial' | 'Other';
  rooms: '1+' | '2+' | '3+' | '4+' | '5+' | 'Other';
  region: string[];
  maxBudget: number;
  specialRequirements?: string;
  
  // Documents
  prosecutionRecord?: string; // URL to uploaded file
  payslips: string[]; // URLs to last 3 payslips
  identityDocument: string; // URL to ID or residence permit
  signature: string; // URL to signature image or data
  additionalDocuments?: string[]; // URLs to any additional documents
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  stripeSubscriptionId?: string;
  activationDate?: Date;
  expiryDate?: Date;
  
  // Terms Acceptance
  termsAccepted: boolean;
  termsAcceptanceDate: Date;
}