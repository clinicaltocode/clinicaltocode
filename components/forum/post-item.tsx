'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/forum/utils'
import type { ForumPost } from '@/lib/forum/types'
import { ReplyForm } from './reply-form'

interface PostItemProps {
  post: ForumPost
  isNested?: boolean
  isAuthenticated?: boolean
}

export function PostItem({ post, isNested = false, isAuthenticated = false }: PostItemProps) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className={`border border-border rounded-lg p-4 ${isNested ? 'ml-8 mt-2' : 'mt-4'}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span className="font-medium text-foreground">Anonymous</span>
        <span>·</span>
        <span>{formatRelativeTime(post.created_at)}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{post.body}</p>
      {!isNested && isAuthenticated && (
        <div className="mt-3">
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
        </div>
      )}
    </div>
  )
}
