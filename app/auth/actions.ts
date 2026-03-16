'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// signOut MUST be called from a form action (POST), never from a plain
// anchor link (GET). Using a GET request to sign out is a CSRF vulnerability.
//
// Usage in a Server Component:
//   import { signOut } from '@/app/auth/actions'
//   <form action={signOut}>
//     <button type="submit">Sign out</button>
//   </form>
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
