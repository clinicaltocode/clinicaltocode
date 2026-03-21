import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './settings-form'

export const metadata = { title: 'Profile Settings | Clinical to Code' }

export default async function SettingsProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Middleware guarantees user is authenticated + verified. This is a safety net.
  if (!user) redirect('/auth/login')

  // Fetch by user ID directly (not username) for the settings page
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, username, bio, credential_badge, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  return (
    <main className="container mx-auto px-4 py-16 max-w-[640px]">
      <h1 className="text-xl font-semibold mb-8">Profile Settings</h1>
      <SettingsForm profile={profile} />
    </main>
  )
}
