import type { Metadata } from 'next'
import Script from 'next/script'
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
      <body className="antialiased">
        {children}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  )
}
