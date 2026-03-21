'use client'

import { useState, useTransition } from 'react'
import { ArrowUp } from 'lucide-react'
import { toggleVote } from '@/lib/forum/actions'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  targetId: string
  targetType: 'thread' | 'post'
  initialCount: number
  isAuthenticated: boolean
}

export function VoteButton({ targetId, targetType, initialCount, isAuthenticated }: VoteButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleVote() {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }

    // Optimistic update
    const newVoted = !voted
    setVoted(newVoted)
    setCount((c) => (newVoted ? c + 1 : c - 1))

    startTransition(async () => {
      try {
        await toggleVote(targetId, targetType)
      } catch {
        // Revert on error
        setVoted(voted)
        setCount(initialCount)
      }
    })
  }

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      aria-label={voted ? 'Remove upvote' : 'Upvote'}
      className={cn(
        'flex items-center gap-1 text-sm px-2 py-1 rounded-md transition-colors',
        voted
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
    >
      <ArrowUp className="h-4 w-4" />
      <span>{count}</span>
    </button>
  )
}
