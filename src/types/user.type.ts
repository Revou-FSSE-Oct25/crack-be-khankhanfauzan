export type Role = 'tenant' | 'admin';
export type MaritalStatus = 'single' | 'married';
export type StayStatus = 'active' | 'inactive';

export type User = {
  id: string;
  email: string;
  role: Role;
  profile: UserProfile;
  document: UserDocuments;
  currentStay?: UserCurrentStay;
  verified: UserVerified;
};

export type UserProfile = {
  fullName: string;
  whatsappNumber: string;
  maritalStatus: MaritalStatus | null;
  joinedAt?: string;
};

export type UserDocuments = {
  fotoProfileUrl: string | null;
  fotoKtpUrl: string | null;
  fotoBukuNikahUrl: string | null;
};

export type UserCurrentStay = {
  roomNumber: string;
  propertyName: string;
  status: StayStatus;
};

export type UserVerified = {
  isEmailVerified: boolean;
  isProfileVerified: boolean;
  isKtpVerified: boolean;
  isMarriageVerified: boolean;
};
