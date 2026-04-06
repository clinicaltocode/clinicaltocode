'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface NewsletterSignupProps { className?: string }

export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.') || email.length <= 3) {
      setErrorMessage('Please enter a valid email address.')
      setState('error')
      return
    }
    setState('loading')
    setErrorMessage('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      })
      if (res.ok) { setSubmittedEmail(email); setState('success') }
      else { setErrorMessage('Something went wrong. Please try again.'); setState('error') }
    } catch { setErrorMessage('Something went wrong. Please try again.'); setState('error') }
  }

  if (state === 'success') {
    return (
      <div className={`border-t border-b border-[#e0dcd5] py-8 text-center ${className ?? ''}`} role="status">
        <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-2">Check your inbox</h3>
        <p className="text-sm text-[#6b6b6b]">
          We&apos;ve sent a confirmation link to <strong>{submittedEmail}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className={`border-t border-b border-[#e0dcd5] py-8 text-center ${className ?? ''}`}>
      <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-1">Stay informed</h3>
      <p className="text-sm text-[#6b6b6b] mb-4">Clinical insights delivered to your inbox. No spam.</p>
      <form onSubmit={handleSubmit} noValidate className="flex gap-2 max-w-sm mx-auto">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <Input
          id="newsletter-email" type="email" placeholder="your@email.com" value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') { setState('idle'); setErrorMessage('') } }}
          className={`flex-1 ${state === 'error' ? 'border-destructive' : ''}`}
          disabled={state === 'loading'}
        />
        <Button type="submit" disabled={state === 'loading'} aria-busy={state === 'loading'}>
          {state === 'loading' ? 'Sending...' : 'Subscribe'}
        </Button>
      </form>
      {state === 'error' && <p role="alert" className="text-sm text-destructive mt-2">{errorMessage}</p>}
    </div>
  )
}
