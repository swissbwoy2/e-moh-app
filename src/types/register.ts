export interface RegisterFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate: string;
  nationality: string;
  residencePermit: 'B' | 'C' | 'F' | 'N' | 'SWISS' | 'OTHER';
  civilStatus: string;
  currentAgency: string;
  agencyContact: string;
  currentRent: number;
  rentSince: string;
  currentRooms: number;
  hasExtraCharges: boolean;
  extraChargesDetails?: string;
  hasProsecution: boolean;
  hasGuardianship: boolean;
  moveReason: string;
  profession: string;
  employer: string;
  monthlyIncome: number;
  employmentDate: string;
  usageType: 'PROFESSIONAL' | 'MAIN' | 'SECONDARY';
  hasAnimals: boolean;
  playsInstrument: boolean;
  hasVehicles: boolean;
  vehiclePlates?: string;
  discoverySource: 'RECOMMENDATION' | 'INTERNET' | 'ADVERTISING' | 'NETWORK' | 'NEWSPAPER';
  occupantsCount: number;
  propertyType: 'HOUSE' | 'APARTMENT' | 'COLOCATION' | 'SUBLET' | 'COMMERCIAL' | 'OTHER';
  roomsCount: '1+' | '2+' | '3+' | '4+' | '5+' | 'OTHER';
  region: string;
  maxBudget: number;
  specificRequirements?: string;
  termsAccepted: boolean;
  documents: File[];
}
