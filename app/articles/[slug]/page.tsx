import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/fetch'
import { ARTICLE_BY_SLUG_QUERY, ALL_ARTICLE_SLUGS_QUERY } from '@/lib/sanity/queries'
import { ArticleBody } from '@/components/content/article-body'
import { estimateReadTime } from '@/lib/read-time'
import type { PortableTextBlock } from '@portabletext/react'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>({ query: ALL_ARTICLE_SLUGS_QUERY, tags: ['article'] })
  return slugs.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityFetch<Article | null>({ query: ARTICLE_BY_SLUG_QUERY, params: { slug }, tags: [`article:${slug}`, 'article'] })
  if (!article) return { title: 'Article not found' }
  return { title: article.title, description: article.excerpt ?? undefined }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await sanityFetch<Article | null>({ query: ARTICLE_BY_SLUG_QUERY, params: { slug }, tags: [`article:${slug}`, 'article'] })
  if (!article) notFound()

  const readTime = estimateReadTime((article.body ?? []) as PortableTextBlock[])
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const authorLine = article.author
    ? article.author.credential ? `${article.author.name}, ${article.author.credential}` : article.author.name
    : null

  return (
    <main className="max-w-[1200px] mx-auto px-6">
      {/* Article header */}
      <div className="py-16 max-w-[680px] mx-auto text-center">
        <Link href="/articles" className="text-sm text-[#6b6b6b] hover:text-primary mb-6 inline-block">
          &larr; All articles
        </Link>

        {article.category && (
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {article.category.title}
            </span>
          </div>
        )}

        <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#1a1a1a] leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[#6b6b6b]">
          {authorLine && <span>{authorLine}</span>}
          {authorLine && <span>&middot;</span>}
          <span>{formattedDate}</span>
          <span>&middot;</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* Cover image — full width */}
      {article.coverImage?.asset?.url && (
        <div className="max-w-[900px] mx-auto mb-12">
          <img
            src={`${article.coverImage.asset.url}?w=1800&auto=format`}
            alt={article.coverImage.alt ?? article.title}
            className="w-full aspect-[2/1] object-cover"
          />
        </div>
      )}

      {/* Article body */}
      {article.body && article.body.length > 0 && (
        <ArticleBody value={article.body as PortableTextBlock[]} />
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="max-w-[680px] mx-auto mt-12 pt-8 border-t border-[#e0dcd5]">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="bg-[#f4f1ec] text-[#6b6b6b] text-xs font-medium px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="max-w-lg mx-auto my-16">
        <NewsletterSignup />
      </div>

      {/* Forum CTA */}
      <div className="max-w-[680px] mx-auto pb-12 text-center">
        <Link href={`/forum?thread=${article.slug}`} className="text-primary font-semibold hover:underline">
          Join the discussion &rarr;
        </Link>
      </div>
    </main>
  )
}

interface Article {
  _id: string; title: string; slug: string; publishedAt: string; excerpt?: string
  coverImage?: { asset?: { url: string }; alt?: string }
  category?: { title: string; slug: string }; author?: { name: string; credential?: string }
  tags?: string[]; body?: unknown[]
}
