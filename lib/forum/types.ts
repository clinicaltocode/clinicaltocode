export interface ForumCategory {
  id: string
  title: string
  slug: string
  sanity_category_id: string | null
  description: string | null
  created_at: string
}

export interface ForumThread {
  id: string
  title: string
  slug: string
  body_preview: string | null
  article_sanity_id: string | null
  category_id: string | null
  is_article_thread: boolean
  author_id: string | null
  vote_count: number
  reply_count: number
  is_removed: boolean
  created_at: string
  updated_at: string
  // Joined fields (present in some queries)
  forum_categories?: Pick<ForumCategory, 'title' | 'slug'> | null
}

export interface ForumPost {
  id: string
  thread_id: string
  parent_post_id: string | null
  author_id: string | null
  body: string
  vote_count: number
  depth: number
  is_removed: boolean
  created_at: string
  updated_at: string
}

export interface ForumBookmarkThread {
  id: string
  title: string
  slug: string
  vote_count: number
  reply_count: number
  created_at: string
  forum_categories?: { slug: string } | null
}

export interface ForumBookmark {
  id: string
  thread_id: string
  user_id: string
  created_at: string
  // Joined thread for bookmarks page (includes nested forum_categories for category slug)
  forum_threads?: ForumBookmarkThread | null
}

export interface ThreadWithPosts {
  thread: ForumThread
  topPosts: ForumPost[]
  nestedPosts: ForumPost[]
}
