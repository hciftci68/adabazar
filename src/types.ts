export interface Category {
  id: string;
  parentId: string | null;
  nameTr: string;
  nameEn: string;
  slug: string;
  icon: string;
  maxImages: number; // Max images allowed for this specific category
  attributes?: DynamicAttribute[];
}

export interface DynamicAttribute {
  key: string;
  label_tr: string;
  label_en: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  required: boolean;
  options?: string[]; // choices for select
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  district?: string;
  country?: string;
}

export interface Listing {
  id: string;
  userId?: string; // ID of the advertisement owner
  title: string;
  description: string;
  categoryId: string;
  price: number;
  currency?: string; // e.g. "TL", "USD", "GBP"
  location: Location;
  images: string[];
  featured: boolean; // Doping / Sponsor status
  createdAt: string;
  tags: string[];
  attributes: Record<string, any>; // values of dynamic attributes
  status?: "pending" | "approved" | "rejected";
}

export enum UserStatus {
  Unverified = "Unverified",
  Email_Verified = "Email_Verified",
  Fully_Verified = "Fully_Verified" // Email and Phone SMS Verified
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  status: UserStatus;
  role?: "user" | "adv owner" | "admin";
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  oneSignalPlayerId: string | null;
  oneSignalExternalId: string | null;
  password?: string;
  address?: string;
  country?: string;
  city?: string;
  district?: string;
}

export interface Language {
  code: 'tr' | 'en';
  label: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  owner: string;
  imageUrl: string;
  link: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  metadata?: string;
  createdAt: string;
}

export interface AdClickLog {
  id: string;
  adId: string;
  adTitle: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  clickedAt: string;
  userAgent: string;
}

