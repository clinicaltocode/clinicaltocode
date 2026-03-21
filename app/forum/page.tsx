import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { getCategories } from '@/lib/forum/queries'
import { createClient } from '@/lib/supabase/server'
import { GuidelinesBanner } from '@/components/forum/guidelines-banner'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Forum | Clinical to Code',
  description: 'Discuss clinical informatics, EHR workflows, nursing, pharmacy, and physician perspectives.',
}

export default async function ForumPage() {
  const [categories, supabase] = await Promise.all([getCategories(), createClient()])
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground mt-1">
            Clinical discussions for healthcare professionals
          </p>
        </div>
        {user ? (
          <Link href="/forum/new" className={buttonVariants()}>
            New Thread
          </Link>
        ) : (
          <Link href="/auth/login" className={buttonVariants({ variant: 'outline' })}>
            Sign in to post
          </Link>
        )}
      </div>

      <GuidelinesBanner />

      <div className="grid gap-4 mt-6">
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
