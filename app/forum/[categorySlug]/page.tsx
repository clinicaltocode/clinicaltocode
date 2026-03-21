import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { ThreadCard } from '@/components/forum/thread-card'
import { getCategories, getThreadsByCategory } from '@/lib/forum/queries'

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

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <nav className="text-sm text-muted-foreground mb-1">
            <Link href="/forum" className="hover:text-foreground">Forum</Link>
            {' / '}
            <span>{category.title}</span>
          </nav>
          <h1 className="text-2xl font-bold">{category.title}</h1>
          {category.description && (
            <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
          )}
        </div>
        <Link href={`/forum/new?category=${category.id}`} className={buttonVariants()}>
          New Thread
        </Link>
      </div>

      <div className="grid gap-3">
        {threads.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            categorySlug={categorySlug}
          />
        ))}
      </div>

      {threads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No threads yet. Be the first to start a discussion!</p>
          <Link href={`/forum/new?category=${category.id}`} className={`${buttonVariants()} mt-4`}>
            Start a Thread
          </Link>
        </div>
      )}
    </main>
  )
}
