'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportModal } from './report-modal'

interface ReportButtonProps {
  targetType: 'thread' | 'post'
  targetId: string
  isAuthenticated: boolean
  isOwn: boolean
  alreadyReported?: boolean
}

export function ReportButton({
  targetType,
  targetId,
  isAuthenticated,
  isOwn,
  alreadyReported = false,
}: ReportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [reported, setReported] = useState(alreadyReported)

  // Hidden for unauthenticated users and own content
  if (!isAuthenticated || isOwn) return null

  return (
    <>
      <button
        onClick={() => { if (!reported) setModalOpen(true) }}
        disabled={reported}
        aria-disabled={reported}
        aria-label={targetType === 'thread' ? 'Report this thread' : 'Report this post'}
        title={reported ? "You've already reported this." : undefined}
        className={`flex items-center gap-1 text-xs min-h-[44px] px-2 transition-colors ${
          reported
            ? 'text-muted-foreground cursor-not-allowed opacity-60'
            : 'text-muted-foreground hover:text-primary'
        }`}
      >
        <Flag className={`h-4 w-4 ${reported ? 'fill-muted-foreground' : ''}`} />
        <span>{reported ? 'Reported' : 'Report'}</span>
      </button>

      <ReportModal
        targetType={targetType}
        targetId={targetId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setReported(true)
          setModalOpen(false)
        }}
      />
    </>
  )
}
