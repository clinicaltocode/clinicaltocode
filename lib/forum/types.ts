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
  // Joined field from user_profiles (present in thread detail query)
  user_profiles?: { username: string | null; credential_badge: string | null } | null
}

export interface ForumBookmark {
  id: string
  thread_id: string
  user_id: string
  created_at: string
  // Joined thread for bookmarks page
  forum_threads?: Pick<ForumThread, 'id' | 'title' | 'slug' | 'vote_count' | 'reply_count' | 'created_at' | 'category_id'> | null
}

export interface ThreadWithPosts {
  thread: ForumThread
  topPosts: ForumPost[]
  nestedPosts: ForumPost[]
}
