/**
 * Attraction Types
 * Type definitions for attraction/destination management
 */

import type { Prisma } from '@prisma/client';

// ==================== Base Types ====================

export interface Attraction {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  type: string | null;
  adultPrice: number;
  childPrice: number | null;
  currency: string;
  imageUrl: string | null;
  imageUrls: string[] | null;
  operatingHours: OperatingHours | null;
  capacity: number | null;
  durationMinutes: number | null;
  minAge: number | null;
  maxAge: number | null;
  isActive: boolean;
  priority: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  monday?: TimeSlot;
  tuesday?: TimeSlot;
  wednesday?: TimeSlot;
  thursday?: TimeSlot;
  friday?: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
  holidays?: TimeSlot;
  specialDates?: Record<string, TimeSlot>;
}

export interface TimeSlot {
  open: string; // Format: "HH:mm" (e.g., "09:00")
  close: string; // Format: "HH:mm" (e.g., "18:00")
  isClosed?: boolean;
  breaks?: Array<{ start: string; end: string }>;
}

// ==================== Request Types ====================

export interface CreateAttractionRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  type?: string;
  adultPrice: number;
  childPrice?: number;
  currency?: string;
  imageUrl?: string;
  imageUrls?: string[];
  operatingHours?: OperatingHours;
  capacity?: number;
  durationMinutes?: number;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateAttractionRequest {
  name?: string;
  description?: string;
  shortDescription?: string;
  type?: string;
  adultPrice?: number;
  childPrice?: number;
  currency?: string;
  imageUrl?: string;
  imageUrls?: string[];
  operatingHours?: OperatingHours;
  capacity?: number;
  durationMinutes?: number;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
  priority?: number;
}

export interface ListAttractionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ToggleStatusRequest {
  isActive: boolean;
}

// ==================== Response Types ====================

export interface AttractionResponse {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  type: string | null;
  adultPrice: string; // Decimal as string
  childPrice: string | null; // Decimal as string
  currency: string;
  imageUrl: string | null;
  imageUrls: string[] | null;
  operatingHours: OperatingHours | null;
  capacity: number | null;
  durationMinutes: number | null;
  minAge: number | null;
  maxAge: number | null;
  isActive: boolean;
  priority: number | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AttractionListResponse {
  attractions: AttractionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AttractionDetailResponse extends AttractionResponse {
  // Additional fields for detail view if needed
  isAvailable?: boolean;
  nextAvailableDate?: string;
}

// ==================== Database Query Types ====================

export interface AttractionWhereInput {
  id?: string;
  name?: Prisma.StringFilter;
  type?: string | Prisma.StringNullableFilter;
  isActive?: boolean;
  adultPrice?: Prisma.DecimalFilter;
  childPrice?: Prisma.DecimalNullableFilter;
}

export interface AttractionFilters {
  search?: string;
  type?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface AttractionOrderBy {
  name?: 'asc' | 'desc';
  adultPrice?: 'asc' | 'desc';
  priority?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
}

// ==================== Service Types ====================

export interface CreateAttractionData {
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  type?: string | null;
  adultPrice: number;
  childPrice?: number | null;
  currency: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  operatingHours?: OperatingHours | null;
  capacity?: number | null;
  durationMinutes?: number | null;
  minAge?: number | null;
  maxAge?: number | null;
  isActive: boolean;
  priority: number;
}

export interface UpdateAttractionData {
  name?: string;
  description?: string | null;
  shortDescription?: string | null;
  type?: string | null;
  adultPrice?: number;
  childPrice?: number | null;
  currency?: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  operatingHours?: OperatingHours | null;
  capacity?: number | null;
  durationMinutes?: number | null;
  minAge?: number | null;
  maxAge?: number | null;
  isActive?: boolean;
  priority?: number;
}

// ==================== Utility Types ====================

export interface AttractionAvailability {
  isAvailable: boolean;
  reason?: string;
  nextAvailableDate?: Date;
  currentCapacity?: number;
  remainingCapacity?: number;
}

export interface PriceInfo {
  adultPrice: number;
  childPrice: number | null;
  currency: string;
  hasChildPrice: boolean;
  formattedAdultPrice: string;
  formattedChildPrice: string | null;
}

export interface AttractionStats {
  totalAttractions: number;
  activeAttractions: number;
  inactiveAttractions: number;
  totalRevenue: number;
  popularAttractions: Array<{
    id: string;
    name: string;
    bookingCount: number;
  }>;
}

// ==================== Upload Types ====================

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface ImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  folder?: string;
}

// ==================== Error Types ====================

export interface AttractionError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export type AttractionErrorCode =
  | 'ATTRACTION_NOT_FOUND'
  | 'ATTRACTION_ALREADY_EXISTS'
  | 'INVALID_ATTRACTION_DATA'
  | 'INVALID_PRICE'
  | 'INVALID_OPERATING_HOURS'
  | 'INVALID_IMAGE_URL'
  | 'ATTRACTION_NOT_AVAILABLE'
  | 'ATTRACTION_INACTIVE';

// ==================== Validation Types ====================

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface PriceValidation {
  isValid: boolean;
  adultPrice: number;
  childPrice?: number | null;
  errors: string[];
}

export interface OperatingHoursValidation {
  isValid: boolean;
  operatingHours: OperatingHours;
  errors: string[];
}

// ==================== Type Guards ====================

export function isValidOperatingHours(data: any): data is OperatingHours {
  if (!data || typeof data !== 'object') return false;

  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'holidays'];

  for (const key of Object.keys(data)) {
    if (!validDays.includes(key) && key !== 'specialDates') {
      return false;
    }

    if (key !== 'specialDates' && data[key]) {
      const slot = data[key];
      if (!slot.open || !slot.close) return false;
      if (typeof slot.open !== 'string' || typeof slot.close !== 'string') return false;
    }
  }

  return true;
}

export function isValidTimeSlot(slot: any): slot is TimeSlot {
  if (!slot || typeof slot !== 'object') return false;
  if (typeof slot.open !== 'string' || typeof slot.close !== 'string') return false;

  // Validate time format HH:mm
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(slot.open) && timeRegex.test(slot.close);
}

// ==================== Constants ====================

export const ATTRACTION_TYPES = [
  'THEME_PARK',
  'MUSEUM',
  'BEACH',
  'MOUNTAIN',
  'CULTURAL_SITE',
  'WATER_PARK',
  'ZOO',
  'AQUARIUM',
  'GARDEN',
  'MONUMENT',
  'OTHER'
] as const;

export type AttractionType = typeof ATTRACTION_TYPES[number];

export const DEFAULT_CURRENCY = 'IDR';
export const DEFAULT_PRIORITY = 0;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const SORT_BY_OPTIONS = ['name', 'price', 'priority', 'createdAt'] as const;
export const SORT_ORDER_OPTIONS = ['asc', 'desc'] as const;

// ==================== Utility Functions ====================

export function formatPrice(price: number, currency: string = DEFAULT_CURRENCY): string {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function parseDecimal(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value && typeof value.toNumber === 'function') return value.toNumber();
  return 0;
}
