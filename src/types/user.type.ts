export type Role = 'tenant' | 'admin';
export type MaritalStatus = 'single' | 'married';
export type StayStatus = 'active' | 'inactive';

export type User = {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  role: Role;
  maritalStatus?: MaritalStatus;
  profile?: UserProfile;
  document?: UserDocuments;
  currentStay?: UserCurrentStay;
  verified?: UserVerified;
};

export type UserProfile = {
  avatarUrl?: string | null;
  joinedAt: string;
};

export type UserDocuments = {
  ktpUrl?: string | null;
  marriageUrl?: string | null;
};

export type UserCurrentStay = {
  roomNumber: string;
  propertyName: string;
  status: StayStatus;
};

export type UserVerified = {
  isProfileVerified: boolean;
  isKtpVerified: boolean;
  isMarriageVerified: boolean;
};
