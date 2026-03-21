import { createClient } from '@/lib/supabase/server'
import type { ForumCategory, ForumThread, ForumBookmark, ThreadWithPosts } from './types'

/** Fetch all categories ordered by title. Public read — no auth required. */
export async function getCategories(): Promise<ForumCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_categories')
    .select('id, title, slug, sanity_category_id, description, created_at')
    .order('title')

  if (error) throw error
  return data ?? []
}

/** Fetch threads for a category slug, most recent first, excluding removed threads. */
export async function getThreadsByCategory(categorySlug: string): Promise<ForumThread[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*, forum_categories!inner(title, slug)')
    .eq('forum_categories.slug', categorySlug)
    .eq('is_removed', false)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

/**
 * Fetch a thread and its posts using the three-query pattern (no recursive CTE).
 * Returns thread + topPosts (depth=0) + nestedPosts (depth=1).
 * Thread lookup is by slug alone — slug is UNIQUE, category slug ignored in WHERE.
 */
export async function getThreadWithPosts(threadSlug: string): Promise<ThreadWithPosts | null> {
  const supabase = await createClient()

  // 1. Thread
  const { data: thread, error: threadError } = await supabase
    .from('forum_threads')
    .select('*, forum_categories(title, slug)')
    .eq('slug', threadSlug)
    .eq('is_removed', false)
    .single()

  if (threadError || !thread) return null

  // 2. Top-level posts (parent_post_id IS NULL, depth = 0)
  const { data: topPosts } = await supabase
    .from('forum_posts')
    .select('*, user_profiles(username, credential_badge)')
    .eq('thread_id', thread.id)
    .is('parent_post_id', null)
    .eq('is_removed', false)
    .order('created_at', { ascending: true })

  const topPostIds = (topPosts ?? []).map((p) => p.id)

  // 3. Second-level replies (depth = 1) — bounded by topPostIds
  const { data: nestedPosts } = topPostIds.length
    ? await supabase
        .from('forum_posts')
        .select('*, user_profiles(username, credential_badge)')
        .in('parent_post_id', topPostIds)
        .eq('is_removed', false)
        .order('created_at', { ascending: true })
    : { data: [] }

  return {
    thread,
    topPosts: topPosts ?? [],
    nestedPosts: nestedPosts ?? [],
  }
}

/** Fetch bookmarked threads for the authenticated user. */
export async function getUserBookmarks(): Promise<ForumBookmark[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('forum_bookmarks')
    .select('*, forum_threads(id, title, slug, vote_count, reply_count, created_at, category_id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
