'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { requestPasswordReset } from './actions'

const initialState: { error?: string; success?: boolean } = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium min-h-[48px] hover:bg-primary-dark disabled:opacity-50"
    >
      {pending ? 'Sending...' : 'Send reset link'}
    </button>
  )
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState)

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f9fafb] py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8">
        <h1 className="text-2xl font-semibold mb-2">Reset your password</h1>
        <p className="text-sm text-[#666666] mb-6">
          Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
        </p>

        {state?.success ? (
          <div role="status" className="text-sm text-[#1a6847] bg-[#f0fdf4] border border-[#bbf7d0] rounded-md px-3 py-3">
            <p className="font-medium mb-1">Check your email</p>
            <p>If an account exists with that email, you&apos;ll receive a password reset link shortly.</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {state?.error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>
        )}

        <p className="text-sm text-center text-[#666666] mt-6">
          <Link href="/auth/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
