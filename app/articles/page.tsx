import type { Metadata } from 'next'
import { sanityFetch } from '@/lib/sanity/fetch'
import { ARTICLES_QUERY, ARTICLES_COUNT_QUERY, CATEGORIES_QUERY } from '@/lib/sanity/queries'
import { ArticleCard } from '@/components/content/article-card'
import { CategoryFilter } from '@/components/content/category-filter'
import { PaginationControls } from '@/components/content/pagination-controls'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Clinical perspectives on healthcare IT from nurses, physicians, and health IT professionals.',
}

// searchParams is a Promise in Next.js 15 — must be awaited
interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

const PAGE_SIZE = 10

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { page = '1', category } = await searchParams

  const pageNumber = Math.max(1, parseInt(page, 10))
  const start      = (pageNumber - 1) * PAGE_SIZE
  const end        = start + PAGE_SIZE - 1   // inclusive in GROQ .. notation

  // $category null means "all categories" — the GROQ query handles this case
  const categoryParam = category ?? null

  const [articles, total, categories] = await Promise.all([
    sanityFetch<Article[]>({
      query:  ARTICLES_QUERY,
      params: { start, end, category: categoryParam },
      tags:   ['article', 'category'],
    }),
    sanityFetch<number>({
      query:  ARTICLES_COUNT_QUERY,
      params: { category: categoryParam },
      tags:   ['article', 'category'],
    }),
    sanityFetch<Category[]>({
      query: CATEGORIES_QUERY,
      tags:  ['category'],
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#1a1a1a]">Articles</h1>
        <CategoryFilter
          categories={categories}
          activeCategory={category ?? null}
        />
      </div>

      {/* Article grid */}
      {articles.length === 0 ? (
        <p className="text-[#666666] text-sm">No articles yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map(article => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls currentPage={pageNumber} totalPages={totalPages} />
      )}
    </main>
  )
}

// ---------------------------------------------------------------------------
// Local types — defined here so the page compiles without a shared types file
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
}

interface Category {
  title: string
  slug: string
}
