'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }
  if (!password) {
    return { error: 'Password is required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Use a single generic message — do not distinguish "wrong email" from
    // "wrong password". Field-level specificity enables user enumeration attacks.
    return { error: 'Invalid email or password.' }
  }

  // Successful sign-in: middleware will read the new session cookie on the
  // next request. Redirect to homepage per CONTEXT.md decision.
  redirect('/')
}
