'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface NewsletterSignupProps {
  className?: string
}

export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

  function validateEmail(val: string): boolean {
    return val.includes('@') && val.includes('.') && val.length > 3
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.')
      setState('error')
      return
    }

    setState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubmittedEmail(email)
        setState('success')
      } else {
        setErrorMessage('Something went wrong. Please try again in a moment.')
        setState('error')
      }
    } catch {
      setErrorMessage('Something went wrong. Please try again in a moment.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        className={`bg-white border border-[var(--border)] rounded-[var(--radius)] p-6 ${className ?? ''}`}
        role="status"
      >
        <h3
          className="font-semibold mb-2"
          style={{ fontSize: '20px', color: '#1a1a1a' }}
        >
          Check your inbox
        </h3>
        <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
          We&apos;ve sent a confirmation link to <strong>{submittedEmail}</strong>. Click it to
          complete your subscription.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-[var(--border)] rounded-[var(--radius)] p-6 ${className ?? ''}`}>
      <h3
        className="font-semibold mb-1"
        style={{ fontSize: '20px', color: '#1a1a1a' }}
      >
        Stay informed
      </h3>
      <p
        className="mb-4"
        style={{ fontSize: '14px', color: '#666666', lineHeight: '1.5' }}
      >
        Clinical insights and healthcare IT perspectives, delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === 'error') {
              setState('idle')
              setErrorMessage('')
            }
          }}
          className={`mb-2 w-full ${state === 'error' && errorMessage === 'Please enter a valid email address.' ? 'border-destructive' : ''}`}
          disabled={state === 'loading'}
          aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
        />
        {state === 'error' && (
          <p
            id="newsletter-error"
            role="alert"
            style={{ fontSize: '14px', color: 'var(--destructive)', marginBottom: '8px' }}
          >
            {errorMessage}
          </p>
        )}
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={state === 'loading'}
          aria-busy={state === 'loading'}
        >
          {state === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </Button>
      </form>
    </div>
  )
}
