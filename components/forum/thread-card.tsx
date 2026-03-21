'use client'

import { ArrowUp, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/forum/utils'
import type { ForumThread, AuthorMeta } from '@/lib/forum/types'
import { CredentialBadge } from '@/components/profile/credential-badge'
import { ReportButton } from './report-button'

interface ThreadCardProps {
  thread: ForumThread
  categorySlug: string
  author?: AuthorMeta | null  // optional — backward compatible
  currentUserId?: string | null  // new — for ownership check
  isAuthenticated?: boolean      // new
}

export function ThreadCard({ thread, categorySlug, author, currentUserId, isAuthenticated = false }: ThreadCardProps) {
  return (
    <article className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {thread.is_article_thread && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Article Discussion
              </Badge>
            )}
          </div>
          <Link
            href={`/forum/${categorySlug}/${thread.slug}`}
            className="text-base font-semibold hover:text-primary transition-colors line-clamp-2"
          >
            {thread.title}
          </Link>
          {thread.body_preview && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {thread.body_preview}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <ArrowUp className="h-4 w-4" />
          {thread.vote_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {thread.reply_count}
        </span>
        {author && (
          <>
            <span className="flex items-center gap-1">
              <span className="font-medium text-foreground">{author.username}</span>
              <CredentialBadge credential={author.credential_badge} />
            </span>
            <span>·</span>
          </>
        )}
        <span>{formatRelativeTime(thread.created_at)}</span>
        <ReportButton
          targetType="thread"
          targetId={thread.id}
          isAuthenticated={isAuthenticated}
          isOwn={currentUserId != null && thread.author_id === currentUserId}
        />
      </div>
    </article>
  )
}
