'use client'
import { useEffect } from 'react'

interface AdSlotProps {
  slotId: string
  className?: string
}

export function AdSlot({ slotId, className }: AdSlotProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by the Google script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not yet active — safe to ignore during development
    }
  }, [])

  return (
    <div className={className}>
      <p
        style={{ fontSize: '14px', color: 'var(--muted-foreground)', textAlign: 'center', marginBottom: '4px' }}
        aria-hidden="true"
      >
        Advertisement
      </p>
      <div
        style={{ minWidth: '300px', minHeight: '250px' }}
        className="bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius)] flex items-center justify-center"
        aria-label="Advertisement"
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
