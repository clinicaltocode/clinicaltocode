import { formatDistanceToNow } from 'date-fns'

/**
 * Derive a URL-safe slug from a title string.
 * Server-side only — never accept slugs from the client.
 * Capped at 80 characters to avoid overly long URLs.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Format a date as a human-readable relative string ("3 hours ago").
 * Uses date-fns formatDistanceToNow — handles edge cases correctly.
 */
export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function makePreview(body: string, maxLen = 200): string {
  const plain = body
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/#{1,6}\s+/g, '')
    .trim()
  if (plain.length <= maxLen) return plain
  const cut = plain.lastIndexOf(' ', maxLen)
  return plain.slice(0, cut > 0 ? cut : maxLen) + '…'
}
