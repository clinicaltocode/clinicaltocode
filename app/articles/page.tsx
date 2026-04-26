import type { Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity/fetch'
import { ARTICLES_QUERY, ARTICLES_COUNT_QUERY, CATEGORIES_QUERY } from '@/lib/sanity/queries'
import type { SanityArticle, SanityCategory } from '@/lib/sanity/types'
import { ArticleCard } from '@/components/content/article-card'
import { CategoryFilter } from '@/components/content/category-filter'
import { PaginationControls } from '@/components/content/pagination-controls'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Clinical perspectives on healthcare IT from nurses, physicians, and health IT professionals.',
}

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

const PAGE_SIZE = 10

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { page = '1', category } = await searchParams
  const pageNumber = Math.max(1, parseInt(page, 10))
  const start = (pageNumber - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1
  const categoryParam = category ?? null

  const [articles, total, categories] = await Promise.all([
    sanityFetch<SanityArticle[]>({ query: ARTICLES_QUERY, params: { start, end, category: categoryParam }, tags: ['article', 'category'] }),
    sanityFetch<number>({ query: ARTICLES_COUNT_QUERY, params: { category: categoryParam }, tags: ['article', 'category'] }),
    sanityFetch<SanityCategory[]>({ query: CATEGORIES_QUERY, tags: ['category'] }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-[#1a1a1a]">Articles</h1>
        <CategoryFilter categories={categories} activeCategory={category ?? null} />
      </div>

      {articles.length === 0 ? (
        <p className="text-[#6b6b6b] text-sm py-12 text-center">No articles yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map(article => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {totalPages > 1 && <PaginationControls currentPage={pageNumber} totalPages={totalPages} />}
    </main>
  )
}

