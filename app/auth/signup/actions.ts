'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password.length > 72) {
    return { error: 'Password must be under 72 characters.' }
  }

  // IMPORTANT: createClient() is called inside the action, never at module
  // level. Module-level clients share auth context across requests.
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo must match the allow-list in Supabase Auth →
      // URL Configuration → Redirect URLs.
      //
      // NEXT_PUBLIC_SITE_URL must be set in .env.local (task 2-02-11).
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return {
        error: 'An account with this email already exists. Try logging in.',
      }
    }
    // Temporary: expose real error for debugging
    return { error: `Auth error: ${error.message} (code: ${error.code})` }
  }

  // Redirect to the "check your email" page.
  redirect('/auth/confirm')
}
