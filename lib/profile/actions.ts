'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VALID_CREDENTIALS } from './types'

/**
 * Update bio and credential_badge for the authenticated user.
 * user.id comes from supabase.auth.getUser() — never from formData.
 * Bio is sliced to 280 chars server-side as a safety net.
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const bio = (formData.get('bio') as string | null)?.trim().slice(0, 280) ?? null
  const credentialBadge = (formData.get('credential_badge') as string | null) || null

  if (credentialBadge && !(VALID_CREDENTIALS as readonly string[]).includes(credentialBadge)) {
    throw new Error('Invalid credential badge.')
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      bio,
      credential_badge: credentialBadge,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}

/**
 * Update only the avatar_url for the authenticated user.
 * Called from AvatarUpload after the browser client uploads to Storage.
 * avatarUrl is the full public URL returned by supabase.storage.getPublicUrl().
 */
export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('user_profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}

/**
 * Remove the avatar_url for the authenticated user (sets to null).
 * The Storage object cleanup is handled client-side before calling this action.
 */
export async function removeAvatar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('user_profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}
