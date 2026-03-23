import Link from 'next/link'

export const metadata = {
  title: 'Subscribed | Clinical to Code',
}

export default function NewsletterConfirmedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="max-w-[480px] text-center">
        <h1
          className="font-semibold mb-4"
          style={{ fontSize: '28px', color: '#1a1a1a' }}
        >
          You&apos;re subscribed
        </h1>
        <p
          className="mb-8"
          style={{ fontSize: '16px', color: '#666666', lineHeight: '1.6' }}
        >
          Welcome to Clinical to Code. You&apos;ll receive new articles and
          community highlights in your inbox.
        </p>
        <Link
          href="/articles"
          className="inline-flex items-center justify-center rounded-md font-semibold min-h-[48px] px-6"
          style={{ backgroundColor: '#0066cc', color: '#ffffff' }}
        >
          Read the latest articles
        </Link>
      </div>
    </div>
  )
}
