/**
 * Attraction Utilities
 * Helper functions for attraction/destination management
 */

import type {
  Attraction,
  AttractionFilters,
  AttractionOrderBy,
  OperatingHours,
  PriceInfo,
  PriceValidation,
  TimeSlot,
  AttractionAvailability,
} from "~~/server/types/attraction.types";
import { formatPrice, parseDecimal } from "~~/server/types/attraction.types";
import { generateSlug } from "~~/server/utils/slug";

// ==================== Validation Functions ====================

/**
 * Validate attraction prices
 */
export function validatePrices(
  adultPrice: number,
  childPrice?: number | null,
): PriceValidation {
  const errors: string[] = [];

  // Validate adult price
  if (adultPrice <= 0) {
    errors.push("Adult price must be greater than 0");
  }

  if (adultPrice > 100000000) {
    errors.push("Adult price is too high");
  }

  // Validate child price if provided
  if (childPrice !== null && childPrice !== undefined) {
    if (childPrice < 0) {
      errors.push("Child price cannot be negative");
    }

    if (childPrice > 100000000) {
      errors.push("Child price is too high");
    }

    if (childPrice > adultPrice) {
      errors.push("Child price should not exceed adult price");
    }
  }

  return {
    isValid: errors.length === 0,
    adultPrice,
    childPrice: childPrice ?? null,
    errors,
  };
}

/**
 * Validate time format (HH:mm)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Validate time slot
 */
export function validateTimeSlot(slot: TimeSlot): {
  isValid: boolean;
  error?: string;
} {
  if (!slot.open || !slot.close) {
    return { isValid: false, error: "Open and close times are required" };
  }

  if (!isValidTimeFormat(slot.open)) {
    return { isValid: false, error: `Invalid open time format: ${slot.open}` };
  }

  if (!isValidTimeFormat(slot.close)) {
    return {
      isValid: false,
      error: `Invalid close time format: ${slot.close}`,
    };
  }

  // Compare times
  const [openHour, openMin] = slot.open.split(":").map(Number);
  const [closeHour, closeMin] = slot.close.split(":").map(Number);

  const openMinutes = (openHour ?? 0) * 60 + (openMin ?? 0);
  const closeMinutes = (closeHour ?? 0) * 60 + (closeMin ?? 0);

  if (openMinutes >= closeMinutes && !slot.isClosed) {
    return { isValid: false, error: "Close time must be after open time" };
  }

  return { isValid: true };
}

/**
 * Validate operating hours
 */
export function validateOperatingHours(operatingHours: OperatingHours): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const validDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "holidays",
  ];

  for (const [day, slot] of Object.entries(operatingHours)) {
    if (day === "specialDates") continue;

    if (!validDays.includes(day)) {
      errors.push(`Invalid day: ${day}`);
      continue;
    }

    if (slot && typeof slot === "object") {
      const validation = validateTimeSlot(slot as TimeSlot);
      if (!validation.isValid && validation.error) {
        errors.push(`${day}: ${validation.error}`);
      }
    }
  }

  // Validate special dates if exists
  if (operatingHours.specialDates) {
    for (const [date, slot] of Object.entries(operatingHours.specialDates)) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        errors.push(`Invalid date format: ${date}`);
        continue;
      }

      const validation = validateTimeSlot(slot);
      if (!validation.isValid && validation.error) {
        errors.push(`Special date ${date}: ${validation.error}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate age range
 */
export function validateAgeRange(
  minAge?: number | null,
  maxAge?: number | null,
): {
  isValid: boolean;
  error?: string;
} {
  if (minAge !== null && minAge !== undefined && minAge < 0) {
    return { isValid: false, error: "Minimum age cannot be negative" };
  }

  if (maxAge !== null && maxAge !== undefined && maxAge < 0) {
    return { isValid: false, error: "Maximum age cannot be negative" };
  }

  if (
    minAge !== null &&
    minAge !== undefined &&
    maxAge !== null &&
    maxAge !== undefined &&
    minAge > maxAge
  ) {
    return {
      isValid: false,
      error: "Minimum age cannot be greater than maximum age",
    };
  }

  return { isValid: true };
}

/**
 * Validate capacity
 */
export function validateCapacity(capacity?: number | null): {
  isValid: boolean;
  error?: string;
} {
  if (capacity === null || capacity === undefined) {
    return { isValid: true };
  }

  if (capacity < 1) {
    return { isValid: false, error: "Capacity must be at least 1" };
  }

  if (capacity > 1000000) {
    return { isValid: false, error: "Capacity is too high" };
  }

  return { isValid: true };
}

/**
 * Validate duration
 */
export function validateDuration(durationMinutes?: number | null): {
  isValid: boolean;
  error?: string;
} {
  if (durationMinutes === null || durationMinutes === undefined) {
    return { isValid: true };
  }

  if (durationMinutes < 1) {
    return { isValid: false, error: "Duration must be at least 1 minute" };
  }

  if (durationMinutes > 10080) {
    // 7 days in minutes
    return { isValid: false, error: "Duration cannot exceed 7 days" };
  }

  return { isValid: true };
}

// ==================== Formatting Functions ====================

/**
 * Get price information with formatting
 */
export function getPriceInfo(attraction: Attraction): PriceInfo {
  const adultPrice = parseDecimal(attraction.adultPrice);
  const childPrice = attraction.childPrice
    ? parseDecimal(attraction.childPrice)
    : null;

  return {
    adultPrice,
    childPrice,
    currency: attraction.currency,
    hasChildPrice: childPrice !== null,
    formattedAdultPrice: formatPrice(adultPrice, attraction.currency),
    formattedChildPrice: childPrice
      ? formatPrice(childPrice, attraction.currency)
      : null,
  };
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
}

/**
 * Format operating hours for display
 */
export function formatOperatingHoursForDay(slot: TimeSlot | undefined): string {
  if (!slot) return "Not available";
  if (slot.isClosed) return "Closed";
  return `${slot.open} - ${slot.close}`;
}

/**
 * Get today's operating hours
 */
export function getTodayOperatingHours(
  operatingHours: OperatingHours | null,
): TimeSlot | null {
  if (!operatingHours) return null;

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date().getDay();
  const dayName = days[today] as keyof OperatingHours;

  return (operatingHours[dayName] as TimeSlot) || null;
}

// ==================== Query Building Functions ====================

/**
 * Build where clause for attraction filtering
 */
export function buildAttractionWhereClause(filters: AttractionFilters): any {
  const where: any = {};

  // Search by name or description
  if (filters.search) {
    where.name = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  // Filter by type
  if (filters.type) {
    where.type = filters.type;
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  // Filter by price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.adultPrice = {};

    if (filters.minPrice !== undefined) {
      where.adultPrice.gte = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      where.adultPrice.lte = filters.maxPrice;
    }
  }

  return where;
}

/**
 * Build order by clause for sorting
 */
export function buildAttractionOrderBy(
  sortBy: string = "priority",
  sortOrder: "asc" | "desc" = "desc",
): AttractionOrderBy {
  const orderBy: AttractionOrderBy = {};

  switch (sortBy) {
    case "name":
      orderBy.name = sortOrder;
      break;
    case "price":
      orderBy.adultPrice = sortOrder;
      break;
    case "createdAt":
      orderBy.createdAt = sortOrder;
      break;
    case "priority":
    default:
      orderBy.priority = sortOrder;
      break;
  }

  return orderBy;
}

// ==================== Business Logic Functions ====================

/**
 * Check if attraction is currently open
 */
export function isAttractionOpen(
  operatingHours: OperatingHours | null,
): boolean {
  if (!operatingHours) return false;

  const now = new Date();
  const todaySlot = getTodayOperatingHours(operatingHours);

  if (!todaySlot || todaySlot.isClosed) return false;

  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const [currentHour, currentMin] = currentTime.split(":").map(Number);
  const currentMinutes = (currentHour ?? 0) * 60 + (currentMin ?? 0);

  const [openHour, openMin] = todaySlot.open.split(":").map(Number);
  const [closeHour, closeMin] = todaySlot.close.split(":").map(Number);
  const openMinutes = (openHour ?? 0) * 60 + (openMin ?? 0);
  const closeMinutes = (closeHour ?? 0) * 60 + (closeMin ?? 0);

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Check attraction availability
 */
export function checkAttractionAvailability(
  attraction: Attraction,
  requestedDate?: Date,
): AttractionAvailability {
  // Check if attraction is active
  if (!attraction.isActive) {
    return {
      isAvailable: false,
      reason: "Attraction is currently inactive",
    };
  }

  // Check if date is in the past
  if (requestedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return {
        isAvailable: false,
        reason: "Cannot book for past dates",
      };
    }
  }

  // If no operating hours defined, assume always available
  if (!attraction.operatingHours) {
    return {
      isAvailable: true,
    };
  }

  // Check if open today (if no specific date requested)
  if (!requestedDate) {
    const isOpen = isAttractionOpen(attraction.operatingHours);
    return {
      isAvailable: isOpen,
      reason: isOpen ? undefined : "Currently closed",
    };
  }

  return {
    isAvailable: true,
  };
}

/**
 * Calculate discounted price (if any discount logic needed)
 */
export function calculatePrice(
  basePrice: number,
  quantity: number,
  discountPercent: number = 0,
): number {
  const total = basePrice * quantity;
  const discount = (total * discountPercent) / 100;
  return total - discount;
}

/**
 * Check if user can book attraction based on age
 */
export function canBookForAge(attraction: Attraction, age: number): boolean {
  if (attraction.minAge !== null && age < attraction.minAge) {
    return false;
  }

  if (attraction.maxAge !== null && age > attraction.maxAge) {
    return false;
  }

  return true;
}

/**
 * Get age restrictions text
 */
export function getAgeRestrictionsText(attraction: Attraction): string | null {
  if (attraction.minAge === null && attraction.maxAge === null) {
    return null;
  }

  if (attraction.minAge !== null && attraction.maxAge !== null) {
    return `Ages ${attraction.minAge} to ${attraction.maxAge}`;
  }

  if (attraction.minAge !== null) {
    return `Ages ${attraction.minAge} and above`;
  }

  if (attraction.maxAge !== null) {
    return `Ages ${attraction.maxAge} and below`;
  }

  return null;
}

// ==================== Data Transformation ====================

/**
 * Sanitize attraction data for response
 */
export function sanitizeAttractionForResponse(attraction: any) {
  return {
    id: attraction.id,
    name: attraction.name,
    slug: attraction.slug,
    description: attraction.description,
    shortDescription: attraction.shortDescription,
    type: attraction.type,
    adultPrice: parseDecimal(attraction.adultPrice).toString(),
    childPrice: attraction.childPrice
      ? parseDecimal(attraction.childPrice).toString()
      : null,
    currency: attraction.currency,
    imageUrl: attraction.imageUrl,
    imageUrls: attraction.imageUrls,
    operatingHours: attraction.operatingHours,
    capacity: attraction.capacity,
    durationMinutes: attraction.durationMinutes,
    minAge: attraction.minAge,
    maxAge: attraction.maxAge,
    isActive: attraction.isActive,
    priority: attraction.priority,
    createdAt: attraction.createdAt.toISOString(),
    updatedAt: attraction.updatedAt.toISOString(),
  };
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const hasValidExtension = validExtensions.some((ext) =>
      parsedUrl.pathname.toLowerCase().endsWith(ext),
    );
    return (
      hasValidExtension &&
      (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:")
    );
  } catch {
    return false;
  }
}
