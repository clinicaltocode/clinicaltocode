import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
