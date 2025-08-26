import './globals.css'

export const metadata = {
  title: 'Clinical to Code - Where Healthcare Meets Technology',
  description: 'Bridging clinical expertise with healthcare IT',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
