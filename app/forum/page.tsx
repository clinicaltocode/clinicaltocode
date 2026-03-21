import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { getCategories } from '@/lib/forum/queries'

export const metadata = {
  title: 'Forum | Clinical to Code',
  description: 'Discuss clinical informatics, EHR workflows, nursing, pharmacy, and physician perspectives.',
}

export default async function ForumPage() {
  const categories = await getCategories()

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground mt-1">
            Clinical discussions for healthcare professionals
          </p>
        </div>
        <Link href="/forum/new" className={buttonVariants()}>
          New Thread
        </Link>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/forum/${category.slug}`}
            className="block border border-border rounded-lg p-5 hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-lg font-semibold">{category.title}</h2>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            )}
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No categories found. Run the database migration to seed categories.
        </p>
      )}
    </main>
  )
}
