'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = (formData.get('username') as string)?.trim()

  if (!username || username.length < 3) {
    return { error: 'Username must be at least 3 characters.' }
  }
  if (username.length > 30) {
    return { error: 'Username must be under 30 characters.' }
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { error: 'Username can only contain letters, numbers, hyphens, and underscores.' }
  }
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password.length > 72) {
    return { error: 'Password must be under 72 characters.' }
  }

  const supabase = await createClient()

  const { count } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .ilike('username', username)

  if (count && count > 0) {
    return { error: 'This username is already taken.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { username },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return {
        error: 'An account with this email already exists. Try logging in.',
      }
    }
    // Return a generic message — do not expose Supabase internals to the user
    return { error: 'Something went wrong. Please try again.' }
  }

  // Redirect to the "check your email" page.
  redirect('/auth/confirm')
}
