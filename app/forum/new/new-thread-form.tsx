'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createThread } from '@/lib/forum/actions'
import type { ForumCategory } from '@/lib/forum/types'

interface NewThreadFormProps {
  categories: ForumCategory[]
  defaultCategoryId?: string
}

export function NewThreadForm({ categories, defaultCategoryId }: NewThreadFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    try {
      await createThread(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread.')
      setPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium mb-1">
          Category <span className="text-destructive">*</span>
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={defaultCategoryId ?? ''}
          required
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={200}
          placeholder="What would you like to discuss?"
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium mb-1">
          Body <span className="text-destructive">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          required
          minLength={20}
          rows={8}
          placeholder="Share your perspective, question, or experience..."
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Posting\u2026' : 'Post Thread'}
      </Button>
    </form>
  )
}
