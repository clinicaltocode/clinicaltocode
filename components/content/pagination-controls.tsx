'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationControlsProps { currentPage: number; totalPages: number }

export function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/articles?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mt-16 pt-8 border-t border-[#e0dcd5]">
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage <= 1}
        className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        &larr; Previous
      </button>
      <span className="text-sm text-[#6b6b6b]">{currentPage} / {totalPages}</span>
      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next &rarr;
      </button>
    </div>
  )
}
