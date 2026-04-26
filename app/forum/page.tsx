import Link from 'next/link'
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
    <main className="mx-auto px-6 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1a1a1a]">Forum</h1>
          <p className="text-[#6b6b6b] mt-1">
            Clinical discussions for healthcare professionals
          </p>
        </div>
        {user ? (
          <Link href="/forum/new" className="bg-[#1a6847] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#134e35] transition-colors">
            New Thread
          </Link>
        ) : (
          <Link href="/auth/login" className="border border-[#e0dcd5] text-[#1a1a1a] text-sm font-medium px-4 py-2 rounded-md hover:bg-[#f4f1ec] transition-colors">
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
            className="block border border-[#e0dcd5] rounded-lg p-5 hover:bg-[#faf8f5] transition-colors"
          >
            <h2 className="font-serif text-lg font-semibold text-[#1a1a1a]">{category.title}</h2>
            {category.description && (
              <p className="text-sm text-[#6b6b6b] mt-1">{category.description}</p>
            )}
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-[#6b6b6b] py-12">
          No categories found. Run the database migration to seed categories.
        </p>
      )}
    </main>
  )
}
