import Link from 'next/link'

// This page is reached in two situations:
//   1. Immediately after signup: signUp() redirects here telling user to check inbox
//   2. After email verification: callback route redirects here after PKCE exchange
//
// Because both flows land here, the page text covers both cases.
export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-8 text-center">
        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-[#666666] mb-6">
          We&apos;ve sent a confirmation link to your email address. Click
          the link to verify your account and start participating in the
          forum.
        </p>
        <p className="text-sm text-[#666666] mb-8">
          If you&apos;ve already clicked the link, your account is verified.
        </p>

        <Link
          href="/"
          className="inline-block bg-primary text-white py-2 px-6 rounded-md font-medium min-h-[48px] leading-[48px] hover:bg-primary-dark"
        >
          Back to homepage
        </Link>

        <p className="text-xs text-[#999999] mt-6">
          Didn&apos;t receive the email? Check your spam folder. The link
          expires in 24 hours.
        </p>
      </div>
    </div>
  )
}
