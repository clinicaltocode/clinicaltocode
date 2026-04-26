'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { signIn } from './actions'

const initialState: { error?: string } = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium min-h-[48px] hover:bg-primary-dark disabled:opacity-50"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState)
  const searchParams = useSearchParams()
  const isConfirmationError = searchParams.get('message') === 'confirmation-error'

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f9fafb] py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-[#666666] mb-6">
          Welcome back to Clinical to Code.
        </p>

        {isConfirmationError && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            The email confirmation link was invalid or has expired. Please try signing up again.
          </p>
        )}

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
              className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {state?.error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <SubmitButton />

          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>

        <p className="text-sm text-center text-[#666666] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

// useSearchParams() requires a Suspense boundary in Next.js App Router.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
