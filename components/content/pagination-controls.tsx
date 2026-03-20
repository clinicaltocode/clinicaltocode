'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
}

export function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/articles?${params.toString()}`)
  }

  const isFirst = currentPage <= 1
  const isLast  = currentPage >= totalPages

  return (
    <div className="flex items-center justify-between mt-12">
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={isFirst}
        className={`min-h-[48px] border border-[#e5e7eb] px-4 rounded-md text-sm transition-opacity ${
          isFirst ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
        }`}
        aria-label="Previous page"
      >
        Previous
      </button>

      <span className="text-sm text-[#666666]">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={isLast}
        className={`min-h-[48px] border border-[#e5e7eb] px-4 rounded-md text-sm transition-opacity ${
          isLast ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
        }`}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  )
}
