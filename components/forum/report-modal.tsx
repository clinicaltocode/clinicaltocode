'use client'

import { useRef, useState, useTransition } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitReport } from '@/lib/moderation/actions'
import { VALID_REPORT_REASONS } from '@/lib/moderation/types'

interface ReportModalProps {
  targetType: 'thread' | 'post'
  targetId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReportModal({
  targetType,
  targetId,
  open,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<'form' | 'success' | 'error'>('form')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleClose() {
    setState('form')
    setErrorMsg(null)
    formRef.current?.reset()
    onClose()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('target_type', targetType)
    formData.set('target_id', targetId)

    startTransition(async () => {
      try {
        await submitReport(formData)
        setState('success')
        onSuccess()
        // Auto-close after 3 seconds
        setTimeout(() => handleClose(), 3000)
      } catch {
        setState('error')
        setErrorMsg('Something went wrong. Try again.')
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Popup
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md min-w-[320px] bg-background border border-border rounded-lg p-6 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
        {state === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="h-6 w-6 text-primary" />
            <p className="text-base">Report submitted. We&apos;ll review it.</p>
            <Button variant="outline" className="w-full min-h-[44px]" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit}>
            <h2
              id="report-modal-title"
              className="text-xl font-semibold mb-4"
            >
              Report this content
            </h2>

            <div className="mb-4">
              <label htmlFor="report-reason" className="block text-sm mb-1.5">
                Reason <span aria-hidden="true">*</span>
              </label>
              <select
                id="report-reason"
                name="reason"
                required
                disabled={isPending}
                defaultValue=""
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Select a reason…</option>
                {VALID_REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="report-details" className="block text-sm mb-1.5">
                Additional context (optional)
              </label>
              <Textarea
                id="report-details"
                name="details"
                disabled={isPending}
                placeholder="Any additional context? (optional)"
                maxLength={500}
                rows={3}
              />
            </div>

            {state === 'error' && errorMsg && (
              <p className="text-sm text-destructive mb-3">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full min-h-[44px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                'Submit Report'
              )}
            </Button>

            <button
              type="button"
              onClick={handleClose}
              className="block w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
