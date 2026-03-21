import Link from 'next/link'
import { getUserBookmarks } from '@/lib/forum/queries'
import { formatRelativeTime } from '@/lib/forum/utils'

export const metadata = {
  title: 'Saved Threads | Clinical to Code',
}

export default async function BookmarksPage() {
  const bookmarks = await getUserBookmarks()

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Saved Threads</h1>
        <Link
          href="/forum"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Forum
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No saved threads yet.</p>
          <p className="text-sm mt-1">
            Click the bookmark icon on any thread to save it here.
          </p>
          <Link
            href="/forum"
            className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
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
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <Link
                  href={`/forum/${categorySlug}/${thread.slug}`}
                  className="text-base font-semibold hover:text-primary transition-colors"
                >
                  {thread.title}
                </Link>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
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
