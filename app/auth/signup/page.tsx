'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { signUp } from './actions'

const initialState: { error?: string } = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium min-h-[48px] hover:bg-primary-dark disabled:opacity-50"
    >
      {pending ? 'Creating account…' : 'Create account'}
    </button>
  )
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(signUp, initialState)

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f9fafb] py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8">
        <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
        <p className="text-sm text-[#666666] mb-6">
          Join Clinical to Code and start participating in the community.
        </p>

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
              autoComplete="new-password"
              minLength={8}
              className="w-full border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-[#666666] mt-1">Minimum 8 characters</p>
          </div>

          {state?.error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="text-sm text-center text-[#666666] mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
