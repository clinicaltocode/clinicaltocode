import type { Metadata } from 'next'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'

export const metadata: Metadata = {
  title: 'Newsletter — Clinical to Code',
  description: 'Get weekly clinical insights on healthcare IT, EHR workflows, and informatics careers. Written by clinicians, for people building the future of care.',
}

export default function NewsletterPage() {
  return (
    <main className="bg-[#faf8f5]">
      <div className="bg-[#1a6847] text-white">
        <div className="mx-auto px-6 max-w-[600px] py-16 md:py-24 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-4">The Clinical to Code Weekly</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight">
            Healthcare IT insights that actually come from the bedside.
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
            Every week, we send one email with the best clinical perspectives on EHR
            workflows, informatics careers, patient safety, and healthcare technology.
            Written by clinicians. No vendor pitches. No fluff.
          </p>
        </div>
      </div>

      <div className="mx-auto px-6 max-w-[480px] -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <NewsletterSignup />
        </div>
      </div>

      <div className="mx-auto px-6 max-w-[600px] py-16">
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-6 text-center">What subscribers get</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#1a6847]/10 flex items-center justify-center text-[#1a6847] font-bold text-sm">1</div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a]">Top article of the week</h3>
              <p className="text-[#6b6b6b] text-sm mt-1">Our best piece — deep dives on EHR optimization, clinical decision support, or career transitions from bedside to IT.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#1a6847]/10 flex items-center justify-center text-[#1a6847] font-bold text-sm">2</div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a]">Quick links worth reading</h3>
              <p className="text-[#6b6b6b] text-sm mt-1">Curated industry news, research, and resources — the stuff we&apos;d share with a colleague over coffee.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#1a6847]/10 flex items-center justify-center text-[#1a6847] font-bold text-sm">3</div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a]">Community highlights</h3>
              <p className="text-[#6b6b6b] text-sm mt-1">The best forum discussions, reader questions, and conversations happening in the Clinical to Code community.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#e0dcd5] text-center">
          <p className="text-sm text-[#6b6b6b]">
            Sent weekly. Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </div>
    </main>
  )
}
