import Link from 'next/link'
import { AdSlot } from '@/components/ads/ad-slot'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'

export default function HomePage() {
  return (
    <>
      {/* Hero — full-width gradient, centered text, two CTAs */}
      <section
        className="text-white text-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '80px 20px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1
            className="font-semibold leading-tight mb-6"
            style={{ fontSize: '48px' }}
          >
            Where Healthcare Meets Technology
          </h1>
          <p className="text-xl mb-8" style={{ opacity: 0.9 }}>
            Bridging clinical expertise with healthcare IT. Real insights from
            clinicians for IT leaders.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/articles"
              className="inline-flex items-center justify-center rounded-md font-semibold min-h-[48px] px-6"
              style={{ backgroundColor: '#ffffff', color: '#0066cc' }}
            >
              Explore Articles
            </Link>
            <Link
              href="/forum"
              className="inline-flex items-center justify-center rounded-md font-semibold min-h-[48px] px-6"
              style={{
                border: '2px solid #ffffff',
                color: '#ffffff',
                backgroundColor: 'transparent',
              }}
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* Content area */}
      <main
        className="mx-auto px-5 py-12 flex-1 w-full"
        style={{ maxWidth: '1200px' }}
      >
        <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 300px' }}>
          <div>
            <h2 className="font-semibold mb-6" style={{ fontSize: '32px' }}>
              Coming Soon
            </h2>
            <p style={{ color: '#666666' }}>
              We&apos;re setting up. Check back soon — real clinical
              perspectives are on the way.
            </p>
          </div>
          <aside>
            <NewsletterSignup className="mb-6" />
            <AdSlot
              slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE ?? 'placeholder'}
              className="w-full"
            />
          </aside>
        </div>
      </main>
    </>
  )
}
