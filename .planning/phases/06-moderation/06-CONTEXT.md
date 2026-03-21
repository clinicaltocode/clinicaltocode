# Phase 6: Moderation - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Equip the admin to handle reported content, remove harmful posts, ban bad actors, and publish community guidelines before public launch. Scope: content reporting system, admin panel (reports queue + user management + content browser + dashboard), and a public /community-guidelines page. In-scope: MOD-01 through MOD-04. Out of scope: real-time notifications for reports, appeal workflows, automated moderation.

</domain>

<decisions>
## Implementation Decisions

### Report Flow
- Report button on posts and threads opens a **modal** (not inline, not full-page)
- Modal contains a **dropdown of pre-set clinical reasons** + optional free-text details field
- Pre-set reasons: Patient data / PHI risk, Misinformation, Harassment, Spam, Off-topic for platform
- After submitting, inline confirmation replaces the modal content: "Report submitted. We'll review it."
- **One report per user per target**: DB unique constraint on (reporter_id, target_type, target_id) — report button grays out after submitting
- Reporter does NOT see a list of their submitted reports (no reports history page)

### Admin Panel Scope
- Full admin panel with four pages:
  - `/admin` — dashboard with quick stats: pending reports count, recent bans, new users
  - `/admin/reports` — report queue, default view is "Pending", toggle to show "All"
  - `/admin/users` — user list with search by username/email, is_banned status, ban/unban action
  - `/admin/content` — browse soft-deleted posts/threads, restore or permanently remove
- Admin access gated by `is_admin = true` on `user_profiles` — checked in middleware, redirect to `/` if false
- Admin sets own `is_admin = true` directly in Supabase SQL Editor (solo operator pattern)
- Per-report actions on `/admin/reports`: "Mark reviewed" (closes report) + optional inline "Delete post/thread" + optional inline "Ban user"

### Soft-Delete Visibility
- Not explicitly discussed — Claude's discretion. Standard approach: soft-deleted posts show as `[This post has been removed]` placeholder visible to all users; soft-deleted threads are hidden from listings but accessible via direct URL to admin

### Community Guidelines
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Schema
- `supabase/migrations/20260315_add_user_profiles.sql` — `user_profiles` table definition; `is_admin` and `is_banned` columns already exist (no migration needed for those)
- `supabase/migrations/20260316000000_add_forum_tables.sql` — `forum_threads` and `forum_posts` table definitions (for soft-delete column additions)

### Existing Types and Patterns
- `lib/forum/types.ts` — `ForumThread`, `ForumPost`, `AuthorMeta` interfaces; extend or add to this file for moderation types
- `middleware.ts` — existing auth guard pattern; admin guard (`is_admin`) must follow the same structure

### Requirements
- `.planning/REQUIREMENTS.md` §MOD-01–MOD-04 — four moderation requirements this phase must satisfy

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/badge.tsx` — shadcn Badge; reuse for report status indicators (Pending, Reviewed)
- `components/ui/button.tsx` + `button-variants.ts` — existing button patterns (use buttonVariants on links per Phase 4 pattern)
- `components/ui/input.tsx`, `textarea.tsx`, `select.tsx` — existing form primitives for report modal and admin filters
- `components/forum/post-item.tsx`, `thread-card.tsx` — extend these to add the report button trigger

### Established Patterns
- Server Actions for mutations (updateProfile, updateAvatarUrl in lib/profile/actions.ts) — use same pattern for submitReport, markReviewed, softDelete, banUser
- `supabase.auth.getUser()` for identity in Server Actions — never trust form data for user identity
- SECURITY DEFINER functions for operations that need to bypass RLS mid-transaction (e.g., toggle_vote) — consider for report submission if RLS complexity requires it
- `buttonVariants` on `<a>`/`<Link>` instead of `Button asChild` — Base UI doesn't support asChild

### Integration Points
- `middleware.ts` — add `/admin/*` route guard checking `is_admin` from user_profiles; parallel to existing `/settings/*` guard added in Phase 5
- `app/forum/` — forum header area needs the community guidelines banner component
- `components/forum/post-item.tsx` and `thread-card.tsx` — add "Report" button to each, conditionally hidden for own content or unauthenticated users

</code_context>

<specifics>
## Specific Ideas

- Admin panel is a solo operator tool — functional and clear over polished. Think Supabase dashboard aesthetic, not a consumer product.
- Forum header banner for community guidelines should be **dismissible** — users who've seen it shouldn't see it on every visit
- The report modal should be accessible from both the thread list view (on ThreadCard) and the thread detail view (on PostItem)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-moderation*
*Context gathered: 2026-03-21*
