// Server Component — no 'use client' directive needed
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface ArticleCardProps {
  article: {
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
  }
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const authorLine = article.author
    ? article.author.credential
      ? `${article.author.name}, ${article.author.credential}`
      : article.author.name
    : null

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block group rounded-lg border border-[#e5e7eb] bg-white shadow-sm hover:border-primary/30 hover:shadow-md transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={article.title}
    >
      {/* Cover image */}
      <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-100">
        {article.coverImage?.asset?.url ? (
          <img
            src={`${article.coverImage.asset.url}?w=720&auto=format`}
            alt={article.coverImage.alt ?? article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" aria-hidden="true" />
        )}
      </div>

      {/* Card body */}
      <div className="p-6">
        {article.category && (
          <Badge variant="secondary" className="mb-2 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/10">
            {article.category.title}
          </Badge>
        )}
        <h2 className="text-xl font-semibold text-[#1a1a1a] mt-2 line-clamp-2 leading-snug">
          {article.title}
        </h2>
        {(authorLine || formattedDate) && (
          <p className="text-sm text-[#666666] mt-2">
            {authorLine && <span>{authorLine}</span>}
            {authorLine && formattedDate && <span> · </span>}
            {formattedDate && <span>{formattedDate}</span>}
          </p>
        )}
        {article.excerpt && (
          <p className="text-sm text-[#666666] mt-2 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}
