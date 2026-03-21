import { ArrowUp, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/forum/utils'
import type { ForumThread } from '@/lib/forum/types'

interface ThreadCardProps {
  thread: ForumThread
  categorySlug: string
}

export function ThreadCard({ thread, categorySlug }: ThreadCardProps) {
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
        <span>{formatRelativeTime(thread.created_at)}</span>
      </div>
    </article>
  )
}
