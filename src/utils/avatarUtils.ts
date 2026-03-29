/**
 * Utility functions for avatar handling
 */

/**
 * Generate initials from first and last name
 */
export function generateInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim() || ''
  const last = lastName?.trim() || ''
  
  if (!first && !last) return 'U' // Default for "User"
  
  const firstInitial = first.charAt(0).toUpperCase()
  const lastInitial = last.charAt(0).toUpperCase()
  
  if (first && last) {
    return firstInitial + lastInitial
  }
  
  return firstInitial || lastInitial
}

/**
 * Generate a consistent background color based on name
 */
export function generateAvatarColor(firstName?: string | null, lastName?: string | null): string {
  const name = `${firstName || ''}${lastName || ''}`.toLowerCase()
  
  // Predefined colors that work well with white text
  const colors = [
    '#006633', // Green (matching site theme)
    '#7D1A1D', // Maroon (matching site theme)
    '#4F46E5', // Indigo
    '#059669', // Emerald
    '#DC2626', // Red
    '#7C2D12', // Orange
    '#1D4ED8', // Blue
    '#7C3AED', // Violet
    '#BE185D', // Pink
    '#0891B2', // Cyan
  ]
  
  // Generate a hash from the name to consistently pick a color
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Generate a data URL for an SVG avatar with initials
 */
export function generateInitialsAvatar(firstName?: string | null, lastName?: string | null): string {
  const initials = generateInitials(firstName, lastName)
  const backgroundColor = generateAvatarColor(firstName, lastName)
  
  const svg = `
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="${backgroundColor}" rx="8"/>
      <text x="40" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${initials}
      </text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}