import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { CredentialBadge } from '@/components/profile/credential-badge'
import { ProfilePostHistory } from '@/components/profile/profile-post-history'
import { getProfile, getProfilePostHistory } from '@/lib/profile/queries'
import { createClient } from '@/lib/supabase/server'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  return { title: `${username} | Clinical to Code` }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const [profile, supabase] = await Promise.all([
    getProfile(username),
    createClient(),
  ])

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  const activity = await getProfilePostHistory(profile.id, 0)

  const joinDate = format(new Date(profile.created_at), 'MMMM yyyy')

  return (
    <main className="container mx-auto px-4 py-16 max-w-[800px]">
      {/* Profile header */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="h-20 w-20 shrink-0">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={`${profile.username}'s profile photo`} />
          ) : null}
          <AvatarFallback>
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 className="text-[28px] font-semibold leading-[1.2] break-words">
            {profile.username}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Joined {joinDate}</p>
          {profile.credential_badge && (
            <div className="mt-2">
              <CredentialBadge credential={profile.credential_badge} />
            </div>
          )}
          {isOwnProfile && (
            <Link
              href="/settings/profile"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio ? (
        <div className="mb-8">
          <p className="text-base leading-relaxed">{profile.bio}</p>
        </div>
      ) : isOwnProfile ? (
        <div className="mb-8">
          <p className="text-sm font-semibold mb-1">No bio yet</p>
          <p className="text-sm text-muted-foreground">
            Tell the community about your clinical background.{' '}
            <Link href="/settings/profile" className="text-primary hover:underline">
              Add one in settings
            </Link>
          </p>
        </div>
      ) : null}

      {/* Post history */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Discussions</h2>
        <ProfilePostHistory activity={activity} isOwnProfile={isOwnProfile} />
      </section>
    </main>
  )
}
