# Phase 4: Forum - Research

**Researched:** 2026-03-21
**Domain:** Reddit-style community forum — Next.js 15 App Router, Supabase Postgres + RLS, Drizzle ORM, Server Actions
**Confidence:** HIGH

---

## Summary

Phase 4 builds the full forum surface on top of three solid prior layers: Phase 1 (Supabase + Drizzle + pooled connection), Phase 2 (auth middleware + verified-user gate), and Phase 3 (minimal `forum_categories` and `forum_threads` tables + seeded categories). The schema foundation exists; Phase 4 must add `forum_posts` (top-level replies to threads), `forum_votes`, and `forum_bookmarks` tables, write full RLS policies, build the read-only browsing UI (FORUM-01, FORUM-05), and build the authenticated write flows for thread creation (FORUM-02), replies with 2-level nesting (FORUM-03), upvotes (FORUM-04), and bookmarks (FORUM-06).

The most technically demanding parts are: (a) designing the `forum_posts` adjacency-list schema to support exactly 2 levels of nesting without recursive queries, (b) writing an atomic Postgres RPC for upvotes to avoid the race-condition pitfall identified in PITFALLS.md, and (c) implementing correct RLS policies that enforce email verification via `auth.users.email_confirmed_at` at the database level so no server-action code can be bypassed.

The project already has Drizzle ORM configured with the pooled connection (`prepare: false`), `supabaseAdmin` for trusted server inserts, `createClient` (server) for user-session reads, and the middleware verified-user gate protecting `/forum/new`. No new npm packages are strictly required; `date-fns` is the one addition recommended for human-readable timestamps.

**Primary recommendation:** Extend the Phase 3 migration with `forum_posts`, `forum_votes`, and `forum_bookmarks` tables in a single new migration. Write all write operations as Server Actions that call the Supabase server client (RLS-enforced) or Drizzle for complex queries. Use three separate queries (thread, top-level posts, nested posts) rather than recursive CTEs for reply fetching.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FORUM-01 | Visitor can browse and read all forum categories and threads without an account | Public-read RLS policies on `forum_categories`, `forum_threads`, `forum_posts`; no auth required for GET routes |
| FORUM-02 | Authenticated verified user can create a new thread in a forum category | Server Action with `createClient` (session cookie); RLS INSERT policy checks `auth.uid()` and `email_confirmed_at`; middleware already guards `/forum/new` |
| FORUM-03 | Authenticated verified user can reply to a thread (minimum 2-level nesting) | `forum_posts` table with nullable `parent_post_id`; application enforces depth=2 cap; three-query fetch pattern |
| FORUM-04 | Authenticated user can upvote a post or reply (upvote only, no downvote) | `forum_votes` table with `UNIQUE(target_id, target_type, user_id)`; atomic Postgres RPC via `supabase.rpc()`; toggle semantics (re-voting removes vote) |
| FORUM-05 | Forum organized into clinical specialty categories (Nursing, EHR, Clinical Informatics, Pharmacy, Physician Perspectives) | Categories already seeded in Phase 3 migration; `forum_categories` table exists with all 5 rows; Phase 4 adds display UI |
| FORUM-06 | Authenticated user can bookmark a thread and view their saved threads | `forum_bookmarks` table; RLS policies for own-row read/write; `/forum/bookmarks` page in App Router |
</phase_requirements>

---

## Standard Stack

### Core — Already Installed

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | 0.9.0 | Server-side auth session reading via cookies | Required pattern for Next.js App Router auth |
| `@supabase/supabase-js` | 2.99.1 | Supabase client + `supabase.rpc()` for Postgres functions | Used in Phase 2 and Phase 3; RPC is the atomic vote path |
| `drizzle-orm` | 0.45.1 | Type-safe SQL queries for complex thread+post fetches | Already wired with PgBouncer-compatible `prepare: false` |
| `postgres` | 3.x | Node-postgres driver for Drizzle | Already configured in `lib/supabase/drizzle.ts` |
| Next.js | 15.2.3 | App Router Server Components + Server Actions | Framework constraint |
| TypeScript | 5.x | Type safety | Project constraint |
| Tailwind CSS | 4.x | Styling | Project constraint |
| shadcn/ui + Lucide React | latest | UI primitives and icons | Already installed; use Button, Textarea, Badge, Tabs |

### New Additions

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | 4.x | Human-readable timestamps ("3 hours ago") | Thread list, post metadata — install in Wave 0 |

**Installation:**
```bash
npm install date-fns
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Three separate queries (thread + top + nested posts) | Recursive CTE in one query | CTE is more elegant but expensive and harder to paginate; three queries with explicit JOINs are faster and match the pitfalls guidance |
| Atomic Postgres RPC for votes | Application-level upsert + update | RPC runs in a single transaction — no race condition; application-level is simpler but loses votes under concurrent requests |
| Supabase server client via cookies | `supabaseAdmin` for write operations | `supabaseAdmin` bypasses RLS — only appropriate for webhook inserts (Phase 3 pattern). All user-facing writes MUST use the session client so RLS enforces identity |

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── forum/
│   ├── page.tsx                     # Category index (FORUM-01, FORUM-05) — Server Component
│   ├── [categorySlug]/
│   │   ├── page.tsx                 # Thread list for a category — Server Component
│   │   └── [threadSlug]/
│   │       └── page.tsx             # Thread detail + posts — Server Component
│   ├── new/
│   │   └── page.tsx                 # Create thread form (FORUM-02) — guarded by middleware
│   └── bookmarks/
│       └── page.tsx                 # User's saved threads (FORUM-06) — guarded by middleware
│
lib/
├── forum/
│   ├── queries.ts                   # Drizzle / Supabase read queries (categories, threads, posts)
│   ├── actions.ts                   # Server Actions (createThread, createPost, toggleVote, toggleBookmark)
│   └── types.ts                     # Shared TypeScript interfaces (Thread, Post, Category, Vote)
│
supabase/
├── migrations/
│   └── 20260321000000_add_forum_write_tables.sql  # forum_posts, forum_votes, forum_bookmarks + RLS
│
tests/
└── forum/
    └── forum.test.ts                # Wave 0 stubs; unit tests for RLS rules and slug generation
```

### Pattern 1: Three-Query Reply Fetch (No Recursive CTE)

**What:** Fetch a thread's posts in three queries — the thread itself, top-level posts (parent_post_id IS NULL), and second-level replies (parent_post_id IN top-level IDs). Assemble the tree in TypeScript.
**When to use:** Every thread detail page load.

```typescript
// lib/forum/queries.ts
// Source: project PITFALLS.md Pitfall 7 + direct analysis of adjacency-list pattern

export async function getThreadWithPosts(threadSlug: string) {
  const supabase = await createClient()

  // 1. Thread
  const { data: thread } = await supabase
    .from('forum_threads')
    .select('*, forum_categories(title, slug)')
    .eq('slug', threadSlug)
    .single()

  if (!thread) return null

  // 2. Top-level posts
  const { data: topPosts } = await supabase
    .from('forum_posts')
    .select('*, user_profiles(username, credential_badge)')
    .eq('thread_id', thread.id)
    .is('parent_post_id', null)
    .order('created_at', { ascending: true })

  const topPostIds = (topPosts ?? []).map((p) => p.id)

  // 3. Second-level replies (depth cap enforced here)
  const { data: nestedPosts } = topPostIds.length
    ? await supabase
        .from('forum_posts')
        .select('*, user_profiles(username, credential_badge)')
        .in('parent_post_id', topPostIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  return { thread, topPosts: topPosts ?? [], nestedPosts: nestedPosts ?? [] }
}
```

### Pattern 2: Atomic Vote RPC

**What:** A `SECURITY DEFINER` Postgres function that handles upsert + toggle + denormalized count update in one transaction.
**When to use:** Every upvote action (FORUM-04).

```sql
-- supabase/migrations/20260321000000_add_forum_write_tables.sql
-- Source: PITFALLS.md Pitfall 5

CREATE OR REPLACE FUNCTION toggle_vote(
  p_target_id   UUID,
  p_target_type TEXT,   -- 'thread' | 'post'
  p_user_id     UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id UUID;
BEGIN
  SELECT id INTO existing_id
  FROM forum_votes
  WHERE target_id = p_target_id
    AND target_type = p_target_type
    AND user_id = p_user_id;

  IF existing_id IS NOT NULL THEN
    -- Toggle off
    DELETE FROM forum_votes WHERE id = existing_id;
  ELSE
    -- Toggle on
    INSERT INTO forum_votes (target_id, target_type, user_id)
    VALUES (p_target_id, p_target_type, p_user_id);
  END IF;

  -- Recompute denormalized count
  IF p_target_type = 'thread' THEN
    UPDATE forum_threads
    SET vote_count = (
      SELECT COUNT(*) FROM forum_votes
      WHERE target_id = p_target_id AND target_type = 'thread'
    )
    WHERE id = p_target_id;
  ELSE
    UPDATE forum_posts
    SET vote_count = (
      SELECT COUNT(*) FROM forum_votes
      WHERE target_id = p_target_id AND target_type = 'post'
    )
    WHERE id = p_target_id;
  END IF;
END;
$$;
```

```typescript
// lib/forum/actions.ts
// Called from Client Component via server action boundary
'use server'
import { createClient } from '@/lib/supabase/server'

export async function toggleVote(targetId: string, targetType: 'thread' | 'post') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  await supabase.rpc('toggle_vote', {
    p_target_id: targetId,
    p_target_type: targetType,
    p_user_id: user.id,
  })
}
```

### Pattern 3: Server Action for Thread Creation

**What:** Server Action validates input, derives slug, inserts via session client (RLS enforces identity + email verification).
**When to use:** `/forum/new` form submission (FORUM-02).

```typescript
// lib/forum/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createThread(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const title = (formData.get('title') as string).trim()
  const body = (formData.get('body') as string).trim()
  const categoryId = formData.get('category_id') as string

  // Slug derived server-side — never trusted from client
  const slug = `${slugify(title)}-${Date.now()}`

  const { data: thread, error } = await supabase
    .from('forum_threads')
    .insert({
      title,
      body_preview: body.slice(0, 200),
      slug,
      category_id: categoryId,
      author_id: user.id,
      is_article_thread: false,
    })
    .select('slug')
    .single()

  if (error) throw error
  redirect(`/forum/${thread.slug}`)  // TODO: include category slug
}
```

### Pattern 4: RLS Policy for Verified-User Writes

**What:** Postgres RLS policies that enforce `email_confirmed_at IS NOT NULL` at the database layer, not just in middleware. Defence-in-depth: middleware prevents UI access, RLS prevents API bypass.
**When to use:** All INSERT/UPDATE policies on `forum_threads`, `forum_posts`, `forum_votes`, `forum_bookmarks`.

```sql
-- Pattern: INSERT policy requiring email verification
-- Source: PITFALLS.md Pitfall 14
CREATE POLICY "verified users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()
    ) IS NOT NULL
  );
```

### Pattern 5: Slug Generation

**What:** Server-side slug from title + timestamp suffix for uniqueness.
**When to use:** Thread creation (FORUM-02). Do not accept slugs from the client.

```typescript
// lib/forum/utils.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)  // cap length
}
```

### Anti-Patterns to Avoid

- **Accepting `user_id` or `author_id` from the client request body:** Always derive from `auth.uid()` in RLS or from `supabase.auth.getUser()` in the Server Action. Never trust the client.
- **Using `supabaseAdmin` for user-facing writes:** `supabaseAdmin` bypasses RLS. Only use it for trusted server-to-server operations (webhook handler). All forum writes go through the session client.
- **Recursive CTE for reply fetching:** Expensive at scale. Use the three-query pattern with a hard depth cap instead.
- **Inline vote count update with `vote_count = vote_count + 1`:** Race condition under concurrent requests. Use the atomic RPC.
- **Reading `is_article_thread` to filter user-created threads on the category page:** Include `is_article_thread` in the thread list so article threads appear prominently (they are seeded by Phase 3 webhook); users can filter but don't exclude them by default.

---

## Database Schema — New Tables for Phase 4

This is the single most important output for planning. Phase 3 already created `forum_categories` and `forum_threads`. Phase 4 adds:

### `forum_posts` — replies and nested replies

```sql
CREATE TABLE forum_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id      UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,  -- NULL = top-level
  author_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body           TEXT NOT NULL,
  vote_count     INT NOT NULL DEFAULT 0,
  depth          SMALLINT NOT NULL DEFAULT 0,  -- 0 = top-level, 1 = reply
  is_removed     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for the three-query fetch pattern
CREATE INDEX idx_posts_thread_created ON forum_posts(thread_id, created_at ASC)
  WHERE parent_post_id IS NULL;
CREATE INDEX idx_posts_parent ON forum_posts(parent_post_id, created_at ASC)
  WHERE parent_post_id IS NOT NULL;
```

**Key design decisions:**
- `depth` column stored (not computed) — application sets it on insert, prevents depth > 1 at application layer. No DB constraint needed (avoids complexity).
- `ON DELETE SET NULL` for `author_id` — preserves post content when a user deletes their account; attribution removed (not the post itself).
- `ON DELETE CASCADE` for `thread_id` and `parent_post_id` — post tree disappears when thread or parent is deleted.
- `is_removed` soft-delete column — Phase 6 moderation uses this; Phase 4 just includes the column.

### `forum_threads` — columns to ADD via ALTER TABLE

Phase 3 `forum_threads` lacks `author_id` FK constraint, `vote_count`, `reply_count`, and `is_removed`. These need to be added:

```sql
-- Add to existing forum_threads via ALTER TABLE
ALTER TABLE forum_threads
  ADD COLUMN vote_count  INT NOT NULL DEFAULT 0,
  ADD COLUMN reply_count INT NOT NULL DEFAULT 0,
  ADD COLUMN is_removed  BOOLEAN NOT NULL DEFAULT false;

-- author_id already exists as UUID (no FK in Phase 3); add the FK
ALTER TABLE forum_threads
  ADD CONSTRAINT forum_threads_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Indexes for category thread list
CREATE INDEX idx_threads_category_created ON forum_threads(category_id, created_at DESC);
CREATE INDEX idx_threads_category_votes   ON forum_threads(category_id, vote_count DESC);
```

### `forum_votes`

```sql
CREATE TABLE forum_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id   UUID NOT NULL,        -- thread id or post id
  target_type TEXT NOT NULL,        -- 'thread' | 'post'
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_id, target_type, user_id)   -- one vote per user per target
);

CREATE INDEX idx_votes_target ON forum_votes(target_id, target_type);
```

**Design note:** A polymorphic `target_type` column is used instead of separate `thread_votes` and `post_votes` tables to keep the vote RPC generic. The `UNIQUE` constraint enforces one-vote-per-user at the DB level.

### `forum_bookmarks`

```sql
CREATE TABLE forum_bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (thread_id, user_id)   -- one bookmark per user per thread
);

CREATE INDEX idx_bookmarks_user ON forum_bookmarks(user_id, created_at DESC);
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atomic vote toggle | Custom JS upsert + count update | `supabase.rpc('toggle_vote', ...)` calling a `SECURITY DEFINER` Postgres function | Two-step JS approach has a race condition under concurrent requests |
| Slug uniqueness | Random suffix logic | `title-slug-{Date.now()}` + `UNIQUE` constraint on `slug` | Timestamp suffix gives probabilistic uniqueness; DB constraint catches the rare collision |
| Reply tree assembly | Recursive CTE | Three sequential Supabase queries assembled in TypeScript | CTE is expensive and hard to paginate; three queries are explicit and fast |
| Email verification enforcement | Application-only check in Server Action | RLS policy checking `(SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL` | Application checks can be bypassed by direct PostgREST calls; RLS cannot |
| Timestamp display | Custom date math | `date-fns/formatDistanceToNow` | Handles edge cases (leap years, DST, locale) correctly |
| Banned user enforcement | Application check in every action | RLS policy: `NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_banned)` | Phase 4 includes the column (from Phase 2 migration); Phase 6 enforces it via RLS |

**Key insight:** The Supabase PostgREST API is directly accessible from any HTTP client. Application-layer guards in Server Actions are convenience, not security. Every invariant that matters (identity, verification, one-vote-per-user, banned-user block) must live in RLS policies.

---

## Common Pitfalls

### Pitfall 1: `supabaseAdmin` Used for User Writes
**What goes wrong:** Phase 3 established `supabaseAdmin` (service role) for the webhook handler. If that import is reused for forum Server Actions, all RLS policies are bypassed — any user can create threads as any other user.
**Why it happens:** It's the same pattern already in the codebase, tempting to copy.
**How to avoid:** Forum Server Actions MUST use `createClient()` from `lib/supabase/server.ts` (session client). Only the webhook handler uses `supabaseAdmin`.
**Warning signs:** Forum insert succeeds even when logged out; RLS policies appear to have no effect.

### Pitfall 2: Race Condition on Vote Count
**What goes wrong:** Two simultaneous upvotes read the same `vote_count`, both increment by 1, both write back — one vote is lost.
**Why it happens:** Serverless functions run concurrently with no shared state.
**How to avoid:** Use the `toggle_vote` Postgres RPC. It runs atomically in a single transaction.
**Warning signs:** Vote counts are consistently lower than `SELECT COUNT(*) FROM forum_votes WHERE target_id = ?`.

### Pitfall 3: `author_id` Accepted from Client
**What goes wrong:** A malicious user POSTs a thread with another user's UUID as `author_id`.
**Why it happens:** Naively constructing the insert object from `formData` fields.
**How to avoid:** Always set `author_id: user.id` in the Server Action where `user` comes from `supabase.auth.getUser()`. RLS `WITH CHECK (auth.uid() = author_id)` catches any bypass.
**Warning signs:** No check for `author_id === auth.uid()` in insert policies.

### Pitfall 4: Slug Collision on Concurrent Thread Creation
**What goes wrong:** Two threads with the same title created within the same millisecond get the same slug; the second insert fails with a unique constraint violation.
**Why it happens:** `Date.now()` granularity is milliseconds.
**How to avoid:** Catch the constraint violation in the Server Action and append a random 4-char suffix on retry. Alternatively, use `nanoid` or `crypto.randomUUID()` as the suffix instead of timestamp.
**Warning signs:** Thread creation occasionally throws "duplicate key value violates unique constraint" errors.

### Pitfall 5: Thread List Missing `reply_count` and `vote_count` (N+1 Queries)
**What goes wrong:** Fetching threads and then running a separate `COUNT(*)` for replies and votes per thread — O(n) queries for a page of 20 threads becomes 60 queries.
**Why it happens:** Incrementally fetching computed values rather than denormalizing.
**How to avoid:** Keep `reply_count` and `vote_count` as denormalized columns on `forum_threads`, updated by the vote RPC and by a reply-count increment trigger or explicit update in the createPost action.
**Warning signs:** Thread list page takes >500ms; Supabase dashboard shows many small queries per page load.

### Pitfall 6: `/forum/[categorySlug]/[threadSlug]` Route Not Matching Phase 3 `forum_threads.slug`
**What goes wrong:** Phase 3 created threads with slugs derived from article titles. If the route nests slug under category, the lookup must use both category and thread slug — but Phase 3 thread slugs may not encode the category.
**How to avoid:** Thread detail lookup by slug alone (no category in WHERE clause) is safe since `slug` has a `UNIQUE` constraint. The category path segment is for URL hierarchy only — the actual DB lookup uses `slug` on `forum_threads`.
**Warning signs:** Thread detail page 404s even though the thread exists in the DB.

### Pitfall 7: Bookmarks Page Without Authentication Gate
**What goes wrong:** `/forum/bookmarks` renders with no user session and calls the DB with `auth.uid() = null`, returning an empty list with no error — no redirect to login.
**Why it happens:** The middleware only gates `/forum/new` currently (see `middleware.ts` — it specifically checks `/forum/new`).
**How to avoid:** Update `middleware.ts` to also protect `/forum/bookmarks`. Add RLS SELECT policy `user_id = auth.uid()` on `forum_bookmarks` as a defence layer.
**Warning signs:** Visiting `/forum/bookmarks` while logged out shows an empty page instead of redirecting.

### Pitfall 8: `depth` Not Enforced at DB Level
**What goes wrong:** A client could POST a reply to a depth-1 post, creating depth-2 nesting, which breaks the three-query fetch pattern.
**How to avoid:** Enforce depth cap in the `createPost` Server Action: if `parent_post_id` references a post with `depth = 1`, reject the request with a user-visible error. Optionally, add a `CHECK (depth <= 1)` constraint to `forum_posts` as belt-and-suspenders.
**Warning signs:** `forum_posts` rows appear with `depth = 2`; thread detail page renders them incorrectly.

---

## Code Examples

### RLS Policy Set — Complete Forum Write Policies

```sql
-- Source: PITFALLS.md Pitfalls 8, 14 + project patterns from Phase 2

-- forum_threads
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "threads are publicly readable"
  ON forum_threads FOR SELECT USING (true);

CREATE POLICY "verified users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL
  );

CREATE POLICY "authors can update own threads"
  ON forum_threads FOR UPDATE
  USING (auth.uid() = author_id);

-- forum_posts
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts are publicly readable"
  ON forum_posts FOR SELECT USING (true);

CREATE POLICY "verified users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL
  );

CREATE POLICY "authors can update own posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- forum_votes (users can only manage their own votes)
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes are publicly readable"
  ON forum_votes FOR SELECT USING (true);

CREATE POLICY "authenticated users can vote"
  ON forum_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can remove own votes"
  ON forum_votes FOR DELETE
  USING (auth.uid() = user_id);

-- forum_bookmarks (private — only owner can see)
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can see own bookmarks"
  ON forum_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can create own bookmarks"
  ON forum_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own bookmarks"
  ON forum_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- forum_categories (public read, no writes from users)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories are publicly readable"
  ON forum_categories FOR SELECT USING (true);
```

### Category Index Page (FORUM-01, FORUM-05)

```typescript
// app/forum/page.tsx
// Source: Next.js 15 App Router Server Component pattern (same as articles/page.tsx)
import { createClient } from '@/lib/supabase/server'

export default async function ForumPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('forum_categories')
    .select('id, title, slug, description')
    .order('title')

  return (
    <main>
      <h1>Forum</h1>
      {categories?.map((cat) => (
        <a key={cat.id} href={`/forum/${cat.slug}`}>
          <h2>{cat.title}</h2>
          <p>{cat.description}</p>
        </a>
      ))}
    </main>
  )
}
```

### Middleware Update for Bookmarks Route

```typescript
// middleware.ts — extend existing guard (add /forum/bookmarks)
// Protected write routes: /forum/new (already guarded), /forum/bookmarks (new)
const PROTECTED_PATHS = ['/profile', '/forum/new', '/forum/bookmarks']

if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
  // redirect to login
}

if (user && !user.email_confirmed_at &&
    (pathname.startsWith('/forum/new'))) {
  // redirect to verify-email (bookmarks don't require verification, only auth)
}
```

### Drizzle Schema Registration (lib/supabase/schema.ts)

```typescript
// lib/supabase/schema.ts
// Currently a placeholder (export {}). Phase 4 populates it.
// Source: drizzle-orm documentation for postgres-js adapter
import { pgTable, uuid, text, boolean, integer, smallint, timestamp } from 'drizzle-orm/pg-core'

export const forumCategories = pgTable('forum_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  sanityCategory_id: text('sanity_category_id').unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const forumThreads = pgTable('forum_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  bodyPreview: text('body_preview'),
  articleSanityId: text('article_sanity_id').unique(),
  categoryId: uuid('category_id').references(() => forumCategories.id),
  authorId: uuid('author_id'),  // FK to auth.users (not in Drizzle schema — auth schema)
  isArticleThread: boolean('is_article_thread').notNull().default(true),
  voteCount: integer('vote_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  isRemoved: boolean('is_removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const forumPosts = pgTable('forum_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => forumThreads.id, { onDelete: 'cascade' }),
  parentPostId: uuid('parent_post_id'),  // self-reference — add FK manually in migration
  authorId: uuid('author_id'),
  body: text('body').notNull(),
  voteCount: integer('vote_count').notNull().default(0),
  depth: smallint('depth').notNull().default(0),
  isRemoved: boolean('is_removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getSession()` server-side | `getUser()` server-side only | Supabase SSR docs 2024 | `getSession()` reads from cookie without re-validating — not safe for auth checks |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 (deprecated) | `auth-helpers-nextjs` is archived; `@supabase/ssr` is the supported path |
| `searchParams` as sync object | `await searchParams` as Promise | Next.js 15.0 | Not awaiting causes TypeScript error + runtime warning (D11 from Phase 3) |
| `params` as sync object | `await params` in route handlers | Next.js 15.0 | Same as searchParams — dynamic route params are now Promises |
| Recursive CTE for threaded replies | Adjacency-list with bounded queries | Community best practice | CTEs are elegant but expensive; bounded queries scale better |

**Note on `await params` in Next.js 15:** The `params` prop in `app/forum/[categorySlug]/[threadSlug]/page.tsx` must be awaited — `const { categorySlug, threadSlug } = await params`. This is the same pattern used in `app/articles/[slug]/page.tsx` (Phase 3, D11).

---

## What Phase 3 Already Built (Do Not Re-Build)

| Already Exists | Location | Phase 4 Action |
|----------------|----------|----------------|
| `forum_categories` table with 5 seeded rows | Migration `20260316000000_add_forum_tables.sql` | Add RLS policies only |
| `forum_threads` table | Same migration | Add missing columns via ALTER TABLE; add RLS; add indexes |
| `supabaseAdmin` (service role client) | `lib/supabase/service.ts` | Do NOT use for Phase 4 user writes |
| `createClient` (session client) | `lib/supabase/server.ts` | USE this for all Phase 4 user-facing reads and writes |
| `db` (Drizzle instance) | `lib/supabase/drizzle.ts` | Use for complex queries where Drizzle's type-safety helps |
| Middleware with `/forum/new` guard | `middleware.ts` | Extend to add `/forum/bookmarks` guard |
| Verified-user gate logic | `middleware.ts` | Already correct for `/forum/new`; bookmark page only needs auth (not verification) |
| `user_profiles` table with `is_banned`, `is_admin` | Migration `20260315_add_user_profiles.sql` | Phase 4 can JOIN this for display (username, credential_badge) |

---

## Open Questions

1. **Thread URL structure: `/forum/[threadSlug]` vs `/forum/[categorySlug]/[threadSlug]`**
   - What we know: Phase 3 thread slugs don't encode category. Category is a join column.
   - What's unclear: Whether to nest threads under category in the URL for SEO/UX.
   - Recommendation: Use `/forum/[categorySlug]/[threadSlug]` (two-segment) for clear URL hierarchy. Lookup by `threadSlug` alone (unique) — ignore category slug in WHERE clause.

2. **`reply_count` on `forum_threads` — trigger vs. explicit update in Server Action**
   - What we know: Denormalized counts avoid N+1 queries.
   - What's unclear: Whether to use a Postgres trigger or explicit `UPDATE forum_threads SET reply_count = reply_count + 1` in the `createPost` Server Action.
   - Recommendation: Explicit update in the Server Action (same pattern as vote RPC). Triggers are less visible in code review and harder to debug. If the update fails, the Server Action can surface an error.

3. **Article thread display on category page**
   - What we know: Phase 3 creates threads with `is_article_thread = true` via webhook. The category page will show both article-spawned and user-created threads.
   - What's unclear: Whether article threads should have a visual indicator or sort differently.
   - Recommendation: Add a subtle "Article Discussion" badge to article threads. Sort by `created_at DESC` by default (not vote count) — newer threads are more relevant for a new community.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npx vitest run tests/forum/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORUM-01 | Public read access — no auth needed for category/thread browsing | unit (RLS logic stub) | `npx vitest run tests/forum/forum.test.ts` | ❌ Wave 0 |
| FORUM-02 | Verified user can create thread — slug derived server-side | unit (slug generation + validation) | `npx vitest run tests/forum/forum.test.ts` | ❌ Wave 0 |
| FORUM-03 | Reply depth capped at 2 — depth enforcement logic | unit (depth cap logic) | `npx vitest run tests/forum/forum.test.ts` | ❌ Wave 0 |
| FORUM-04 | Upvote is idempotent — toggle semantics | unit (toggle vote logic stub) | `npx vitest run tests/forum/forum.test.ts` | ❌ Wave 0 |
| FORUM-05 | 5 categories exist with correct slugs | unit (seeded category data stub) | `npx vitest run tests/forum/forum.test.ts` | ❌ Wave 0 |
| FORUM-06 | Bookmark unique per user per thread | unit (unique constraint semantics stub) | `npx vitest run tests/forum/forum.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/forum/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/forum/forum.test.ts` — stub tests for FORUM-01 through FORUM-06
- [ ] Install `date-fns`: `npm install date-fns`

No new framework infrastructure needed — vitest, jsdom, and `tests/setup.ts` already exist from Phase 1.

---

## Sources

### Primary (HIGH confidence)

- Phase 3 migration `supabase/migrations/20260316000000_add_forum_tables.sql` — exact schema Phase 4 builds on
- Phase 2 auth migration `supabase/migrations/20260315_add_user_profiles.sql` — `user_profiles` table columns available for JOIN
- `middleware.ts` (current) — exact route guards that Phase 4 must extend
- `.planning/research/PITFALLS.md` — Pitfalls 3, 4, 5, 7, 8, 14 directly inform Phase 4 schema and RLS design
- `.planning/research/STACK.md` — Auth Architecture section confirms `@supabase/ssr` + `getUser()` pattern
- `lib/supabase/drizzle.ts` — confirms `prepare: false` PgBouncer pattern already in place
- `lib/supabase/server.ts` — confirms `createClient()` (session-cookie pattern) is the correct client for user writes
- Phase 3 Context D9 — explicitly scopes what is "minimal in Phase 3, expanded in Phase 4"

### Secondary (MEDIUM confidence)

- Next.js 15 docs pattern for `await params` — consistent with Phase 3 D11 (`await searchParams`); same breaking change applies to route params
- Supabase PostgREST RLS documentation — `auth.uid()` and `auth.users.email_confirmed_at` available in policies as confirmed by PITFALLS.md Pitfall 14

### Tertiary (LOW confidence — flag for validation)

- Polymorphic `forum_votes` design (single table with `target_type` discriminator) vs. two separate tables — single table simplifies the RPC but requires application-level referential integrity. LOW confidence that this is the best tradeoff for this schema; validate before writing the migration.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed; `date-fns` is a known stable package
- Schema design: HIGH — derived directly from Phase 3 migration + PITFALLS.md; explicit columns and FK decisions documented
- Architecture patterns: HIGH — follows established Phase 2/3 patterns (Server Actions, session client, `await params`)
- RLS policies: HIGH — pattern validated against PITFALLS.md Pitfall 8 and 14; SQL syntax matches Supabase Postgres dialect
- Vote RPC: HIGH — directly derived from PITFALLS.md Pitfall 5 (atomic vote function) with toggle modification
- Pitfalls: HIGH — sourced from project PITFALLS.md + code review of existing middleware and schema

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable domain — Next.js 15, Supabase, Drizzle APIs are not fast-moving)
