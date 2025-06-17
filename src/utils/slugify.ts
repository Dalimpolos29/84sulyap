/**
 * Utility functions for generating URL-friendly slugs from names
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove special characters except underscores and hyphens
    .replace(/[^\w\-_]/g, '')
    // Replace multiple underscores with single underscore
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '')
}

/**
 * Generates a profile slug from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns A URL-friendly slug in format "firstname_lastname"
 */
export function generateProfileSlug(firstName: string, lastName: string): string {
  const fullName = `${firstName} ${lastName}`
  return slugify(fullName)
}

/**
 * Parses a profile slug back to first and last name
 * @param slug - The URL slug to parse
 * @returns Object with firstName and lastName
 */
export function parseProfileSlug(slug: string): { firstName: string; lastName: string } {
  const parts = slug.split('_')
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  }
}

/**
 * Validates if a string is a valid profile slug
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Check if slug contains only letters, numbers, underscores, and hyphens
  const slugPattern = /^[a-z0-9_-]+$/
  return slugPattern.test(slug) && slug.length > 0
}