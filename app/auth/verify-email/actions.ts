'use server'

import { createClient } from '@/lib/supabase/server'

export async function resendVerificationEmail(
  _prevState: { error?: string; success?: boolean } | undefined
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: 'You must be logged in to resend the verification email.' }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: 'Failed to resend verification email. Please try again.' }
  }

  return { success: true }
}
