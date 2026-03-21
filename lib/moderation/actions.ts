'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VALID_REPORT_REASONS } from './types'
import type { ReportReason } from './types'

// ============================================================
// Internal admin guard — all admin mutations call this first.
// Defense-in-depth: middleware gates the route, this gates the action.
// ============================================================
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Unauthorized')
  return { supabase, user }
}

// ============================================================
// MOD-01: Submit a content report (user-facing, authenticated)
// ============================================================
export async function submitReport(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to report content')

  const targetType = formData.get('target_type') as 'thread' | 'post'
  const targetId = formData.get('target_id') as string
  const reason = formData.get('reason') as string
  const details = (formData.get('details') as string | null)?.trim() || null

  // Validate reason against allowlist before sending to DB
  if (!(VALID_REPORT_REASONS as readonly string[]).includes(reason)) {
    throw new Error('Invalid report reason')
  }

  const { error } = await supabase.from('content_reports').insert({
    reporter_id: user.id,  // always from auth, never from formData
    target_type: targetType,
    target_id: targetId,
    reason: reason as ReportReason,
    details,
  })

  // Unique constraint violation = already reported — treat as success (no-op)
  if (error && error.code !== '23505') throw new Error(error.message)
}

// ============================================================
// MOD-02: Mark a report as reviewed (admin only)
// ============================================================
export async function markReviewed(reportId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from('content_reports')
    .update({ status: 'reviewed', reviewed_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) throw new Error(error.message)
}

// ============================================================
// MOD-03a: Soft-delete a post or thread (admin only)
// ============================================================
export async function softDeleteContent(
  targetType: 'thread' | 'post',
  targetId: string,
) {
  const { supabase } = await requireAdmin()
  const table = targetType === 'thread' ? 'forum_threads' : 'forum_posts'
  const { error } = await supabase
    .from(table)
    .update({ is_removed: true })
    .eq('id', targetId)
  if (error) throw new Error(error.message)
}

// ============================================================
// MOD-03b: Ban a user account (admin only)
// ============================================================
export async function banUser(userId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_banned: true })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}

// ============================================================
// MOD-03c: Unban a user account (admin only)
// ============================================================
export async function unbanUser(userId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_banned: false })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}

// ============================================================
// MOD-03d: Restore soft-deleted content (admin only)
// ============================================================
export async function restoreContent(
  targetType: 'thread' | 'post',
  targetId: string,
) {
  const { supabase } = await requireAdmin()
  const table = targetType === 'thread' ? 'forum_threads' : 'forum_posts'
  const { error } = await supabase
    .from(table)
    .update({ is_removed: false })
    .eq('id', targetId)
  if (error) throw new Error(error.message)
}

// ============================================================
// MOD-03e: Permanent delete (admin only — hard delete from DB)
// ============================================================
export async function permanentDeleteContent(
  targetType: 'thread' | 'post',
  targetId: string,
) {
  const { supabase } = await requireAdmin()
  const table = targetType === 'thread' ? 'forum_threads' : 'forum_posts'
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', targetId)
  if (error) throw new Error(error.message)
}
