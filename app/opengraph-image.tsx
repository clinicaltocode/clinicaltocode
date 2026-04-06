import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Clinical to Code — Where Healthcare Meets Technology'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#faf9f7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          borderTop: '8px solid #1a6847',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', lineHeight: 1.1, fontFamily: 'Georgia, serif' }}>
          Clinical to Code
        </div>
        <div style={{ fontSize: 28, color: '#6b6b6b', textAlign: 'center', marginTop: 24, letterSpacing: '0.05em' }}>
          WHERE HEALTHCARE MEETS TECHNOLOGY
        </div>
      </div>
    ),
    { ...size }
  )
}
