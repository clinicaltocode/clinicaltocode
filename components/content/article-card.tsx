import Link from 'next/link'
import Image from 'next/image'
import type { SanityArticle } from '@/lib/sanity/types'

interface ArticleCardProps {
  article: SanityArticle
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`/articles/${article.slug}`} className="group block" aria-label={article.title}>
      {article.coverImage?.asset?.url ? (
        <div className="aspect-[3/2] overflow-hidden bg-[#f4f1ec] mb-4 relative">
          <Image
            src={`${article.coverImage.asset.url}?w=720&auto=format`}
            alt={article.coverImage.alt ?? article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[3/2] bg-[#f4f1ec] mb-4 relative overflow-hidden">
          <Image src="/images/article-placeholder.svg" alt="" fill className="object-cover" />
        </div>
      )}
      {article.category && (
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {article.category.title}
        </span>
      )}
      <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mt-1 leading-snug group-hover:text-primary transition-colors">
        {article.title}
      </h2>
      <p className="text-sm text-[#999] mt-2">
        {article.author?.name}{article.author?.credential && `, ${article.author.credential}`}
        {' '}&middot; {formattedDate}
      </p>
      {article.excerpt && (
        <p className="text-[#6b6b6b] text-sm mt-2 line-clamp-2 leading-relaxed">{article.excerpt}</p>
      )}
    </Link>
  )
}
