'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFilterProps {
  categories: { title: string; slug: string }[]
  activeCategory: string | null
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) { params.set('category', slug) } else { params.delete('category') }
    params.delete('page')
    router.push(`/articles?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 flex-wrap mt-6" role="group" aria-label="Filter by category">
      <button
        onClick={() => handleSelect(null)}
        aria-pressed={activeCategory === null}
        className={`px-4 py-2 text-sm transition-colors border-b-2 ${
          activeCategory === null
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.slug}
          onClick={() => handleSelect(cat.slug)}
          aria-pressed={activeCategory === cat.slug}
          className={`px-4 py-2 text-sm transition-colors border-b-2 ${
            activeCategory === cat.slug
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]'
          }`}
        >
          {cat.title}
        </button>
      ))}
    </div>
  )
}
