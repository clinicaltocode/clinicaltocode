import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { restoreContent, permanentDeleteContent } from '@/lib/moderation/actions'
import { formatRelativeTime } from '@/lib/forum/utils'

export const metadata = { title: 'Content | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === 'posts' ? 'posts' : 'threads'

  const supabase = await createClient()

  const [threadsResult, postsResult] = await Promise.all([
    supabase
      .from('forum_threads')
      .select('id, title, created_at, author_id')
      .eq('is_removed', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('forum_posts')
      .select('id, body, thread_id, created_at, author_id')
      .eq('is_removed', true)
      .order('updated_at', { ascending: false }),
  ])

  const threads = threadsResult.data ?? []
  const posts = postsResult.data ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Removed Content</h1>

      {/* Tab toggle */}
      <div className="flex gap-2 mb-6">
        <a
          href="/admin/content"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            activeTab === 'threads'
              ? 'bg-foreground text-background'
              : 'border border-border hover:bg-muted'
          }`}
        >
          Removed Threads ({threads.length})
        </a>
        <a
          href="/admin/content?tab=posts"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            activeTab === 'posts'
              ? 'bg-foreground text-background'
              : 'border border-border hover:bg-muted'
          }`}
        >
          Removed Posts ({posts.length})
        </a>
      </div>

      {activeTab === 'threads' && (
        <>
          {threads.length === 0 ? (
            <p className="text-muted-foreground py-8">No removed threads.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Title</th>
                  <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Date</th>
                  <th scope="col" className="text-left py-3 font-semibold text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {threads.map((thread) => (
                  <tr key={thread.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium line-clamp-1">{thread.title}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">
                      {formatRelativeTime(thread.created_at)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <form action={restoreContent.bind(null, 'thread', thread.id)}>
                          <Button type="submit" size="sm" variant="outline" className="min-h-[44px]">
                            Restore
                          </Button>
                        </form>
                        <form action={permanentDeleteContent.bind(null, 'thread', thread.id)}>
                          <Button type="submit" size="sm" variant="destructive" className="min-h-[44px]">
                            Delete Permanently
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <p className="text-muted-foreground py-8">No removed posts.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Excerpt</th>
                  <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Date</th>
                  <th scope="col" className="text-left py-3 font-semibold text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground line-clamp-2">{post.body}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">
                      {formatRelativeTime(post.created_at)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <form action={restoreContent.bind(null, 'post', post.id)}>
                          <Button type="submit" size="sm" variant="outline" className="min-h-[44px]">
                            Restore
                          </Button>
                        </form>
                        <form action={permanentDeleteContent.bind(null, 'post', post.id)}>
                          <Button type="submit" size="sm" variant="destructive" className="min-h-[44px]">
                            Delete Permanently
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}
