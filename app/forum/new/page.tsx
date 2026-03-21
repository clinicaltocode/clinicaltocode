import { redirect } from 'next/navigation'
import { getCategories } from '@/lib/forum/queries'
import { createClient } from '@/lib/supabase/server'
import { NewThreadForm } from './new-thread-form'

interface NewThreadPageProps {
  searchParams: Promise<{ category?: string }>
}

export const metadata = { title: 'New Thread | Clinical to Code' }

export default async function NewThreadPage({ searchParams }: NewThreadPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { category } = await searchParams
  const categories = await getCategories()

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Start a New Thread</h1>
      <NewThreadForm categories={categories} defaultCategoryId={category} />
    </main>
  )
}
