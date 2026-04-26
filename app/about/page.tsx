import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Clinical to Code — bridging clinical expertise with healthcare technology.',
}

export default function AboutPage() {
  return (
    <main className="bg-[#faf8f5]">
      <div className="mx-auto px-6 max-w-[680px] py-16">
        <h1 className="font-serif text-4xl font-bold text-[#1a1a1a] mb-6">About Clinical to Code</h1>

        <div className="space-y-6 text-lg leading-[1.8] text-[#1a1a1a]">
          <p>
            Clinical to Code exists because the people building healthcare technology and the
            people using it rarely get to hear from each other directly.
          </p>
          <p>
            We publish articles and host discussions from clinicians — nurses, physicians,
            pharmacists, and other healthcare professionals — who work at the intersection
            of patient care and technology. Their perspectives are shaped by what actually
            happens at the bedside, in the clinic, and across health systems.
          </p>
          <p>
            Our audience includes health IT leaders, EHR analysts, clinical informaticists,
            product teams building for healthcare, and clinicians exploring technology roles.
            If you&apos;re making decisions about healthcare technology, the clinical voice
            should be part of that conversation.
          </p>
        </div>

        <div className="border-t-2 border-[#1a6847]/20 my-12" />

        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-4">What we cover</h2>
        <ul className="space-y-3 text-lg leading-[1.8] text-[#1a1a1a]">
          <li><strong>EHR workflows</strong> — what works, what doesn&apos;t, and why it matters for patient safety</li>
          <li><strong>Clinical informatics</strong> — bridging the gap between clinical practice and IT implementation</li>
          <li><strong>Career transitions</strong> — from bedside to healthcare IT, and what clinicians bring to the table</li>
          <li><strong>Technology adoption</strong> — real stories about rolling out new tools in clinical environments</li>
        </ul>

        <div className="border-t-2 border-[#1a6847]/20 my-12" />

        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-4">Get involved</h2>
        <div className="space-y-6 text-lg leading-[1.8] text-[#1a1a1a]">
          <p>
            Clinical to Code is a community as much as a publication. You can participate by
            joining discussions in the{' '}
            <Link href="/forum" className="text-[#1a6847] hover:underline">forum</Link>,
            subscribing to our newsletter, or reaching out if you&apos;re interested in
            contributing an article.
          </p>
          <p>
            Questions, feedback, or pitches:{' '}
            <a href="mailto:hello@clinicaltocode.com" className="text-[#1a6847] hover:underline">
              hello@clinicaltocode.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
