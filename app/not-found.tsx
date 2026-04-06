import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-20">
      <h1 className="text-6xl font-semibold text-primary mb-4">404</h1>
      <p className="text-lg text-[#666666] mb-8 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md font-semibold min-h-[48px] px-6 bg-primary text-white"
        >
          Go home
        </Link>
        <Link
          href="/articles"
          className="inline-flex items-center justify-center rounded-md font-semibold min-h-[48px] px-6 border border-[#e5e7eb] text-[#666666] hover:text-primary"
        >
          Browse articles
        </Link>
      </div>
    </div>
  )
}
