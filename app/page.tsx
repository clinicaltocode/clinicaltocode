import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/fetch'
import { ARTICLES_QUERY } from '@/lib/sanity/queries'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'

interface Article {
  _id: string
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  coverImage?: { asset?: { url: string }; alt?: string }
  category?: { title: string; slug: string }
  author?: { name: string; credential?: string }
}

export default async function HomePage() {
  const articles = await sanityFetch<Article[]>({
    query: ARTICLES_QUERY,
    params: { start: 0, end: 5, category: null },
    tags: ['article'],
  })

  const [featured, ...rest] = articles

  return (
    <>
      {/* Hero masthead — dark green */}
      <div className="bg-[#1a6847] text-white">
        <div className="mx-auto px-6 max-w-[1200px] py-16 md:py-24 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-4">Where Healthcare Meets Technology</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Real insights from clinicians,<br className="hidden md:block" /> for those building the future of care.
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Bridging clinical expertise with healthcare IT — perspectives you won&apos;t find in a spec sheet.
          </p>
        </div>
      </div>

      {/* Warm tinted content area */}
      <main className="bg-[#faf8f5]">
        <div className="mx-auto px-6 max-w-[1200px] py-12">
          {featured ? (
            <>
              {/* Featured article — large */}
              <article className="mb-16">
                <Link href={`/articles/${featured.slug}`} className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {featured.coverImage?.asset?.url ? (
                    <div className="aspect-[3/2] overflow-hidden rounded-lg bg-[#f4f1ec]">
                      <img
                        src={`${featured.coverImage.asset.url}?w=800&auto=format`}
                        alt={featured.coverImage.alt ?? featured.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/2] rounded-lg bg-[#e8e4dd]" />
                  )}
                  <div>
                    {featured.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#1a6847]">{featured.category.title}</span>
                    )}
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a] leading-tight mt-2 group-hover:text-[#1a6847] transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-[#5a5a5a] mt-4 text-lg leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    )}
                    <p className="text-sm text-[#999] mt-4">
                      {featured.author && <>{featured.author.name}{featured.author.credential && `, ${featured.author.credential}`} &middot; </>}
                      {new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              </article>

              {/* Accent divider */}
              <div className="border-t-2 border-[#1a6847]/20 mb-12" />

              {/* Label */}
              <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-8">Latest Articles</h2>

              {/* Supporting articles grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {rest.map(article => (
                    <article key={article._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <Link href={`/articles/${article.slug}`} className="group block">
                        {article.coverImage?.asset?.url ? (
                          <div className="aspect-[3/2] overflow-hidden bg-[#f4f1ec]">
                            <img
                              src={`${article.coverImage.asset.url}?w=480&auto=format`}
                              alt={article.coverImage.alt ?? article.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="aspect-[3/2] bg-[#e8e4dd]" />
                        )}
                        <div className="p-5">
                          {article.category && (
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#1a6847]">{article.category.title}</span>
                          )}
                          <h3 className="font-serif text-xl font-bold text-[#1a1a1a] leading-snug mt-1 group-hover:text-[#1a6847] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-[#999] mt-2">
                            {article.author?.name} &middot; {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-4">Coming Soon</h2>
              <p className="text-[#6b6b6b]">We&apos;re preparing our first articles. Check back soon.</p>
            </div>
          )}
        </div>

        {/* Newsletter CTA — green tinted band */}
        <div className="bg-[#134e35] text-white py-14">
          <div className="max-w-lg mx-auto px-6">
            <NewsletterSignup variant="dark" />
          </div>
        </div>
      </main>
    </>
  )
}
