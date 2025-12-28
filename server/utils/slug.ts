/**
 * Slug Generation Utility
 * Generate unique slugs from attraction names with timestamp
 */

/**
 * Generate slug from text
 * Converts text to lowercase, replaces spaces with dashes, removes special characters
 *
 * @param text - The text to convert to slug
 * @returns Slugified text
 *
 * @example
 * slugify("Taman Mini Indonesia Indah") // "taman-mini-indonesia-indah"
 * slugify("Museum MACAN (Modern & Contemporary Art)") // "museum-macan-modern-contemporary-art"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with -
    .replace(/\s+/g, '-')
    // Remove all non-word chars (except dash)
    .replace(/[^\w\-]+/g, '')
    // Replace multiple - with single -
    .replace(/\-\-+/g, '-')
    // Remove - from start and end
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate unique slug with timestamp
 * Format: {slugified-name}-{timestamp}
 *
 * @param name - The attraction name
 * @param useTimestamp - Whether to append timestamp (default: true)
 * @returns Unique slug
 *
 * @example
 * generateSlug("Taman Mini Indonesia Indah")
 * // "taman-mini-indonesia-indah-1234567890123"
 *
 * generateSlug("Taman Mini Indonesia Indah", false)
 * // "taman-mini-indonesia-indah"
 */
export function generateSlug(name: string, useTimestamp: boolean = true): string {
  const baseSlug = slugify(name);

  if (!useTimestamp) {
    return baseSlug;
  }

  // Use timestamp for uniqueness
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
}

/**
 * Generate slug from name with custom timestamp
 *
 * @param name - The attraction name
 * @param timestamp - Custom timestamp (optional)
 * @returns Slug with timestamp
 *
 * @example
 * generateSlugWithTimestamp("Taman Mini", 1234567890)
 * // "taman-mini-1234567890"
 */
export function generateSlugWithTimestamp(name: string, timestamp?: number): string {
  const baseSlug = slugify(name);
  const ts = timestamp || Date.now();
  return `${baseSlug}-${ts}`;
}

/**
 * Generate short unique slug (last 6 digits of timestamp)
 * Format: {slugified-name}-{short-timestamp}
 *
 * @param name - The attraction name
 * @returns Short unique slug
 *
 * @example
 * generateShortSlug("Taman Mini Indonesia Indah")
 * // "taman-mini-indonesia-indah-567890"
 */
export function generateShortSlug(name: string): string {
  const baseSlug = slugify(name);
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
}

/**
 * Update slug when name changes
 * Preserves the original timestamp if available
 *
 * @param newName - New attraction name
 * @param oldSlug - Current slug (optional)
 * @returns Updated slug
 *
 * @example
 * updateSlug("New Name", "old-name-1234567890")
 * // "new-name-1234567890"
 *
 * updateSlug("New Name")
 * // "new-name-{current-timestamp}"
 */
export function updateSlug(newName: string, oldSlug?: string): string {
  const baseSlug = slugify(newName);

  // Try to extract timestamp from old slug
  if (oldSlug) {
    const parts = oldSlug.split('-');
    const lastPart = parts[parts.length - 1];

    // Check if last part is a timestamp (all digits)
    if (lastPart && /^\d+$/.test(lastPart)) {
      return `${baseSlug}-${lastPart}`;
    }
  }

  // Generate new slug with current timestamp
  return generateSlug(newName);
}

/**
 * Validate slug format
 *
 * @param slug - The slug to validate
 * @returns True if valid slug format
 *
 * @example
 * isValidSlug("taman-mini-1234567890") // true
 * isValidSlug("Taman Mini") // false (has spaces and uppercase)
 * isValidSlug("taman_mini") // false (has underscore)
 */
export function isValidSlug(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and dashes
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Extract timestamp from slug
 *
 * @param slug - The slug containing timestamp
 * @returns Timestamp or null if not found
 *
 * @example
 * extractTimestampFromSlug("taman-mini-1234567890")
 * // 1234567890
 */
export function extractTimestampFromSlug(slug: string): number | null {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];

  if (lastPart && /^\d+$/.test(lastPart)) {
    return parseInt(lastPart, 10);
  }

  return null;
}

/**
 * Extract base slug without timestamp
 *
 * @param slug - The full slug
 * @returns Base slug without timestamp
 *
 * @example
 * extractBaseSlug("taman-mini-indonesia-1234567890")
 * // "taman-mini-indonesia"
 */
export function extractBaseSlug(slug: string): string {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];

  // If last part is timestamp, remove it
  if (lastPart && /^\d+$/.test(lastPart)) {
    return parts.slice(0, -1).join('-');
  }

  return slug;
}
