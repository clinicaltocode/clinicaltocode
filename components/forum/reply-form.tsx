'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createPost } from '@/lib/forum/actions'

interface ReplyFormProps {
  threadId: string
  parentPostId?: string  // If set, this is a nested reply (depth=1)
  placeholder?: string
  onSuccess?: () => void
}

export function ReplyForm({ threadId, parentPostId, placeholder, onSuccess }: ReplyFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [body, setBody] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const formData = new FormData()
    formData.set('body', body)
    formData.set('thread_id', threadId)
    if (parentPostId) formData.set('parent_post_id', parentPostId)

    try {
      await createPost(formData)
      setBody('')
      onSuccess?.()
      // Trigger a page refresh to show the new post
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply.')
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={parentPostId ? 3 : 5}
        required
        minLength={5}
        placeholder={placeholder ?? 'Write a reply\u2026'}
        className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? 'Posting\u2026' : parentPostId ? 'Reply' : 'Post Reply'}
      </Button>
    </form>
  )
}
