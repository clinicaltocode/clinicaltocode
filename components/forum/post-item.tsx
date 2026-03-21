import { formatRelativeTime } from '@/lib/forum/utils'
import type { ForumPost } from '@/lib/forum/types'

interface PostItemProps {
  post: ForumPost
  isNested?: boolean
}

export function PostItem({ post, isNested = false }: PostItemProps) {
  const author = post.user_profiles
  const username = author?.username ?? 'Anonymous'
  const badge = author?.credential_badge

  return (
    <div className={`border border-border rounded-lg p-4 ${isNested ? 'ml-8 mt-2' : 'mt-4'}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span className="font-medium text-foreground">{username}</span>
        {badge && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <span>·</span>
        <span>{formatRelativeTime(post.created_at)}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{post.body}</p>
    </div>
  )
}
