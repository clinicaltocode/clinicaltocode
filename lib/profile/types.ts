export const VALID_CREDENTIALS = [
  'RN', 'NP', 'MD', 'DO', 'PharmD', 'PA', 'CMIO', 'CIO', 'Health IT', 'Other'
] as const

export type CredentialBadge = typeof VALID_CREDENTIALS[number]

export interface UserProfile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  credential_badge: string | null
  avatar_url: string | null
  is_admin: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
}

/** A thread authored by the user, for the profile post history list. */
export interface ProfileThread {
  kind: 'thread'
  id: string
  title: string
  slug: string
  body_preview: string | null
  created_at: string
  category_slug: string | null
}

/** A top-level post (depth=0) authored by the user, for the profile post history list. */
export interface ProfilePost {
  kind: 'post'
  id: string
  thread_id: string
  body: string
  created_at: string
}

export type ProfileActivity = ProfileThread | ProfilePost
