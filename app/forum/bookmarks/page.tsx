import Link from 'next/link'
import { getUserBookmarks } from '@/lib/forum/queries'
import { formatRelativeTime } from '@/lib/forum/utils'

export const metadata = {
  title: 'Saved Threads | Clinical to Code',
}

export default async function BookmarksPage() {
  const bookmarks = await getUserBookmarks()

  return (
    <main className="mx-auto px-6 py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#1a1a1a]">Saved Threads</h1>
        <Link
          href="/forum"
          className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
        >
          &larr; Back to Forum
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 text-[#6b6b6b]">
          <p>No saved threads yet.</p>
          <p className="text-sm mt-1">
            Click the bookmark icon on any thread to save it here.
          </p>
          <Link
            href="/forum"
            className="inline-block mt-4 text-sm font-medium text-[#1a6847] hover:underline"
          >
            Browse the Forum
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {bookmarks.map((bookmark) => {
            const thread = bookmark.forum_threads
            if (!thread) return null

            const categorySlug = thread.forum_categories?.slug ?? 'general'

            return (
              <article
                key={bookmark.id}
                className="border border-[#e0dcd5] rounded-lg p-4 hover:bg-[#faf8f5] transition-colors"
              >
                <Link
                  href={`/forum/${categorySlug}/${thread.slug}`}
                  className="font-serif text-base font-semibold hover:text-[#1a6847] transition-colors"
                >
                  {thread.title}
                </Link>
                <div className="flex items-center gap-3 mt-2 text-sm text-[#6b6b6b]">
                  <span>{thread.vote_count} votes</span>
                  <span>·</span>
                  <span>{thread.reply_count} replies</span>
                  <span>·</span>
                  <span>Saved {formatRelativeTime(bookmark.created_at)}</span>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
