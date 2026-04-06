import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: {
    default: 'Clinical to Code — Where Healthcare Meets Technology',
    template: '%s | Clinical to Code',
  },
  description:
    'Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clinicaltocode.com'
  ),
  openGraph: {
    title: 'Clinical to Code — Where Healthcare Meets Technology',
    description:
      'Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.',
    url: 'https://clinicaltocode.com',
    siteName: 'Clinical to Code',
    type: 'website',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}

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
