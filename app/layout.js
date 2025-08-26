export const metadata = {
  title: 'Clinical to Code - Where Healthcare Meets Technology',
  description: 'Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.',
  keywords: 'healthcare IT, clinical informatics, EHR optimization, nurse perspective, physician technology',
  openGraph: {
    title: 'Clinical to Code',
    description: 'Where Healthcare Experience Meets IT Innovation',
    url: 'https://clinicaltocode.com',
    siteName: 'Clinical to Code',
    images: [
      {
        url: 'https://clinicaltocode.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinical to Code',
    description: 'Where Healthcare Experience Meets IT Innovation',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
        {/* Google AdSense - Add when ready */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
          crossOrigin="anonymous"
        /> */}
      </head>
      <body>{children}</body>
    </html>
  )
}
