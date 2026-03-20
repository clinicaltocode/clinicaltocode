// All GROQ queries for the content phase.
//
// Rules enforced in every query:
//   1. !(_id in path("drafts.**"))   — never show draft documents in production
//   2. defined(publishedAt)          — never show unscheduled/unpublished articles
//   3. "slug": slug.current          — always project the slug string, not the object
//   4. order() before slice          — GROQ pipeline order matters
//   5. Always use $params            — never interpolate dynamic values into query strings

// ---------------------------------------------------------------------------
// Article index — used by app/articles/page.tsx
// Fetches a page of articles with optional category filter.
// body is intentionally excluded here — only fetch it on the detail page.
// ---------------------------------------------------------------------------
export const ARTICLES_QUERY = `
  *[
    _type == "article"
    && !(_id in path("drafts.**"))
    && defined(publishedAt)
    && ($category == null || category->slug.current == $category)
  ]
  | order(publishedAt desc)
  [$start..$end] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    "coverImage": coverImage { asset->{ url }, alt, crop, hotspot },
    "category": category->{ title, "slug": slug.current },
    "author": author->{ name, credential },
    tags
  }
`

// ---------------------------------------------------------------------------
// Article total count — used alongside ARTICLES_QUERY for pagination UI
// ---------------------------------------------------------------------------
export const ARTICLES_COUNT_QUERY = `
  count(
    *[
      _type == "article"
      && !(_id in path("drafts.**"))
      && defined(publishedAt)
      && ($category == null || category->slug.current == $category)
    ]
  )
`

// ---------------------------------------------------------------------------
// Article detail — used by app/articles/[slug]/page.tsx
// Fetches a single article including the full body for PortableText rendering.
// Also fetches the full coverImage projection for hotspot-aware cropping.
// ---------------------------------------------------------------------------
export const ARTICLE_BY_SLUG_QUERY = `
  *[
    _type == "article"
    && !(_id in path("drafts.**"))
    && defined(publishedAt)
    && slug.current == $slug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    "coverImage": coverImage { asset->{ url }, alt, crop, hotspot },
    "category": category->{ title, "slug": slug.current },
    "author": author->{ name, credential },
    tags,
    body
  }
`

// ---------------------------------------------------------------------------
// All article slugs — used by generateStaticParams in the detail page
// ---------------------------------------------------------------------------
export const ALL_ARTICLE_SLUGS_QUERY = `
  *[
    _type == "article"
    && !(_id in path("drafts.**"))
    && defined(publishedAt)
  ] { "slug": slug.current }
`

// ---------------------------------------------------------------------------
// Category list — used by CategoryFilter component and articles index page
// Sorted alphabetically. Cached with tag 'category' — changes rarely.
// ---------------------------------------------------------------------------
export const CATEGORIES_QUERY = `
  *[_type == "category"]
  | order(title asc) {
    title,
    "slug": slug.current
  }
`
