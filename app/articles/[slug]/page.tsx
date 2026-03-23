import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/fetch'
import {
  ARTICLE_BY_SLUG_QUERY,
  ALL_ARTICLE_SLUGS_QUERY,
} from '@/lib/sanity/queries'
import { ArticleBody } from '@/components/content/article-body'
import { Badge } from '@/components/ui/badge'
import { estimateReadTime } from '@/lib/read-time'
import type { PortableTextBlock } from '@portabletext/react'
import { AdSlot } from '@/components/ads/ad-slot'

// params is a Promise in Next.js 15 App Router
interface PageProps {
  params: Promise<{ slug: string }>
}

// ---------------------------------------------------------------------------
// generateStaticParams — pre-render all published articles at build time
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>({
    query: ALL_ARTICLE_SLUGS_QUERY,
    tags:  ['article'],
  })
  return slugs.map(s => ({ slug: s.slug }))
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityFetch<Article | null>({
    query:  ARTICLE_BY_SLUG_QUERY,
    params: { slug },
    tags:   [`article:${slug}`, 'article'],
  })

  if (!article) return { title: 'Article not found' }

  return {
    title:       article.title,
    description: article.excerpt ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params

  const article = await sanityFetch<Article | null>({
    query:  ARTICLE_BY_SLUG_QUERY,
    params: { slug },
    tags:   [`article:${slug}`, 'article'],
  })

  if (!article) notFound()

  const readTime   = estimateReadTime((article.body ?? []) as PortableTextBlock[])
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
  const authorLine = article.author
    ? article.author.credential
      ? `${article.author.name}, ${article.author.credential}`
      : article.author.name
    : null

  return (
    <main className="max-w-[1200px] mx-auto px-4">
      {/* Article header */}
      <div className="py-12 max-w-[720px] mx-auto">
        <Link
          href="/articles"
          aria-label="Back to all articles"
          className="text-sm text-[#666666] hover:text-primary mb-6 inline-flex items-center gap-1 min-h-[48px]"
        >
          ← All articles
        </Link>

        {article.category && (
          <div className="mb-3">
            <Badge
              variant="secondary"
              className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/10"
            >
              {article.category.title}
            </Badge>
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-semibold text-[#1a1a1a] leading-tight mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[#666666] mb-4">
          {authorLine && <span>{authorLine}</span>}
          {formattedDate && <span>{formattedDate}</span>}
          <span aria-label={`${readTime} minute read`}>{readTime} min read</span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover image */}
      {article.coverImage?.asset?.url && (
        <div className="w-full max-w-[720px] mx-auto mb-0">
          <img
            src={`${article.coverImage.asset.url}?w=1440&auto=format`}
            alt={article.coverImage.alt ?? article.title}
            className="w-full aspect-video object-cover rounded-lg my-8"
          />
        </div>
      )}

      {/* Article body */}
      {article.body && article.body.length > 0 && (
        <ArticleBody value={article.body as PortableTextBlock[]} />
      )}

      {/* Ad slot — after article body, before Forum CTA */}
      <div className="max-w-[720px] mx-auto my-8">
        <AdSlot
          slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE ?? 'placeholder'}
        />
      </div>

      {/* Forum CTA */}
      <div className="mt-12 pt-8 border-t border-[#e5e7eb] max-w-[720px] mx-auto">
        <Link
          href={`/forum?thread=${article.slug}`}
          className="inline-flex items-center min-h-[48px] text-primary font-semibold hover:underline"
        >
          Join the discussion →
        </Link>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------
interface Article {
  _id: string
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  coverImage?: {
    asset?: { url: string }
    alt?: string
    crop?: unknown
    hotspot?: unknown
  }
  category?: { title: string; slug: string }
  author?: { name: string; credential?: string }
  tags?: string[]
  body?: unknown[]
}
