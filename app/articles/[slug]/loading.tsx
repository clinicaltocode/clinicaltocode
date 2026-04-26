export default function ArticleDetailLoading() {
  return (
    <main className="max-w-[1200px] mx-auto px-6">
      <div className="py-16 max-w-[680px] mx-auto text-center">
        <div className="h-4 w-24 bg-[#f4f1ec] rounded animate-pulse mx-auto mb-6" />
        <div className="h-4 w-20 bg-[#f4f1ec] rounded animate-pulse mx-auto mb-4" />
        <div className="h-10 w-full bg-[#f4f1ec] rounded animate-pulse mb-3" />
        <div className="h-10 w-3/4 bg-[#f4f1ec] rounded animate-pulse mx-auto mb-6" />
        <div className="h-4 w-48 bg-[#f4f1ec] rounded animate-pulse mx-auto" />
      </div>
      <div className="max-w-[900px] mx-auto mb-12 aspect-[2/1] bg-[#f4f1ec] rounded animate-pulse" />
      <div className="max-w-[680px] mx-auto space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-5 bg-[#f4f1ec] rounded animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    </main>
  )
}
