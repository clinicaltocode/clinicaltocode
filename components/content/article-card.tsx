import Link from 'next/link'

interface ArticleCardProps {
  article: {
    _id: string
    title: string
    slug: string
    publishedAt: string
    excerpt?: string
    coverImage?: { asset?: { url: string }; alt?: string }
    category?: { title: string; slug: string }
    author?: { name: string; credential?: string }
  }
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
        <div className="aspect-[3/2] overflow-hidden bg-[#f4f1ec] mb-4">
          <img
            src={`${article.coverImage.asset.url}?w=720&auto=format`}
            alt={article.coverImage.alt ?? article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[3/2] bg-[#f4f1ec] mb-4" />
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
