import { ImageResponse } from 'next/og'
import { sanityFetch } from '@/lib/sanity/fetch'
import { ARTICLE_BY_SLUG_QUERY } from '@/lib/sanity/queries'

export const alt = 'Article cover image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Article {
  title: string
  category?: { title: string }
  author?: { name: string; credential?: string }
  coverImage?: { asset?: { url: string } }
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await sanityFetch<Article | null>({
    query: ARTICLE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`article:${slug}`, 'article'],
  })

  if (!article) {
    return new ImageResponse(
      (
        <div style={{ background: '#faf9f7', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#1a1a1a' }}>Clinical to Code</div>
        </div>
      ),
      { ...size }
    )
  }

  // If the article has a cover image, use it directly as the OG image
  const coverImageUrl = article.coverImage?.asset?.url
  if (coverImageUrl) {
    const imageUrl = `${coverImageUrl}?w=1200&h=630&fit=crop&auto=format`
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ),
      { ...size }
    )
  }

  // Fallback: branded text card for articles without a cover image
  const authorText = article.author
    ? article.author.credential
      ? `${article.author.name}, ${article.author.credential}`
      : article.author.name
    : null

  return new ImageResponse(
    (
      <div
        style={{
          background: '#faf9f7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          borderTop: '8px solid #1a6847',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {article.category && (
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1a6847', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {article.category.title}
            </div>
          )}
          <div style={{ fontSize: 52, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'Georgia, serif', maxHeight: '320px', overflow: 'hidden' }}>
            {article.title}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 22, color: '#6b6b6b' }}>
            {authorText}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
            Clinical to Code
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
