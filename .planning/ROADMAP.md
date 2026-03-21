# Roadmap: Clinical to Code

**7 phases | 23 requirements | Generated: 2026-03-15**

## Overview

| # | Phase | Goal | Requirements |
|---|-------|------|--------------|
| 1 | Foundation | Scaffold the full tech stack and deploy a working skeleton to production | INFRA-01 |
| 2 | Auth | Build all authentication flows with verified email sessions | AUTH-01, AUTH-02, AUTH-03 |
| 3 | 1/1 | Complete   | 2026-03-20 |
| 4 | 3/6 | In Progress|  |
| 5 | User Profiles | Create public profile pages and user settings for credentials and avatar | PROF-01, PROF-02, PROF-03 |
| 6 | Moderation | Give admin tools to moderate content and users, and publish community guidelines | MOD-01, MOD-02, MOD-03, MOD-04 |
| 7 | Monetization | Wire newsletter signup and reserve AdSense ad slots | MONEY-01, MONEY-02 |

---

## Phase Details

### Phase 1: Foundation
**Goal:** Initialize the full tech stack, configure all services, and deploy a working skeleton to Vercel with all environment variables in place.
**Requirements:** INFRA-01
**Success Criteria:**
1. `vercel.app` preview URL loads a Next.js 15 App Router page without errors.
2. Supabase project is connected via PgBouncer port 6543 and a test query executes successfully from a Server Component.
3. Sanity Studio loads at `/studio` in development.
4. All required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SANITY_PROJECT_ID`, etc.) are set in Vercel and the build passes.
5. Running `supabase db push` applies the baseline migration with no errors and the schema is version-controlled.

---

### Phase 2: Auth
**Goal:** Implement email/password signup, email verification, and persistent login sessions with all auth emails customized for the clinicaltocode.com brand.
**Requirements:** AUTH-01, AUTH-02, AUTH-03
**Success Criteria:**
1. A new user can complete the signup form, receive a verification email, click the link, and land on a confirmation page.
2. An unverified user who attempts to post in the forum is blocked with a clear "verify your email" message.
3. A logged-in user refreshes the browser and remains authenticated (session persists via `middleware.ts` token refresh).
4. Signing out immediately invalidates the session — protected routes redirect to login.
5. Auth emails display the `clinicaltocode.com` sender name and branding, not "Supabase".

---

### Phase 3: Content
**Goal:** Enable the admin to publish articles in Sanity Studio and surface them on public article index and detail pages, with each published article automatically creating a linked forum thread.
**Requirements:** CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria:**
1. Admin can create, edit, and publish an article in Sanity Studio without touching code or triggering a redeploy.
2. Published article appears on the `/articles` index page and is filterable by category with pagination.
3. Individual article page displays title, author name with credential, estimated read time, category, and tags.
4. Publishing an article in Sanity automatically creates a corresponding thread in the correct forum category (visible within 60 seconds via on-demand revalidation).

---

### Phase 4: Forum
**Goal:** Build the full Reddit-style community discussion system — public browsing, authenticated thread creation and replies with 2-level nesting, upvotes, clinical specialty categories, and bookmarks.
**Requirements:** FORUM-01, FORUM-02, FORUM-03, FORUM-04, FORUM-05, FORUM-06
**Plans:** 3/6 plans executed

Plans:
- [ ] 04-01-PLAN.md — Wave 0 test stubs + date-fns install + Phase 4 database migration (forum_posts, forum_votes, forum_bookmarks, ALTER forum_threads, toggle_vote RPC, RLS)
- [ ] 04-02-PLAN.md — Forum data layer: lib/forum/types.ts, utils.ts, queries.ts, actions.ts, Drizzle schema.ts
- [ ] 04-03-PLAN.md — Middleware update: add /forum/bookmarks to auth guard
- [ ] 04-04-PLAN.md — Read-only browsing UI: category index, thread list, thread detail pages + ThreadCard + PostItem components
- [ ] 04-05-PLAN.md — Write UI: /forum/new thread creation form + inline ReplyForm component
- [ ] 04-06-PLAN.md — Interactive components: VoteButton, BookmarkButton + /forum/bookmarks page + human-verify checkpoint

**Success Criteria:**
1. A logged-out visitor can browse all forum categories, thread lists, and read individual threads without being prompted to sign in.
2. An authenticated verified user can create a new thread in a category and the thread is immediately visible to all visitors.
3. An authenticated verified user can reply to a thread, and another user can reply to that reply (2-level nesting rendered correctly).
4. Clicking the upvote button increments the vote count atomically — repeated rapid clicks do not produce a race condition (verified via concurrent test or RPC function).
5. Forum categories include at least Nursing, EHR, Clinical Informatics, Pharmacy, and Physician Perspectives.
6. An authenticated user can bookmark a thread and view all their saved threads on a dedicated bookmarks page.

---

### Phase 5: User Profiles
**Goal:** Give every user a public profile page showing their identity and post history, and allow users to configure their credential badge and avatar.
**Requirements:** PROF-01, PROF-02, PROF-03
**Success Criteria:**
1. Navigating to `/profile/[username]` shows that user's username, join date, credential badge, and paginated post history.
2. A user can select a credential badge (RN, NP, MD, PharmD, CMIO, Health IT, etc.) in their settings and it appears on their public profile and next to their forum posts.
3. A user can upload a profile avatar (stored in Supabase Storage) and write a short bio — both are visible on their public profile page.

---

### Phase 6: Moderation
**Goal:** Equip the admin to handle reported content, remove harmful posts, ban bad actors, and publish community guidelines before any public launch.
**Requirements:** MOD-01, MOD-02, MOD-03, MOD-04
**Success Criteria:**
1. Any authenticated user can click a report button on a post or thread, submit a reason, and the report is recorded in the database.
2. The admin can view a queue of all pending reports at `/admin/reports` and mark individual reports as reviewed.
3. The admin can soft-delete a post or thread (it disappears from public view but remains in the database) and ban a user account so they cannot log in.
4. A public `/community-guidelines` page is live and linked from the site navigation, covering de-identification expectations, professional tone, and platform norms.

---

### Phase 7: Monetization
**Goal:** Wire newsletter signup with double opt-in and add properly sized ad slot containers to article and forum pages ready for AdSense activation.
**Requirements:** MONEY-01, MONEY-02
**Success Criteria:**
1. A visitor submits their email on the newsletter signup form, receives a confirmation email via Resend, and clicking the confirmation link subscribes them (double opt-in complete).
2. Article pages and the homepage include clearly defined, fixed-height `<div>` ad slot containers that do not cause Cumulative Layout Shift (CLS score 0 in Lighthouse).
3. Forum thread pages include at least one reserved ad slot container in the correct position.
4. AdSense script loads with `strategy="lazyOnload"` and does not block page interactivity.

---

*Roadmap generated: 2026-03-15*
