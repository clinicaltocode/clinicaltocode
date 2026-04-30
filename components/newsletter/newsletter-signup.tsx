'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface NewsletterSignupProps {
  className?: string
  variant?: 'light' | 'dark' | 'inline'
}

export function NewsletterSignup({ className, variant = 'light' }: NewsletterSignupProps) {
  const isDark = variant === 'dark'
  const isInline = variant === 'inline'
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
      <div className={`${isInline ? 'bg-[#f0faf5] border border-[#1a6847]/20 rounded-lg p-6' : isDark ? '' : 'border-t border-b border-[#e0dcd5]'} ${isInline ? '' : 'py-8'} text-center ${className ?? ''}`} role="status">
        <h3 className={`font-serif text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>Check your inbox</h3>
        <p className={`text-sm ${isDark ? 'text-white/70' : 'text-[#6b6b6b]'}`}>
          We&apos;ve sent a confirmation link to <strong>{submittedEmail}</strong>.
        </p>
      </div>
    )
  }

  if (isInline) {
    return (
      <div className={`bg-[#f0faf5] border border-[#1a6847]/20 rounded-lg p-6 md:p-8 ${className ?? ''}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-[#1a1a1a]">Enjoying this article?</h3>
            <p className="text-sm text-[#6b6b6b] mt-1">Get pieces like this in your inbox every week. No spam, unsubscribe anytime.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate className="flex gap-2 shrink-0">
            <label htmlFor="newsletter-inline" className="sr-only">Email address</label>
            <Input
              id="newsletter-inline" type="email" placeholder="your@email.com" value={email}
              onChange={(e) => { setEmail(e.target.value); if (state === 'error') { setState('idle'); setErrorMessage('') } }}
              className={`w-48 ${state === 'error' ? 'border-destructive' : ''}`}
              disabled={state === 'loading'}
            />
            <Button type="submit" disabled={state === 'loading'} aria-busy={state === 'loading'}
              className="bg-[#1a6847] hover:bg-[#155a3c] text-white">
              {state === 'loading' ? '...' : 'Subscribe'}
            </Button>
          </form>
        </div>
        {state === 'error' && <p role="alert" className="text-sm mt-2 text-destructive">{errorMessage}</p>}
      </div>
    )
  }

  return (
    <div className={`${isDark ? '' : 'border-t border-b border-[#e0dcd5]'} py-8 text-center ${className ?? ''}`}>
      <h3 className={`font-serif text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        {isDark ? 'Get the Clinical to Code Weekly' : 'Stay informed'}
      </h3>
      <p className={`text-sm mb-4 ${isDark ? 'text-white/70' : 'text-[#6b6b6b]'}`}>
        {isDark
          ? 'One email per week. The best clinical insights on healthcare IT. No spam.'
          : 'Clinical insights delivered to your inbox. No spam.'}
      </p>
      <form onSubmit={handleSubmit} noValidate className="flex gap-2 max-w-sm mx-auto">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <Input
          id="newsletter-email" type="email" placeholder="your@email.com" value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') { setState('idle'); setErrorMessage('') } }}
          className={`flex-1 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : ''} ${state === 'error' ? 'border-destructive' : ''}`}
          disabled={state === 'loading'}
        />
        <Button type="submit" disabled={state === 'loading'} aria-busy={state === 'loading'}
          className={isDark ? 'bg-white text-[#134e35] hover:bg-white/90' : ''}>
          {state === 'loading' ? 'Sending...' : 'Subscribe'}
        </Button>
      </form>
      {state === 'error' && <p role="alert" className={`text-sm mt-2 ${isDark ? 'text-red-300' : 'text-destructive'}`}>{errorMessage}</p>}
    </div>
  )
}
