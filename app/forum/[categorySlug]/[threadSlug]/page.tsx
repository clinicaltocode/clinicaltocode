import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostItem } from '@/components/forum/post-item'
import { getThreadWithPosts } from '@/lib/forum/queries'
import { formatRelativeTime } from '@/lib/forum/utils'

interface ThreadPageProps {
  params: Promise<{ categorySlug: string; threadSlug: string }>
}

export async function generateMetadata({ params }: ThreadPageProps) {
  const { threadSlug } = await params
  const result = await getThreadWithPosts(threadSlug)
  return {
    title: result ? `${result.thread.title} | Forum | Clinical to Code` : 'Forum | Clinical to Code',
  }
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { categorySlug, threadSlug } = await params
  const result = await getThreadWithPosts(threadSlug)

  if (!result) notFound()

  const { thread, topPosts, nestedPosts } = result

  // Build a map from parentPostId → replies for O(1) lookup
  const repliesByParentId = new Map<string, typeof nestedPosts>()
  for (const post of nestedPosts) {
    if (!post.parent_post_id) continue
    const existing = repliesByParentId.get(post.parent_post_id) ?? []
    existing.push(post)
    repliesByParentId.set(post.parent_post_id, existing)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/forum" className="hover:text-foreground">Forum</Link>
        {thread.forum_categories && (
          <>
            {' / '}
            <Link
              href={`/forum/${categorySlug}`}
              className="hover:text-foreground"
            >
              {thread.forum_categories.title}
            </Link>
          </>
        )}
      </nav>

      {/* Thread header */}
      <article>
        <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span>{formatRelativeTime(thread.created_at)}</span>
          <span>·</span>
          <span>{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
          <span>·</span>
          <span>{thread.vote_count} {thread.vote_count === 1 ? 'vote' : 'votes'}</span>
        </div>
        {thread.body_preview && (
          <div className="prose prose-sm max-w-none border border-border rounded-lg p-4 bg-muted/30 mb-6">
            <p>{thread.body_preview}</p>
          </div>
        )}
      </article>

      {/* Posts */}
      <section>
        <h2 className="text-lg font-semibold mb-2">
          {topPosts.length} {topPosts.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {topPosts.length === 0 && (
          <p className="text-muted-foreground text-sm py-4">
            No replies yet. Sign in to start the discussion.
          </p>
        )}

        {topPosts.map((post) => {
          const replies = repliesByParentId.get(post.id) ?? []
          return (
            <div key={post.id}>
              <PostItem post={post} />
              {replies.map((reply) => (
                <PostItem key={reply.id} post={reply} isNested />
              ))}
            </div>
          )
        })}
      </section>

      {/* Reply form placeholder — wired in Plan 05 */}
      <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground">
        Reply form — coming in next plan
      </div>
    </main>
  )
}
