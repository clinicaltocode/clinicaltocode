import Link from 'next/link'

export const metadata = {
  title: 'Subscribed | Clinical to Code',
}

export default function NewsletterConfirmedPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-16">
      <div className="max-w-[480px] text-center">
        <div className="w-14 h-14 rounded-full bg-[#1a6847]/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-[#1a6847]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1a1a1a] mb-4">
          You&apos;re in.
        </h1>
        <p className="text-[#6b6b6b] text-lg leading-relaxed mb-8">
          Welcome to the Clinical to Code Weekly. You&apos;ll get our best articles
          and community highlights in your inbox every week.
        </p>
        <Link
          href="/articles"
          className="inline-flex items-center justify-center rounded-md font-semibold min-h-[48px] px-6 bg-[#1a6847] text-white hover:bg-[#155a3c] transition-colors"
        >
          Read the latest articles
        </Link>
      </div>
    </div>
  )
}
