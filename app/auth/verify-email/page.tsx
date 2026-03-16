'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { resendVerificationEmail } from './actions'

const initialState: { error?: string; success?: boolean } = {}

function ResendButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-white py-2 px-6 rounded-md font-medium min-h-[48px] hover:bg-primary-dark disabled:opacity-50"
    >
      {pending ? 'Sending…' : 'Resend verification email'}
    </button>
  )
}

export default function VerifyEmailPage() {
  const [state, formAction] = useActionState(resendVerificationEmail, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
        <p className="text-[#666666] mb-6">
          You need to verify your email address before you can participate
          in the forum. Check your inbox for a confirmation link from
          Clinical to Code.
        </p>

        {state?.error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {state.error}
          </p>
        )}

        {state?.success && (
          <p role="status" className="text-sm text-secondary bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
            Verification email sent — check your inbox.
          </p>
        )}

        <form action={formAction}>
          <ResendButton />
        </form>

        <p className="text-xs text-[#999999] mt-4">
          Note: Supabase free tier allows 4 verification emails per hour.
          If you have requested multiple recently, please wait before trying
          again.
        </p>

        <p className="text-sm text-[#666666] mt-6">
          <Link href="/" className="text-primary hover:underline">
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  )
}
