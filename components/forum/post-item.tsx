'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/forum/utils'
import type { ForumPost, AuthorMeta } from '@/lib/forum/types'
import { ReplyForm } from './reply-form'
import { ReportButton } from './report-button'
import { CredentialBadge } from '@/components/profile/credential-badge'

interface PostItemProps {
  post: ForumPost
  isNested?: boolean
  isAuthenticated?: boolean
  author?: AuthorMeta | null
  currentUserId?: string | null  // new — for ownership check
}

export function PostItem({ post, isNested = false, isAuthenticated = false, author, currentUserId }: PostItemProps) {
  const [showReply, setShowReply] = useState(false)

  if (post.is_removed) {
    return (
      <div className={`border border-border rounded-lg p-4 bg-muted ${isNested ? 'ml-8 mt-2' : 'mt-4'}`}>
        <p className="text-sm text-muted-foreground italic">
          [This post has been removed by a moderator.]
        </p>
      </div>
    )
  }

  return (
    <div className={`border border-border rounded-lg p-4 ${isNested ? 'ml-8 mt-2' : 'mt-4'}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span className="font-medium text-foreground">
          {author?.username ?? 'Anonymous'}
        </span>
        {author?.credential_badge && (
          <CredentialBadge credential={author.credential_badge} />
        )}
        <span>·</span>
        <span>{formatRelativeTime(post.created_at)}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{post.body}</p>
      {!isNested && isAuthenticated && (
        <div className="mt-3 flex items-center justify-between">
          {showReply ? (
            <ReplyForm
              threadId={post.thread_id}
              parentPostId={post.id}
              placeholder="Write a reply…"
              onSuccess={() => setShowReply(false)}
            />
          ) : (
            <button
              onClick={() => setShowReply(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reply
            </button>
          )}
          <ReportButton
            targetType="post"
            targetId={post.id}
            isAuthenticated={isAuthenticated}
            isOwn={currentUserId != null && post.author_id === currentUserId}
          />
        </div>
      )}
    </div>
  )
}
