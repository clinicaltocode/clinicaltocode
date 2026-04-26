export default function ForumLoading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-32 bg-[#f4f1ec] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[#f4f1ec] rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-28 bg-[#f4f1ec] rounded animate-pulse" />
      </div>
      <div className="grid gap-4 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-[#e0dcd5] rounded-lg p-5">
            <div className="h-5 w-48 bg-[#f4f1ec] rounded animate-pulse" />
            <div className="h-4 w-full bg-[#f4f1ec] rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>
    </main>
  )
}
