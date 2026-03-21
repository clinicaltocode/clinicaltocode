import Link from 'next/link'
import { formatRelativeTime } from '@/lib/forum/utils'
import type { ProfileActivity } from '@/lib/profile/types'

interface ProfilePostHistoryProps {
  activity: ProfileActivity[]
  isOwnProfile: boolean
}

export function ProfilePostHistory({ activity, isOwnProfile }: ProfilePostHistoryProps) {
  if (activity.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-base font-semibold mb-1">
          {isOwnProfile ? "You haven't posted yet" : 'No posts yet'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isOwnProfile
            ? 'Join a discussion or start a new thread.'
            : "This member hasn't posted in the forum yet."}
        </p>
        {isOwnProfile && (
          <Link href="/forum" className="text-sm text-primary hover:underline mt-2 inline-block">
            Go to Forum
          </Link>
        )}
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {activity.map((item) => (
        <li key={`${item.kind}-${item.id}`} className="py-4 hover:bg-muted/50 rounded-lg px-2 transition-colors">
          {item.kind === 'thread' ? (
            <div>
              <Link
                href={item.category_slug ? `/forum/${item.category_slug}/${item.slug}` : '/forum'}
                className="text-base font-semibold hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
              {item.body_preview && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.body_preview}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(item.created_at)}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(item.created_at)}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
