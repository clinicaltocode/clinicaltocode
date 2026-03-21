# Phase 5: User Profiles — Research

**Researched:** 2026-03-21
**Domain:** Supabase Storage (avatar upload), user_profiles table (pre-existing), Next.js App Router Server Actions, shadcn base-nova component patterns
**Confidence:** HIGH

---

## Summary

Phase 5 is additive — the critical database infrastructure already exists. The `user_profiles` table was created in Phase 2 (`20260315_add_user_profiles.sql`) with columns for `username`, `bio`, `credential_badge`, `avatar_url`, `is_admin`, `is_banned`, and RLS policies for public read and owner update. No new migration is required for the table itself, only a Supabase Storage bucket and a migration to enforce any new constraints.

The two primary surfaces are: a **public profile page** at `/profile/[username]` (Server Component, no auth required) showing avatar, credential badge, and paginated post history; and a **settings page** at `/settings/profile` (protected by existing middleware guard on `/profile/*`) for uploading an avatar, selecting a credential badge, and writing a bio. Post history requires joining `forum_threads` and `forum_posts` on `author_id`, which is a UUID FK to `auth.users`. Avatar upload uses Supabase Storage with client-side file validation before upload.

The existing middleware already guards `/profile/*` paths from unauthenticated users. The credential badge must propagate to `ThreadCard` and `PostItem` — this requires fetching author profile data alongside thread/post queries, which is a performance consideration (batch rather than N+1).

**Primary recommendation:** Extend the existing patterns (server client, Server Actions, Supabase Anon client for storage uploads from client components) — no new libraries needed. The only new infrastructure is a Supabase Storage `avatars` bucket and a new `lib/profile/` data layer.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROF-01 | User has a public profile page showing username, join date, credential badge, and post history | `user_profiles` table already has all needed columns; post history requires join on `forum_threads.author_id` and `forum_posts.author_id` |
| PROF-02 | User can set a self-reported credential badge on their profile | `user_profiles.credential_badge TEXT` column exists; Server Action updates it; CredentialSelect dropdown maps to allowed values |
| PROF-03 | User can upload a profile avatar and write a short bio | Supabase Storage `avatars` bucket (new); `user_profiles.avatar_url` and `user_profiles.bio` columns exist; client-side validation before upload |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | ^0.9.0 (installed) | Server/client Supabase access | Already used throughout project |
| `@supabase/supabase-js` | ^2.99.1 (installed) | Browser Storage upload from client component | `.storage.from('avatars').upload()` requires browser client |
| `lucide-react` | ^0.577.0 (installed) | Icons (Loader2, Upload, X, User) | Project standard |
| `shadcn` (base-nova) | installed | Avatar, Select, Input, Textarea, Badge | Project design system |
| `date-fns` | ^4.1.0 (installed) | Join date formatting | Already installed for forum |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `class-variance-authority` | installed | CredentialBadge variant styling | When badge needs color variants per credential |
| `clsx` / `tailwind-merge` | installed | Conditional class composition | Standard in project (via `cn()` util) |

### shadcn Components to Install

The UI-SPEC identifies two components not yet installed:

| Component | Install Command | Notes |
|-----------|----------------|-------|
| `Avatar` | `npx shadcn add avatar` | Used in profile header and settings |
| `Select` | `npx shadcn add select` | CredentialSelect dropdown |
| `Input` | `npx shadcn add input` | May be needed for settings form fields |

`Textarea` was installed in Phase 4. `Badge` is already installed (`components/ui/badge.tsx`).

**Installation:**
```bash
npx shadcn add avatar select input
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Storage for avatars | Cloudinary / S3 | No new service needed; Supabase Storage is already in stack |
| Browser client upload | Server Action upload (multipart) | Browser client is simpler for binary file upload from `'use client'` components; avoids Next.js multipart body parsing |

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── profile/
│   └── [username]/
│       └── page.tsx           # Public profile page (Server Component, no auth)
├── settings/
│   └── profile/
│       └── page.tsx           # Settings page (auth-gated by middleware)
│       └── settings-form.tsx  # 'use client' form component
components/
└── profile/
    ├── avatar-upload.tsx       # 'use client' — file input + Supabase Storage
    ├── credential-badge.tsx    # Pure display — renders Badge variant
    ├── credential-select.tsx   # 'use client' — Select dropdown
    └── profile-post-history.tsx # Server Component or client with pagination
lib/
└── profile/
    ├── types.ts               # UserProfile, ProfilePost interfaces
    ├── queries.ts             # getProfile(username), getProfilePostHistory(userId, page)
    └── actions.ts             # updateProfile(formData), uploadAvatar(file)
supabase/
└── migrations/
    └── 20260322000000_add_profile_storage.sql  # Storage bucket policy (if via SQL)
```

### Pattern 1: Public Profile Page (Server Component)

**What:** `/profile/[username]` fetches profile by username using server Supabase client. No auth required — RLS `profiles are publicly readable` policy allows anon select.

**When to use:** All read-only public profile rendering.

```typescript
// app/profile/[username]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, username, bio, credential_badge, avatar_url, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Fetch post history (threads authored, first page)
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, title, slug, body_preview, created_at, forum_categories(slug)')
    .eq('author_id', profile.id)
    .eq('is_removed', false)
    .order('created_at', { ascending: false })
    .range(0, 19)

  return <ProfileView profile={profile} threads={threads ?? []} />
}
```

**Note:** `params` is a Promise in Next.js 15 App Router — must be awaited.

### Pattern 2: Settings Server Action (updateProfile)

**What:** Server Action validates and updates `user_profiles` row for the authenticated user. The `id` comes from `supabase.auth.getUser()` — never from formData.

```typescript
// lib/profile/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const bio = (formData.get('bio') as string | null)?.trim().slice(0, 280) ?? null
  const credentialBadge = (formData.get('credential_badge') as string | null) || null

  const VALID_CREDENTIALS = ['RN', 'NP', 'MD', 'DO', 'PharmD', 'PA', 'CMIO', 'CIO', 'Health IT', 'Other']
  if (credentialBadge && !VALID_CREDENTIALS.includes(credentialBadge)) {
    throw new Error('Invalid credential badge.')
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      bio,
      credential_badge: credentialBadge,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}
```

### Pattern 3: Avatar Upload (Client Component + Supabase Storage)

**What:** File input triggers browser-side upload to Supabase Storage `avatars` bucket, then Server Action updates `avatar_url` in `user_profiles`. Upload goes directly from browser to Supabase Storage — avoids routing binary data through Next.js Server Action.

**Storage path convention:** `avatars/{userId}/{timestamp}.{ext}` — namespaced by user ID to enable RLS on Storage.

```typescript
// components/profile/avatar-upload.tsx — pattern sketch
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function AvatarUpload({ userId, currentUrl }: { userId: string; currentUrl: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo must be under 2MB.')
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP files are accepted.')
      return
    }

    setError(null)
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const supabase = createClient()

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Upload failed. Try again.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    // Call Server Action to persist avatar_url
    await updateAvatarUrl(publicUrl)
    setUploading(false)
  }

  // ...
}
```

**Note:** `updateAvatarUrl` is a separate thin Server Action that only updates `avatar_url` — not combined with the full profile update, because the upload is async and the form save is separate.

### Pattern 4: Credential Badge on Forum Components

**What:** After Phase 5, `ThreadCard` and `PostItem` must display the author's credential badge. The safest approach is a batch profile lookup keyed by `author_id` UUIDs, not an N+1 query per post.

**When to use:** Any page rendering a list of threads or posts.

```typescript
// In queries.ts — batch fetch profiles for a list of author IDs
export async function getProfilesByIds(userIds: string[]) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('id, username, credential_badge, avatar_url')
    .in('id', userIds)

  return Object.fromEntries((data ?? []).map(p => [p.id, p]))
}
```

Then on thread detail page: collect all `author_id` values from threads + posts, fetch profiles once, pass as a map to components.

### Anti-Patterns to Avoid

- **N+1 profile fetches:** Fetching `user_profiles` inside a `.map()` over posts — use batch `in('id', ids)` instead.
- **Server Action for binary upload:** Routing file bytes through a Server Action adds unnecessary latency and body parsing overhead — use browser Supabase client directly for the Storage upload.
- **Accepting `user_id` from formData:** Always derive the user ID from `supabase.auth.getUser()` in Server Actions — never trust client-supplied IDs.
- **Public bucket without path scoping:** Store avatars under `avatars/{userId}/...` so Storage RLS policies can scope writes to the owning user.
- **Module-level Supabase client:** Never call `createClient()` at module level — always inside the action/component function (existing project pattern).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File type validation | Custom MIME detection | Check `file.type` against allowlist client-side | Browser provides MIME from file headers; server validation via Storage bucket MIME restriction |
| Avatar URL generation | Manual path construction | `supabase.storage.from('avatars').getPublicUrl(path)` | Supabase generates correct CDN URL including bucket configuration |
| Credential enum enforcement | Custom validator | Server Action allowlist check + DB `CHECK` constraint optional | Supabase RLS + application-layer validation is sufficient; no need for a custom validation library |
| Paginated post history | Custom cursor/offset logic | Supabase `.range(from, to)` | Already used in Phase 3 content pagination via `PaginationControls` component |
| Username lookup | Custom user table | `user_profiles.username` (already exists) | The column and UNIQUE constraint are already in the Phase 2 migration |

**Key insight:** The `user_profiles` table is already fully defined. Phase 5 is entirely a UI + data layer + Storage problem — not a schema design problem.

---

## Common Pitfalls

### Pitfall 1: `params` Must Be Awaited in Next.js 15

**What goes wrong:** Using `params.username` directly instead of `const { username } = await params` causes a runtime error in Next.js 15 App Router — `params` is a Promise.

**Why it happens:** Next.js 15 changed `params` and `searchParams` to Promises. Phase 3 and 4 pages already use the correct async pattern.

**How to avoid:** Always destructure after `await params`. The existing `app/articles/[slug]/page.tsx` demonstrates the correct pattern.

**Warning signs:** TypeScript error `Property 'username' does not exist on type 'Promise<...>'`.

### Pitfall 2: Old Avatar Files Not Cleaned Up

**What goes wrong:** Each upload creates a new Storage object under a timestamp path. Over time, a user accumulates many orphaned avatar files.

**Why it happens:** `upsert: true` with a timestamp-based path creates new objects rather than replacing them.

**How to avoid:** Before uploading a new avatar, delete the old Storage object if `avatar_url` is already set. Parse the old path from the URL, call `supabase.storage.from('avatars').remove([oldPath])`. Alternatively, use a fixed path like `avatars/{userId}/avatar` with `upsert: true` — but this requires cache-busting the URL (append `?t={timestamp}` to the `avatar_url` stored in the DB).

**Recommendation:** Use a fixed path `avatars/{userId}/avatar.{ext}` with upsert + store the versioned public URL in `avatar_url`.

### Pitfall 3: Storage RLS — Bucket Must Be Configured as Public or With Correct Policies

**What goes wrong:** Avatar images return 403 or broken image if the `avatars` bucket is private and no SELECT policy is configured.

**Why it happens:** Supabase Storage buckets are private by default. Public profile pages render avatars for unauthenticated visitors — the anon key must be able to GET objects.

**How to avoid:** Create the `avatars` bucket as **public** (public read, authenticated write scoped to own path) OR add a Storage SELECT policy for anon role. The simplest approach for this phase is a public bucket with an INSERT/UPDATE policy requiring `auth.uid()::text = (storage.foldername(name))[1]`.

**Warning signs:** Avatar images return 400/403 in browser; `getPublicUrl` returns a URL but it 404s.

### Pitfall 4: Username Not Set on Existing Users

**What goes wrong:** The `handle_new_user()` trigger inserts a profile row with `id` only — `username` is NULL for all existing users. Navigating to `/profile/[username]` where username is NULL matches no rows.

**Why it happens:** Phase 2 trigger does not set `username`. Users signed up before Phase 5 have no username.

**How to avoid:** Phase 5 must either: (a) auto-generate usernames from email prefix during signup (update the trigger), or (b) show a "Set your username" prompt in settings. The settings page should handle the case where `user_profiles.username` is NULL. The middleware already allows authenticated users to access `/settings/profile`.

**Recommendation:** Auto-generate a username from the email local-part (strip domain, slugify, append short random suffix for uniqueness) in the trigger update, applied to existing null rows via a backfill UPDATE in the Phase 5 migration.

### Pitfall 5: Badge Variant Color Override

**What goes wrong:** The UI-SPEC specifies credential badge uses `variant="outline"` with accent border color `#0066cc`. The existing `badge.tsx` `outline` variant uses `border-border` (neutral), not the accent color.

**Why it happens:** The `CredentialBadge` component needs to override the border color from the base outline variant.

**How to avoid:** The `CredentialBadge` wrapper applies an additional class `border-primary` (or inline style) on top of the `outline` variant, or the `badgeVariants` CVA is extended with a `credential` variant. Simplest: pass `className="border-primary text-primary"` to `<Badge variant="outline">`.

### Pitfall 6: Settings Page Route Conflict with Profile Route

**What goes wrong:** The middleware guards `/profile/*` paths. The settings page is at `/settings/profile` — a different path. The middleware does NOT currently guard `/settings/*`.

**Why it happens:** The current middleware only checks `/profile`, `/forum/new`, `/forum/bookmarks`.

**How to avoid:** Phase 5 must add `/settings` to the middleware auth guard. The middleware already guards `/profile/*` to redirect unauthenticated users — add `pathname.startsWith('/settings')` to both the auth check and the verified-user check.

---

## Code Examples

### Supabase Storage: Upload and Get Public URL

```typescript
// Source: Supabase JS v2 Storage API (verified pattern)
const supabase = createClient() // browser client

const { error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file, {
    upsert: true,
    contentType: file.type,
  })

const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`)
```

### Supabase Storage: Remove Old Object

```typescript
// Source: Supabase Storage remove API
await supabase.storage
  .from('avatars')
  .remove([`${userId}/avatar.jpg`])
```

### Profile Query by Username

```typescript
// Source: Supabase JS v2 + existing project patterns (lib/forum/queries.ts)
const { data: profile, error } = await supabase
  .from('user_profiles')
  .select('id, username, bio, credential_badge, avatar_url, created_at')
  .eq('username', username)
  .single()

if (error?.code === 'PGRST116') notFound() // PostgREST: no rows
```

### Post History Pagination (range-based, matching Phase 3 pattern)

```typescript
const PAGE_SIZE = 20
const from = page * PAGE_SIZE
const to = from + PAGE_SIZE - 1

const { data: threads } = await supabase
  .from('forum_threads')
  .select('id, title, slug, body_preview, created_at, forum_categories(slug)')
  .eq('author_id', profileId)
  .eq('is_removed', false)
  .order('created_at', { ascending: false })
  .range(from, to)
```

### Username Auto-Generation Backfill (Migration Pattern)

```sql
-- In Phase 5 migration
UPDATE public.user_profiles
SET username = LOWER(REGEXP_REPLACE(
  SPLIT_PART(au.email, '@', 1) || '_' || SUBSTRING(gen_random_uuid()::text, 1, 6),
  '[^a-z0-9_]', '_', 'g'
))
FROM auth.users au
WHERE user_profiles.id = au.id
  AND user_profiles.username IS NULL;
```

### Storage Bucket RLS Policy (SQL)

```sql
-- Allow public read on avatars bucket
CREATE POLICY "avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Only owner can upload to their own folder
CREATE POLICY "users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Only owner can update/delete own avatar
CREATE POLICY "users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params.username` direct access | `const { username } = await params` | Next.js 15 | Breaking — must await params |
| Separate avatar upload service | Supabase Storage | Already in stack | No new service needed |
| Storing avatar in DB as base64 | Store URL in DB, binary in Storage | Always current | Keeps DB rows small, CDN serves images |

---

## Database State Assessment

The `user_profiles` table already has all needed columns (from Phase 2 migration):

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | FK to `auth.users(id)` ON DELETE CASCADE |
| `username` | TEXT UNIQUE | NULL for users created before Phase 5 — needs backfill |
| `display_name` | TEXT | Not used in Phase 5 UI (username is the display identifier) |
| `bio` | TEXT | Max 280 chars enforced at application layer |
| `credential_badge` | TEXT | Free-form, enforced to allowlist in Server Action |
| `avatar_url` | TEXT | Full public URL of Storage object |
| `is_admin` | BOOLEAN | Not modified in Phase 5 |
| `is_banned` | BOOLEAN | Not modified in Phase 5 |
| `created_at` | TIMESTAMPTZ | Used as "join date" on public profile |
| `updated_at` | TIMESTAMPTZ | Updated on profile save |

RLS already configured:
- Public read (anon): `profiles are publicly readable` — SELECT USING (true)
- Owner update: `users can update own profile` — UPDATE USING (auth.uid() = id)

**Phase 5 migration needs:** Storage bucket creation + Storage RLS policies + username backfill for existing users.

---

## Open Questions

1. **Username uniqueness at signup**
   - What we know: `username` is UNIQUE in the DB. The Phase 2 trigger inserts only `id` — no username.
   - What's unclear: Should username be set during signup (update the trigger), or set by the user in settings?
   - Recommendation: Auto-generate from email prefix + random suffix at signup (update trigger). This ensures every user has a username without requiring a separate setup step. Backfill existing NULL rows in the Phase 5 migration.

2. **Post history scope: threads only, or threads + replies?**
   - What we know: The UI-SPEC says "threads and posts authored by the user" and the `ProfilePostHistory` component renders a paginated list of both.
   - What's unclear: Whether to merge threads and posts into one timeline (requires UNION query or separate fetch), or show separate tabs.
   - Recommendation: The UI-SPEC says a single paginated list of "threads and posts". Use two separate queries (threads and top-level posts), merge and sort by `created_at` in the data layer, paginate the merged set. Cap at 20 items per page.

3. **`/settings` middleware guard**
   - What we know: Middleware currently only guards `/profile`, `/forum/new`, `/forum/bookmarks`.
   - What's unclear: Whether `/settings` should also require email verification (not just auth).
   - Recommendation: Settings requires auth AND verified email (same guard as `/forum/new`). Add `pathname.startsWith('/settings')` to both conditional blocks in `middleware.ts`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1 + jsdom |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/profile/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-01 | Profile row with username returns data (not null) | unit | `npx vitest run tests/profile/profile.test.ts` | ❌ Wave 0 |
| PROF-01 | Missing username returns 404 | unit | `npx vitest run tests/profile/profile.test.ts` | ❌ Wave 0 |
| PROF-02 | Credential badge value in allowlist passes | unit | `npx vitest run tests/profile/profile.test.ts` | ❌ Wave 0 |
| PROF-02 | Credential badge value outside allowlist throws | unit | `npx vitest run tests/profile/profile.test.ts` | ❌ Wave 0 |
| PROF-03 | File over 2MB rejected client-side | unit | `npx vitest run tests/profile/profile.test.ts` | ❌ Wave 0 |
| PROF-03 | Non-image MIME type rejected client-side | unit | `npx vitest run tests/profile/profile.test.ts` | ❌ Wave 0 |
| PROF-03 | Bio truncates to 280 chars before save | unit | `npx vitest run tests/profile/profile.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/profile/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/profile/profile.test.ts` — covers PROF-01, PROF-02, PROF-03 with unit stubs
- [ ] No framework changes needed — Vitest + jsdom already configured

---

## Sources

### Primary (HIGH confidence)

- Codebase: `supabase/migrations/20260315_add_user_profiles.sql` — confirmed existing table schema and RLS
- Codebase: `middleware.ts` — confirmed `/profile/*` auth guard already in place; `/settings` not yet guarded
- Codebase: `lib/forum/queries.ts`, `lib/forum/actions.ts` — established patterns for server client, Server Actions, batch queries
- Codebase: `components/ui/badge.tsx` — confirmed `outline` variant uses `border-border`, not accent — needs override for credential badge
- Codebase: `vitest.config.ts` + `tests/` — confirmed Vitest jsdom environment, existing test pattern
- UI-SPEC: `.planning/phases/05-user-profiles/05-UI-SPEC.md` — page layout, component list, interaction states, copywriting

### Secondary (MEDIUM confidence)

- Supabase Storage API: upload/getPublicUrl/remove patterns verified against known v2 JS SDK API shape; consistent with `@supabase/supabase-js ^2.99.1` in package.json
- Next.js 15 App Router: `params` as Promise pattern confirmed in existing `app/articles/[slug]/page.tsx` (observed but not fetched from docs)
- PostgREST error code `PGRST116` (no rows returned by `.single()`) — standard PostgREST v12 behavior, consistent with Supabase JS SDK

### Tertiary (LOW confidence)

- Storage bucket RLS SQL syntax (`storage.foldername(name)`) — standard Supabase Storage policy helper function; confirmed pattern from Supabase docs as of training data; verify current syntax in Supabase dashboard before writing migration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed; only Avatar/Select/Input shadcn add needed
- Architecture: HIGH — directly extends Phase 4 patterns; table already exists
- Database state: HIGH — read directly from migration files
- Supabase Storage API: MEDIUM — consistent with known SDK patterns; verify `storage.foldername` RLS helper syntax
- Pitfalls: HIGH — derived from direct codebase analysis (middleware gap, NULL username, badge color override)

**Research date:** 2026-03-21
**Valid until:** 2026-04-20 (stable stack — Supabase, Next.js 15, shadcn)
