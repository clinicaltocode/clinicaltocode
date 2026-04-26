import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ThreadCard } from '@/components/forum/thread-card'
import { getCategories, getThreadsByCategory } from '@/lib/forum/queries'
import { getProfilesByIds } from '@/lib/profile/queries'

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categorySlug } = await params
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === categorySlug)
  return {
    title: category ? `${category.title} | Forum | Clinical to Code` : 'Forum | Clinical to Code',
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === categorySlug)

  if (!category) notFound()

  const threads = await getThreadsByCategory(categorySlug)

  const authorIds = [...new Set(threads.map((t) => t.author_id).filter(Boolean))] as string[]
  const profilesById = await getProfilesByIds(authorIds)

  return (
    <main className="mx-auto px-6 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <nav className="text-sm text-[#6b6b6b] mb-1">
            <Link href="/forum" className="hover:text-[#1a1a1a] transition-colors">Forum</Link>
            {' / '}
            <span>{category.title}</span>
          </nav>
          <h1 className="font-serif text-2xl font-bold text-[#1a1a1a]">{category.title}</h1>
          {category.description && (
            <p className="text-[#6b6b6b] text-sm mt-1">{category.description}</p>
          )}
        </div>
        <Link href={`/forum/new?category=${category.id}`} className="bg-[#1a6847] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#134e35] transition-colors">
          New Thread
        </Link>
      </div>

      <div className="grid gap-3">
        {threads.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            categorySlug={categorySlug}
            author={thread.author_id ? profilesById[thread.author_id] ?? null : null}
          />
        ))}
      </div>

      {threads.length === 0 && (
        <div className="text-center py-12 text-[#6b6b6b]">
          <p>No threads yet. Be the first to start a discussion!</p>
          <Link href={`/forum/new?category=${category.id}`} className="inline-block mt-4 bg-[#1a6847] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#134e35] transition-colors">
            Start a Thread
          </Link>
        </div>
      )}
    </main>
  )
}
