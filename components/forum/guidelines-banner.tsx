'use client'

import { useEffect, useState } from 'react'
import { BookOpen, X } from 'lucide-react'
import Link from 'next/link'

const DISMISSED_KEY = 'guidelines_banner_dismissed'

export function GuidelinesBanner() {
  // Render visible by default (SSR safe — localStorage not available server-side).
  // On mount, read localStorage and hide immediately if already dismissed.
  const [visible, setVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY)) {
      setVisible(false)
    }
  }, [])

  function handleDismiss() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, '1')
    }
    setVisible(false)
  }

  // Don't render on server or if dismissed
  if (!mounted || !visible) return null

  return (
    <div className="w-full bg-muted border-b border-border">
      <div className="container mx-auto px-4 py-2.5 max-w-4xl flex items-center gap-3">
        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <p className="text-sm flex-1">
          New here? Read our{' '}
          <Link
            href="/community-guidelines"
            className="underline hover:text-primary transition-colors"
          >
            Community Guidelines
          </Link>{' '}
          before posting.
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss guidelines banner"
          className="h-[44px] w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
