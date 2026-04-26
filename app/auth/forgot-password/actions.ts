'use server'

import { createClient } from '@/lib/supabase/server'

export async function requestPasswordReset(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clinicaltocode.com'

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  })

  // Always return success to prevent user enumeration
  return { success: true }
}
