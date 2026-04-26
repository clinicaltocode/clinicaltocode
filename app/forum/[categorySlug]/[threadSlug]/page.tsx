import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostItem } from '@/components/forum/post-item'
import { ReplyForm } from '@/components/forum/reply-form'
import { VoteButton } from '@/components/forum/vote-button'
import { BookmarkButton } from '@/components/forum/bookmark-button'
import { CredentialBadge } from '@/components/profile/credential-badge'
import { getThreadWithPosts } from '@/lib/forum/queries'
import { getProfilesByIds } from '@/lib/profile/queries'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@/lib/forum/utils'
import { AdSlot } from '@/components/ads/ad-slot'

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

  const { thread: threadCheck } = result
  if (threadCheck.is_removed) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const { thread, topPosts, nestedPosts } = result

  // Batch fetch all author profiles in one query — no N+1
  const allAuthorIds = [...new Set([
    thread.author_id,
    ...topPosts.map((p) => p.author_id),
    ...nestedPosts.map((p) => p.author_id),
  ].filter(Boolean))] as string[]
  const profilesById = await getProfilesByIds(allAuthorIds)

  // Build a map from parentPostId → replies for O(1) lookup
  const repliesByParentId = new Map<string, typeof nestedPosts>()
  for (const post of nestedPosts) {
    if (!post.parent_post_id) continue
    const existing = repliesByParentId.get(post.parent_post_id) ?? []
    existing.push(post)
    repliesByParentId.set(post.parent_post_id, existing)
  }

  return (
    <main className="mx-auto px-6 py-12 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-[#6b6b6b] mb-4">
        <Link href="/forum" className="hover:text-[#1a1a1a] transition-colors">Forum</Link>
        {thread.forum_categories && (
          <>
            {' / '}
            <Link
              href={`/forum/${categorySlug}`}
              className="hover:text-[#1a1a1a] transition-colors"
            >
              {thread.forum_categories.title}
            </Link>
          </>
        )}
      </nav>

      {/* Thread header */}
      <article>
        <h1 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-2">{thread.title}</h1>
        <div className="flex items-center gap-3 text-sm text-[#6b6b6b] mb-2">
          <VoteButton
            targetId={thread.id}
            targetType="thread"
            initialCount={thread.vote_count}
            isAuthenticated={isAuthenticated}
          />
          <span>·</span>
          <span>{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
          <span>·</span>
          <span>{formatRelativeTime(thread.created_at)}</span>
          <span>·</span>
          <BookmarkButton
            threadId={thread.id}
            initialBookmarked={false}
            isAuthenticated={isAuthenticated}
          />
        </div>
        {thread.author_id && profilesById[thread.author_id] && (
          <div className="flex items-center gap-1 text-sm text-[#6b6b6b] mb-4">
            <span className="font-medium text-[#1a1a1a]">
              {profilesById[thread.author_id].username}
            </span>
            <CredentialBadge credential={profilesById[thread.author_id].credential_badge} />
          </div>
        )}
        {thread.body_preview && (
          <div className="max-w-none border border-[#e0dcd5] rounded-lg p-4 bg-[#faf8f5] mb-6 text-[#1a1a1a] leading-relaxed">
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
          <p className="text-[#6b6b6b] text-sm py-4">
            No replies yet. Sign in to start the discussion.
          </p>
        )}

        {topPosts.map((post) => {
          const replies = repliesByParentId.get(post.id) ?? []
          return (
            <div key={post.id}>
              <PostItem
                post={post}
                isAuthenticated={isAuthenticated}
                author={post.author_id ? profilesById[post.author_id] ?? null : null}
              />
              {replies.map((reply) => (
                <PostItem
                  key={reply.id}
                  post={reply}
                  isNested
                  author={reply.author_id ? profilesById[reply.author_id] ?? null : null}
                />
              ))}
            </div>
          )
        })}
      </section>

      {/* Ad slot — between posts and reply form */}
      <div className="my-8">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE ?? 'placeholder'} />
      </div>

      {/* Main reply form — for authenticated users */}
      <div className="mt-8">
        {isAuthenticated ? (
          <div>
            <h3 className="text-base font-semibold mb-3">Leave a Reply</h3>
            <ReplyForm threadId={thread.id} />
          </div>
        ) : (
          <div className="text-center py-6 border border-[#e0dcd5] rounded-lg">
            <p className="text-sm text-[#6b6b6b] mb-3">
              Sign in to join the discussion
            </p>
            <a
              href="/auth/login"
              className="text-sm font-medium text-[#1a6847] hover:underline"
            >
              Sign in
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
