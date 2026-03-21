# Phase 6: Moderation - Research

**Researched:** 2026-03-21
**Domain:** Content moderation — report system, admin panel, soft-delete, community guidelines
**Confidence:** HIGH

## Summary

Phase 6 adds the moderation layer that makes a public launch responsible: users can flag harmful content, the admin can triage reports and take action, and a community guidelines page sets expectations. The stack is entirely internal — no third-party moderation service is needed. All four requirements (MOD-01 through MOD-04) map cleanly onto established patterns already present in the codebase.

The core new artifact is a `content_reports` table with a unique constraint per (reporter, target). Admin operations (mark reviewed, soft-delete, ban user) are Server Actions protected by an `is_admin` check drawn from `user_profiles`. The admin panel is four Next.js App Router pages under `/admin`. The community guidelines page is a static MDX/JSX page with no CMS dependency.

**Primary recommendation:** Build all mutations as Server Actions following the `lib/profile/actions.ts` pattern. Admin route protection belongs in `middleware.ts` as a third guard block parallel to the existing `/settings` guard. Avoid SECURITY DEFINER for report submission — RLS policy with `auth.uid() = reporter_id` is sufficient.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Report Flow
- Report button on posts and threads opens a **modal** (not inline, not full-page)
- Modal contains a **dropdown of pre-set clinical reasons** + optional free-text details field
- Pre-set reasons: Patient data / PHI risk, Misinformation, Harassment, Spam, Off-topic for platform
- After submitting, inline confirmation replaces the modal content: "Report submitted. We'll review it."
- **One report per user per target**: DB unique constraint on (reporter_id, target_type, target_id) — report button grays out after submitting
- Reporter does NOT see a list of their submitted reports (no reports history page)

#### Admin Panel Scope
- Full admin panel with four pages:
  - `/admin` — dashboard with quick stats: pending reports count, recent bans, new users
  - `/admin/reports` — report queue, default view is "Pending", toggle to show "All"
  - `/admin/users` — user list with search by username/email, is_banned status, ban/unban action
  - `/admin/content` — browse soft-deleted posts/threads, restore or permanently remove
- Admin access gated by `is_admin = true` on `user_profiles` — checked in middleware, redirect to `/` if false
- Admin sets own `is_admin = true` directly in Supabase SQL Editor (solo operator pattern)
- Per-report actions on `/admin/reports`: "Mark reviewed" (closes report) + optional inline "Delete post/thread" + optional inline "Ban user"

#### Soft-Delete Visibility
- Not explicitly discussed — Claude's discretion. Standard approach: soft-deleted posts show as `[This post has been removed]` placeholder visible to all users; soft-deleted threads are hidden from listings but accessible via direct URL to admin

#### Community Guidelines
- Public page at `/community-guidelines`
- Navigation: **forum header banner** — a dismissible notice in the forum area pointing users to the guidelines (in addition to footer link)
- Content: Claude drafts the guidelines based on clinical platform context (de-identification, professional tone, platform norms); founder reviews and edits before launch
- Format: **Structured sections with headers** — named sections such as "De-identification & Patient Privacy", "Professional Conduct", "Acceptable Content", "Enforcement"
- Page is static (no CMS) — hardcoded MDX or JSX content, since it's founder-managed and rarely updated

### Claude's Discretion
- Exact styling of the admin panel (functional over polished — solo operator tool)
- Soft-delete placeholder text wording
- Banner dismissal persistence (localStorage vs session vs none)
- Migration file naming and exact SQL structure for reports table

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MOD-01 | Authenticated user can report a post or thread via a report button | `content_reports` table + RLS INSERT policy + `submitReport` Server Action + modal component wired into `PostItem` and `ThreadCard` |
| MOD-02 | Admin can view a queue of reported content and mark reports as reviewed | `/admin/reports` page with Server Component query + `markReviewed` Server Action + `is_admin` middleware guard |
| MOD-03 | Admin can soft-delete any post or thread and ban a user account | `softDeleteContent` + `banUser` + `unbanUser` Server Actions; `is_removed` column already exists on both forum tables; `is_banned` already exists on `user_profiles` |
| MOD-04 | Site has a publicly visible Community Guidelines page | Static JSX page at `app/community-guidelines/page.tsx` + dismissible banner in forum header area |

</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15 (existing) | Admin pages + community guidelines route | Already the project framework |
| Supabase Postgres | existing | `content_reports` table, RLS, admin queries | Single DB for entire project |
| `@supabase/ssr` | existing | Server Actions auth + Supabase client | Established project pattern |
| Tailwind CSS | existing | Admin panel styling | Already in use |
| shadcn `Badge`, `Button`, `Input`, `Select`, `Textarea` | existing | Report modal + admin UI components | Already installed |
| Base UI (Dialog/Modal) | `@base-ui/react ^1.3.0` (existing) | Report modal overlay | Project uses Base UI for interactive primitives |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | existing | Icons in admin UI (Flag, Ban, Trash2, CheckCircle) | Consistent with rest of the app |
| `localStorage` | browser native | Banner dismissal persistence | Simplest option for "seen" state without server round-trip |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static JSX community guidelines page | MDX file | MDX adds build tooling; JSX is simpler for a page the founder edits in code anyway |
| RLS-only for report INSERT | SECURITY DEFINER function | SECURITY DEFINER adds complexity; plain RLS with `auth.uid() = reporter_id` is sufficient here — no multi-table atomicity needed |
| Four separate admin layout files | Single `app/admin/layout.tsx` | Shared layout is cleaner and enforces admin guard at one point |

**Installation:** No new packages required. All needed libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── admin/
│   ├── layout.tsx              # shared admin shell (nav + title)
│   ├── page.tsx                # /admin dashboard — stats
│   ├── reports/
│   │   └── page.tsx            # /admin/reports — report queue
│   ├── users/
│   │   └── page.tsx            # /admin/users — user list + ban
│   └── content/
│       └── page.tsx            # /admin/content — soft-deleted content
├── community-guidelines/
│   └── page.tsx                # static public page
components/
├── forum/
│   ├── report-button.tsx       # trigger button (client, opens modal)
│   ├── report-modal.tsx        # Base UI Dialog — form + confirmation state
│   └── guidelines-banner.tsx   # dismissible forum header banner (client)
lib/
└── moderation/
    ├── types.ts                # ContentReport, ReportStatus types
    └── actions.ts              # submitReport, markReviewed, softDeleteContent, banUser, unbanUser
supabase/migrations/
└── 20260322000001_add_moderation.sql  # content_reports table + RLS
```

### Pattern 1: Admin Route Guard in Middleware
**What:** Add a third guard block in `middleware.ts` that checks `is_admin` from `user_profiles` for `/admin/*` paths.
**When to use:** Every admin page — the guard lives in one place and fires before any page renders.
**Example:**
```typescript
// middleware.ts — add after the existing /settings guard block

// Admin guard: check is_admin from user_profiles
if (user && pathname.startsWith('/admin')) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
}

// Also gate unauthenticated users out of /admin entirely
if (!user && pathname.startsWith('/admin')) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/login'
  return NextResponse.redirect(url)
}
```

### Pattern 2: Server Action with Admin Authorization Check
**What:** Every admin mutation Server Action re-checks `is_admin` server-side (defense-in-depth beyond middleware).
**When to use:** Any Server Action that modifies reports, users, or content on behalf of admin.
**Example:**
```typescript
// lib/moderation/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function markReviewed(reportId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from('content_reports')
    .update({ status: 'reviewed', reviewed_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) throw new Error(error.message)
}
```

### Pattern 3: submitReport Server Action (user-facing)
**What:** Non-admin Server Action that inserts a report. Uses regular `createClient()` and relies on RLS for authorization. The unique constraint on (reporter_id, target_type, target_id) makes duplicate submission a DB-level no-op (or catchable error).
**Example:**
```typescript
// lib/moderation/actions.ts
export async function submitReport(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to report content')

  const targetType = formData.get('target_type') as 'thread' | 'post'
  const targetId = formData.get('target_id') as string
  const reason = formData.get('reason') as string
  const details = (formData.get('details') as string | null)?.trim() || null

  const { error } = await supabase.from('content_reports').insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
  })

  // Unique constraint violation = already reported — treat as success
  if (error && error.code !== '23505') throw new Error(error.message)
}
```

### Pattern 4: Soft-Delete Placeholder Rendering
**What:** `PostItem` checks `post.is_removed` — if true, renders a greyed-out placeholder instead of post body. `is_removed` already exists on `forum_posts` and `forum_threads` from Phase 4.
**Example:**
```typescript
// components/forum/post-item.tsx (extension)
if (post.is_removed) {
  return (
    <div className="border border-border rounded-lg p-4 mt-4 text-sm text-muted-foreground italic">
      [This post has been removed by a moderator.]
    </div>
  )
}
```
For threads: filter `is_removed === true` rows out of category listings. A removed thread's URL still resolves — the thread detail page checks `is_removed` and renders the placeholder title.

### Pattern 5: Report Modal (Base UI Dialog)
**What:** `ReportButton` is a small client component that opens a Base UI Dialog. Inside is a controlled form with a `<select>` for pre-set reasons and a `<textarea>` for details. On success the dialog content transitions to a confirmation message.
**When to use:** Triggered from `PostItem` and `ThreadCard`.

### Anti-Patterns to Avoid
- **Checking `is_admin` only in middleware:** Server Actions are callable directly; always double-check in the action.
- **Trusting `reporter_id` from form data:** Always derive reporter identity from `supabase.auth.getUser()` in the Server Action.
- **Using `NextResponse.next()` instead of `supabaseResponse` in middleware:** Discards refreshed session cookies — the existing middleware comment warns about this.
- **Permanent delete as the first admin action:** Soft-delete is the default. Permanent delete is a separate explicit step in `/admin/content`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| One-report-per-user enforcement | Application-level check-then-insert | DB `UNIQUE (reporter_id, target_type, target_id)` constraint | Atomic; race-condition-proof |
| Admin authorization | Custom session/role middleware | `is_admin` from `user_profiles` + middleware guard + action double-check | Already in schema; consistent with `is_banned` pattern |
| Modal overlay | Custom z-index + focus-trap | Base UI Dialog (already in project) | Handles focus trap, ARIA, escape key |
| Report status enum | Freeform TEXT with app validation | `CHECK (status IN ('pending', 'reviewed'))` DB constraint | DB is the authority |
| Banner dismissal | Server-side "seen" flag | `localStorage` key (e.g., `guidelines_banner_dismissed`) | Zero server cost; acceptable loss on cache clear |

**Key insight:** The `is_removed` column and `is_banned` column already exist in the schema from previous phases. No schema surgery needed for those columns — only a new `content_reports` table is required.

---

## Common Pitfalls

### Pitfall 1: Admin Middleware Query Adds Latency to All Routes
**What goes wrong:** Checking `is_admin` from the database in middleware fires on every request (including public pages), adding unnecessary latency for anonymous users.
**Why it happens:** Middleware runs on every matched path.
**How to avoid:** Guard the DB query behind `pathname.startsWith('/admin')` so the profile lookup only fires for admin routes. Unauthenticated guard (redirect to login) runs first and short-circuits before the DB query.
**Warning signs:** Noticeably slower page loads on public forum pages after adding the admin guard.

### Pitfall 2: Duplicate Report Constraint Error Surfaced to User
**What goes wrong:** A user clicks Report twice (double-click or re-open). The unique constraint throws a Postgres error `23505`. If uncaught, this surfaces as an unhandled error.
**How to avoid:** In `submitReport` action, explicitly check for error code `23505` and treat it as a no-op (success). Report button grays out optimistically on first submit.
**Warning signs:** "already exists" error surfacing in UI.

### Pitfall 3: Soft-Deleted Threads Appearing in Category Listings
**What goes wrong:** The category thread listing query fetches all threads, including `is_removed = true`, showing removed content to regular users.
**How to avoid:** Add `.eq('is_removed', false)` filter to all public-facing thread queries. The admin `/admin/content` page explicitly queries `.eq('is_removed', true)` instead.
**Warning signs:** Removed threads visible in category pages.

### Pitfall 4: RLS Blocks Admin Updates on Other Users' Content
**What goes wrong:** Admin tries to soft-delete a post via Supabase client. The existing RLS UPDATE policy on `forum_posts` is `USING (auth.uid() = author_id)`, which blocks the admin since they're not the author.
**Why it happens:** RLS applies to all authenticated clients including admin.
**How to avoid:** Either (a) use a SECURITY DEFINER function for admin mutations, or (b) add an additional RLS UPDATE policy: `USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true))`. Option (b) is simpler and does not require a new DB function.
**Warning signs:** Admin soft-delete action returns a Postgres error / 0 rows affected.

### Pitfall 5: Banner Re-Appearing After Every Navigation
**What goes wrong:** The guidelines banner is a Server Component or has no client-side dismissal persistence, so it re-renders (and re-shows) on every page navigation.
**How to avoid:** Make `GuidelinesBanner` a `'use client'` component. On mount, read `localStorage.getItem('guidelines_banner_dismissed')`. On dismiss, write the key. Render `null` if the key is set.
**Warning signs:** Banner reappears every time user navigates between forum pages.

---

## Code Examples

### content_reports Table Schema
```sql
-- supabase/migrations/20260322000001_add_moderation.sql
CREATE TABLE content_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'post')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL CHECK (reason IN (
                 'Patient data / PHI risk',
                 'Misinformation',
                 'Harassment',
                 'Spam',
                 'Off-topic for platform'
               )),
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id)
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Users can INSERT their own reports
CREATE POLICY "authenticated users can submit reports"
  ON content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters can see if they already reported (for grayed-out button)
CREATE POLICY "users can see own reports"
  ON content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admins can read all reports and update status
-- Admin UPDATE/SELECT is handled via service client in Server Actions
-- (supabaseAdmin bypasses RLS — use for admin-only operations)
```

### Admin RLS Policy for forum_posts Updates
```sql
-- Add to 20260322000001_add_moderation.sql
-- Allows admin to soft-delete any post (bypasses author_id check)
CREATE POLICY "admins can update any post"
  ON forum_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Same for forum_threads
CREATE POLICY "admins can update any thread"
  ON forum_threads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### Admin Dashboard Stats Query
```typescript
// In app/admin/page.tsx (Server Component)
const supabase = await createClient()

const [reportsResult, bansResult, usersResult] = await Promise.all([
  supabase
    .from('content_reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending'),
  supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_banned', true),
  supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .order('created_at', { ascending: false })
    .limit(1),
])
```

### hasReported Check (for grayed-out button)
```typescript
// Called server-side in thread detail / category page where user is authenticated
async function hasUserReported(userId: string, targetType: 'thread' | 'post', targetId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('content_reports')
    .select('id')
    .eq('reporter_id', userId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle()
  return !!data
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate `admin_*` tables | `is_admin` boolean on `user_profiles` | Established in Phase 2 schema | Admin flag already in schema — no new table needed |
| Server-side modal state | Client component with `useState` | Phase 4+ | Report modal must be `'use client'` — it has interactive state |
| getSession() in middleware | getUser() in middleware | Supabase SSR recommendation | Project already uses `getUser()` — continue that pattern |

**Deprecated/outdated:**
- Using a separate `admin_users` table: the project stores `is_admin` on `user_profiles` — do not create a separate admin table.

---

## Open Questions

1. **Admin reads content_reports: RLS or service client?**
   - What we know: Regular `createClient()` with the existing SELECT policy `users can see own reports` would only return reports filed by the currently logged-in admin (as reporter), not all reports.
   - What's unclear: Should admin reads use `supabaseAdmin` service client (bypasses RLS entirely) or should we add a separate admin SELECT policy?
   - Recommendation: Add an explicit admin SELECT policy: `USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true))`. This is cleaner than a blanket service client for read operations. For UPDATE (mark reviewed, etc.) the same policy structure applies.

2. **Soft-deleted thread URL behavior**
   - What we know: Context says admin can access via direct URL; removed threads hidden from listings.
   - What's unclear: What does a non-admin user see if they navigate directly to a removed thread URL?
   - Recommendation: Show a generic "This discussion has been removed." page (404 response or placeholder page). The thread detail Server Component checks `is_removed` and returns `notFound()` for non-admin users.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + jsdom |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/forum/moderation.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOD-01 | `submitReport` rejects duplicate (unique constraint) gracefully | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ Wave 0 |
| MOD-01 | Report reason allowlist validates correctly | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ Wave 0 |
| MOD-02 | `markReviewed` status transition logic | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ Wave 0 |
| MOD-03 | Soft-delete renders placeholder, not post body | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ Wave 0 |
| MOD-03 | `banUser` / `unbanUser` toggle `is_banned` correctly | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ Wave 0 |
| MOD-04 | Community guidelines page renders all required sections | manual | N/A — browser verification | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/forum/moderation.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/forum/moderation.test.ts` — covers MOD-01 through MOD-03 logic

---

## Sources

### Primary (HIGH confidence)
- Existing codebase — `middleware.ts`, `lib/profile/actions.ts`, `lib/forum/types.ts`
- `supabase/migrations/20260315_add_user_profiles.sql` — confirmed `is_admin`, `is_banned` columns exist
- `supabase/migrations/20260321000000_add_forum_write_tables.sql` — confirmed `is_removed` on `forum_threads` and `forum_posts`

### Secondary (MEDIUM confidence)
- Postgres unique constraint behavior (`23505` error code) — standard Postgres documentation
- Supabase RLS policy patterns — established in prior phases; consistent with Supabase docs patterns

### Tertiary (LOW confidence)
- None — all claims grounded in existing project code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all existing
- Architecture: HIGH — direct extension of established patterns in this codebase
- Pitfalls: HIGH — RLS pitfall (#4) verified by reading existing migration policies
- Schema: HIGH — existing columns confirmed by reading migration files

**Research date:** 2026-03-21
**Valid until:** 2026-05-21 (stable stack, 60-day validity)
