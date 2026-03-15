import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clinical to Code — Where Healthcare Meets Technology',
  description:
    'Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.',
  openGraph: {
    title: 'Clinical to Code — Where Healthcare Meets Technology',
    description:
      'Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.',
    url: 'https://clinicaltocode.com',
    siteName: 'Clinical to Code',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
