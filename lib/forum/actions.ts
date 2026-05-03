'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { slugify, makePreview } from './utils'

/**
 * Create a new forum thread.
 * Slug is derived server-side — never accepted from the client.
 * author_id is set from the authenticated session — never from formData.
 * RLS INSERT policy enforces email_confirmed_at at the DB level.
 */
export async function createThread(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const title = (formData.get('title') as string | null)?.trim() ?? ''
  const body = (formData.get('body') as string | null)?.trim() ?? ''
  const categoryId = formData.get('category_id') as string

  if (!title || title.length < 5 || title.length > 200) {
    throw new Error('Title must be between 5 and 200 characters.')
  }
  if (!body || body.length < 20) {
    throw new Error('Post body must be at least 20 characters.')
  }
  if (!categoryId) {
    throw new Error('Category is required.')
  }

  // Timestamp suffix gives probabilistic uniqueness; UNIQUE constraint catches collision
  const slug = `${slugify(title)}-${Date.now()}`

  // Resolve category slug before insert to avoid Supabase join typing complexity
  const { data: category } = await supabase
    .from('forum_categories')
    .select('slug')
    .eq('id', categoryId)
    .single()

  const { error } = await supabase
    .from('forum_threads')
    .insert({
      title,
      body_preview: makePreview(body),
      slug,
      category_id: categoryId,
      author_id: user.id,
      is_article_thread: false,
    })

  if (error) {
    if (error.code === '42501') {
      throw new Error('You must have a verified account to create threads.')
    }
    throw new Error(error.message)
  }

  // Redirect to the thread detail URL under its category
  const categorySlug = category?.slug ?? 'general'
  redirect(`/forum/${categorySlug}/${slug}`)
}

/**
 * Create a reply post on a thread.
 * Enforces depth cap at application layer: parent must have depth = 0.
 * Increments reply_count on the parent thread explicitly (no trigger).
 */
export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const body = (formData.get('body') as string | null)?.trim() ?? ''
  const threadId = formData.get('thread_id') as string
  const parentPostId = (formData.get('parent_post_id') as string | null) || null

  if (!body || body.length < 5) {
    throw new Error('Reply must be at least 5 characters.')
  }

  let depth = 0

  if (parentPostId) {
    // Validate parent exists and is top-level (depth = 0)
    const { data: parentPost } = await supabase
      .from('forum_posts')
      .select('depth')
      .eq('id', parentPostId)
      .single()

    if (!parentPost) throw new Error('Parent post not found.')
    if (parentPost.depth >= 1) {
      throw new Error('Replies can only be nested one level deep.')
    }
    depth = 1
  }

  const { error: insertError } = await supabase
    .from('forum_posts')
    .insert({
      thread_id: threadId,
      parent_post_id: parentPostId,
      author_id: user.id,
      body,
      depth,
    })

  if (insertError) {
    if (insertError.code === '42501') {
      throw new Error('You must have a verified account to post replies.')
    }
    throw new Error(insertError.message)
  }

  // Increment reply_count on the thread (display-only — read-then-write, rare race is acceptable)
  const { data: threadData } = await supabase
    .from('forum_threads')
    .select('reply_count')
    .eq('id', threadId)
    .single()

  if (threadData) {
    await supabase
      .from('forum_threads')
      .update({ reply_count: threadData.reply_count + 1 })
      .eq('id', threadId)
  }
}

/**
 * Toggle an upvote on a thread or post.
 * Calls the toggle_vote SECURITY DEFINER RPC — atomic, no race condition.
 * Do NOT replace with a JS upsert + count update.
 */
export async function toggleVote(targetId: string, targetType: 'thread' | 'post') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to vote.')

  const { error } = await supabase.rpc('toggle_vote', {
    p_target_id: targetId,
    p_target_type: targetType,
    p_user_id: user.id,
  })

  if (error) throw error
}

/**
 * Toggle a bookmark on a thread.
 * Uses UNIQUE(thread_id, user_id) constraint semantics:
 *   - If bookmark exists → delete it
 *   - If not → insert it
 */
export async function toggleBookmark(threadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from('forum_bookmarks')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('forum_bookmarks').delete().eq('id', existing.id)
  } else {
    await supabase.from('forum_bookmarks').insert({ thread_id: threadId, user_id: user.id })
  }
}
