import { createClient } from '@/lib/supabase/server'
import type { UserProfile, ProfileThread, ProfilePost, ProfileActivity } from './types'

const PAGE_SIZE = 20

/** Fetch a user profile by username. Returns null if not found. */
export async function getProfile(username: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, username, display_name, bio, credential_badge, avatar_url, is_admin, is_banned, created_at, updated_at')
    .eq('username', username)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data as UserProfile
}

/**
 * Fetch paginated activity (threads + top-level posts) for a user, merged and sorted by created_at desc.
 * Uses two separate queries — no UNION in PostgREST — merges in JS.
 * Page is 0-indexed.
 */
export async function getProfilePostHistory(userId: string, page = 0): Promise<ProfileActivity[]> {
  const supabase = await createClient()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [threadsResult, postsResult] = await Promise.all([
    supabase
      .from('forum_threads')
      .select('id, title, slug, body_preview, created_at, forum_categories(slug)')
      .eq('author_id', userId)
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .range(from, to),
    supabase
      .from('forum_posts')
      .select('id, thread_id, body, created_at, depth')
      .eq('author_id', userId)
      .eq('is_removed', false)
      .eq('depth', 0)
      .order('created_at', { ascending: false })
      .range(from, to),
  ])

  const threads: ProfileThread[] = (threadsResult.data ?? []).map((t) => ({
    kind: 'thread' as const,
    id: t.id,
    title: t.title,
    slug: t.slug,
    body_preview: t.body_preview,
    created_at: t.created_at,
    category_slug: Array.isArray(t.forum_categories)
      ? (t.forum_categories[0]?.slug ?? null)
      : ((t.forum_categories as { slug: string } | null)?.slug ?? null),
  }))

  const posts: ProfilePost[] = (postsResult.data ?? []).map((p) => ({
    kind: 'post' as const,
    id: p.id,
    thread_id: p.thread_id,
    body: p.body,
    created_at: p.created_at,
  }))

  // Merge and re-sort by created_at descending, take PAGE_SIZE items
  return [...threads, ...posts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, PAGE_SIZE)
}

/**
 * Batch fetch profiles keyed by user ID — avoids N+1 queries in forum thread/post lists.
 * Returns a map: Record<userId, Pick<UserProfile, 'id' | 'username' | 'credential_badge' | 'avatar_url'>>
 */
export async function getProfilesByIds(
  userIds: string[]
): Promise<Record<string, Pick<UserProfile, 'id' | 'username' | 'credential_badge' | 'avatar_url'>>> {
  if (userIds.length === 0) return {}
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('id, username, credential_badge, avatar_url')
    .in('id', userIds)

  return Object.fromEntries((data ?? []).map((p) => [p.id, p]))
}
