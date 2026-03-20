'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  title: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string | null
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    // Reset to page 1 when changing category filter
    params.delete('page')
    router.push(`/articles?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap mt-4" role="group" aria-label="Filter by category">
      <button
        onClick={() => handleSelect(null)}
        aria-pressed={activeCategory === null}
        className={`min-h-[48px] px-4 rounded-full text-sm font-semibold transition-colors ${
          activeCategory === null
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All categories
      </button>
      {categories.map(cat => (
        <button
          key={cat.slug}
          onClick={() => handleSelect(cat.slug)}
          aria-pressed={activeCategory === cat.slug}
          className={`min-h-[48px] px-4 rounded-full text-sm font-semibold transition-colors ${
            activeCategory === cat.slug
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.title}
        </button>
      ))}
    </div>
  )
}
