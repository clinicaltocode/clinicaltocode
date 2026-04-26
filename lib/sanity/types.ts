export interface SanityArticle {
  _id: string
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  coverImage?: {
    asset?: { url: string }
    alt?: string
    crop?: unknown
    hotspot?: unknown
  }
  category?: { title: string; slug: string }
  author?: {
    name: string
    credential?: string
    bio?: string
    slug?: string
    avatarUrl?: string
  }
  tags?: string[]
  body?: unknown[]
}

export interface SanityCategory {
  title: string
  slug: string
}
