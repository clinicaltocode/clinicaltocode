export default function ArticlesLoading() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="h-10 w-48 bg-[#f4f1ec] rounded animate-pulse" />
        <div className="h-8 w-96 bg-[#f4f1ec] rounded animate-pulse mt-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/2] bg-[#f4f1ec] rounded animate-pulse mb-4" />
            <div className="h-4 w-20 bg-[#f4f1ec] rounded animate-pulse" />
            <div className="h-6 w-full bg-[#f4f1ec] rounded animate-pulse mt-2" />
            <div className="h-4 w-32 bg-[#f4f1ec] rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>
    </main>
  )
}
