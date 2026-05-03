import Link from 'next/link'

export const metadata = { title: 'Page Not Found' }

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
      <p className="text-sm uppercase tracking-wider text-[#6b6b6b] mb-4">Page not found</p>
      <h1 className="font-serif text-6xl font-bold text-[#1a1a1a] mb-6">404</h1>
      <p className="text-[#6b6b6b] mb-8 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="text-sm font-semibold text-primary hover:underline">Go home</Link>
        <span className="text-[#e0dcd5]">|</span>
        <Link href="/articles" className="text-sm font-semibold text-primary hover:underline">Browse articles</Link>
      </div>
    </div>
  )
}
