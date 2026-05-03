import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { sanityFetch } from '@/lib/sanity/fetch'
import { ARTICLE_BY_SLUG_QUERY, ALL_ARTICLE_SLUGS_QUERY } from '@/lib/sanity/queries'
import type { SanityArticle } from '@/lib/sanity/types'
import { ArticleBody } from '@/components/content/article-body'
import { estimateReadTime } from '@/lib/read-time'
import type { PortableTextBlock } from '@portabletext/react'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'
import { ShareButtons } from '@/components/content/share-buttons'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>({ query: ALL_ARTICLE_SLUGS_QUERY, tags: ['article'] })
  return slugs.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityFetch<SanityArticle | null>({ query: ARTICLE_BY_SLUG_QUERY, params: { slug }, tags: [`article:${slug}`, 'article'] })
  if (!article) return { title: 'Article not found' }
  return { title: article.title, description: article.excerpt ?? undefined }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await sanityFetch<SanityArticle | null>({ query: ARTICLE_BY_SLUG_QUERY, params: { slug }, tags: [`article:${slug}`, 'article'] })
  if (!article) notFound()

  const readTime = estimateReadTime((article.body ?? []) as PortableTextBlock[])
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const authorLine = article.author
    ? article.author.credential ? `${article.author.name}, ${article.author.credential}` : article.author.name
    : null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clinicaltocode.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.publishedAt,
    url: `${siteUrl}/articles/${article.slug}`,
    ...(article.coverImage?.asset?.url && { image: `${article.coverImage.asset.url}?w=1200&auto=format` }),
    ...(article.author && {
      author: {
        '@type': 'Person',
        name: article.author.name,
        ...(article.author.credential && { jobTitle: article.author.credential }),
      },
    }),
    publisher: { '@type': 'Organization', name: 'Clinical to Code', url: siteUrl },
    wordCount: readTime * 200,
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

        <div className="mt-6 flex justify-center">
          <ShareButtons url={`${siteUrl}/articles/${article.slug}`} title={article.title} />
        </div>
      </div>

      {/* Cover image — full width */}
      {article.coverImage?.asset?.url && (
        <div className="max-w-[900px] mx-auto mb-12 relative aspect-[2/1]">
          <Image
            src={`${article.coverImage.asset.url}?w=1800&auto=format`}
            alt={article.coverImage.alt ?? article.title}
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article body — first half */}
      {article.body && article.body.length > 0 && (() => {
        const blocks = article.body as PortableTextBlock[]
        const midpoint = Math.floor(blocks.length * 0.6)
        const firstHalf = blocks.slice(0, midpoint)
        const secondHalf = blocks.slice(midpoint)
        return (
          <>
            <ArticleBody value={firstHalf} />
            {blocks.length > 6 && (
              <div className="max-w-[680px] mx-auto my-10">
                <NewsletterSignup variant="inline" />
              </div>
            )}
            <ArticleBody value={secondHalf} />
          </>
        )
      })()}

      {/* Tags + share */}
      {article.tags && article.tags.length > 0 && (
        <div className="max-w-[680px] mx-auto mt-12 pt-8 border-t border-[#e0dcd5]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="bg-[#f4f1ec] text-[#6b6b6b] text-xs font-medium px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <ShareButtons url={`${siteUrl}/articles/${article.slug}`} title={article.title} />
          </div>
        </div>
      )}

      {/* Author card */}
      {article.author && (
        <div className="max-w-[680px] mx-auto mt-12 pt-8 border-t border-[#e0dcd5]">
          <div className="flex items-start gap-4">
            {article.author.avatarUrl ? (
              <Image
                src={`${article.author.avatarUrl}?w=96&h=96&auto=format`}
                alt={article.author.name}
                width={48}
                height={48}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-[#e8e3dc] shrink-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-[#6b6b6b]">
                  {article.author.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </span>
              </div>
            )}
            <div>
              <p className="font-serif font-bold text-[#1a1a1a]">
                {article.author.name}
                {article.author.credential && <span className="text-[#6b6b6b] font-normal">, {article.author.credential}</span>}
              </p>
              {article.author.bio && (
                <p className="text-sm text-[#6b6b6b] mt-1 leading-relaxed">{article.author.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="max-w-lg mx-auto my-16">
        <NewsletterSignup />
      </div>

      {/* Forum CTA */}
      <div className="max-w-[680px] mx-auto pb-12 text-center">
        <Link href="/forum" className="text-[#1a6847] font-semibold hover:underline">
          Discuss this in the forum &rarr;
        </Link>
      </div>
    </main>
  )
}
