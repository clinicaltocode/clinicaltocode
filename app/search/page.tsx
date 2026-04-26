import type { Metadata } from 'next'
import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/fetch'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search articles and forum discussions on Clinical to Code.',
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

interface ArticleResult {
  _id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt: string
  category?: { title: string }
}

interface ThreadResult {
  id: string
  title: string
  slug: string
  body_preview: string | null
  created_at: string
  forum_categories: { title: string; slug: string } | { title: string; slug: string }[] | null
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  let articles: ArticleResult[] = []
  let threads: ThreadResult[] = []

  if (query.length >= 2) {
    const [articleResults, supabase] = await Promise.all([
      sanityFetch<ArticleResult[]>({
        query: `*[_type == "article" && !(_id in path("drafts.**")) && defined(publishedAt) && (title match $q || excerpt match $q)]
                | order(publishedAt desc) [0..19] {
                  _id, title, "slug": slug.current, excerpt, publishedAt,
                  "category": category->{ title }
                }`,
        params: { q: `${query}*` },
        tags: ['article'],
      }),
      createClient(),
    ])

    articles = articleResults

    const { data: threadResults } = await supabase
      .from('forum_threads')
      .select('id, title, slug, body_preview, created_at, forum_categories(title, slug)')
      .or(`title.ilike.%${query}%,body_preview.ilike.%${query}%`)
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .limit(20)

    threads = (threadResults ?? []).map((t) => ({
      ...t,
      forum_categories: Array.isArray(t.forum_categories) ? t.forum_categories[0] ?? null : t.forum_categories,
    })) as ThreadResult[]
  }

  const hasResults = articles.length > 0 || threads.length > 0

  return (
    <main className="bg-[#faf8f5] min-h-[60vh]">
      <div className="mx-auto px-6 max-w-[800px] py-12">
        <h1 className="font-serif text-3xl font-bold text-[#1a1a1a] mb-6">Search</h1>

        <form action="/search" method="GET" className="mb-10">
          <div className="flex gap-2">
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search articles and discussions..."
              className="flex-1 border border-[#e0dcd5] rounded-md px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a6847]"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#1a6847] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#134e35] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {query && !hasResults && (
          <p className="text-[#6b6b6b] text-center py-12">
            No results found for &ldquo;{query}&rdquo;. Try a different search term.
          </p>
        )}

        {articles.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mb-4">Articles</h2>
            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article._id}
                  href={`/articles/${article.slug}`}
                  className="block border border-[#e0dcd5] rounded-lg p-4 bg-white hover:bg-[#faf8f5] transition-colors"
                >
                  {article.category && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#1a6847]">
                      {article.category.title}
                    </span>
                  )}
                  <h3 className="font-serif text-lg font-bold text-[#1a1a1a] mt-1">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-sm text-[#6b6b6b] mt-1 line-clamp-2">{article.excerpt}</p>
                  )}
                  <p className="text-xs text-[#999] mt-2">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {threads.length > 0 && (
          <section>
            <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mb-4">Discussions</h2>
            <div className="space-y-4">
              {threads.map((thread) => {
                const cat = Array.isArray(thread.forum_categories)
                  ? thread.forum_categories[0]
                  : thread.forum_categories
                return (
                  <Link
                    key={thread.id}
                    href={`/forum/${cat?.slug ?? 'general'}/${thread.slug}`}
                    className="block border border-[#e0dcd5] rounded-lg p-4 bg-white hover:bg-[#faf8f5] transition-colors"
                  >
                    <h3 className="font-serif text-lg font-bold text-[#1a1a1a]">{thread.title}</h3>
                    {thread.body_preview && (
                      <p className="text-sm text-[#6b6b6b] mt-1 line-clamp-2">{thread.body_preview}</p>
                    )}
                    <p className="text-xs text-[#999] mt-2">
                      {cat?.title && <>{cat.title} · </>}
                      {new Date(thread.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
