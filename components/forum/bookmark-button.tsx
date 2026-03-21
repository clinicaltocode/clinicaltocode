'use client'

import { useState, useTransition } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { toggleBookmark } from '@/lib/forum/actions'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  threadId: string
  initialBookmarked: boolean
  isAuthenticated: boolean
}

export function BookmarkButton({ threadId, initialBookmarked, isAuthenticated }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function handleBookmark() {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }

    setBookmarked((b) => !b)

    startTransition(async () => {
      try {
        await toggleBookmark(threadId)
      } catch {
        setBookmarked(initialBookmarked)
      }
    })
  }

  const Icon = bookmarked ? BookmarkCheck : Bookmark

  return (
    <button
      onClick={handleBookmark}
      disabled={isPending}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this thread'}
      className={cn(
        'flex items-center gap-1 text-sm px-2 py-1 rounded-md transition-colors',
        bookmarked
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
    </button>
  )
}
