# Pitfalls Research

**Scope**: Next.js 15 (App Router) + Supabase + Sanity + Reddit-style forum on Vercel serverless
**Context**: Greenfield rebuild of clinicaltocode.com — prior site had database connection failures and unreliable community features from a v0.app-generated codebase lacking connection pooling.

---

## Database & Connection Pitfalls

### 1. Connecting Directly to Postgres Instead of Through PgBouncer

**The core issue that killed the prior site.** Supabase provides two connection strings: a direct Postgres connection on port 5432 and a pooled connection through PgBouncer on port 6543. Vercel serverless functions spin up new Node.js processes for every invocation and do not share connection state between requests. Each function execution that uses the direct connection opens a new TCP connection to Postgres. Supabase's free and pro tiers cap Postgres at 60–100 direct connections. Under even moderate traffic — or during a hot-reload cycle in development — connection slots are exhausted and every subsequent request fails with `sorry, too many clients already`.

**Warning signs:**
- `Error: sorry, too many clients already` in Vercel function logs
- Database queries work fine locally but fail intermittently in production
- Errors cluster around deploy events or traffic spikes
- `pg_stat_activity` shows hundreds of `idle` connections from the same application user

**Prevention strategy:**
- Use the `DATABASE_URL` Supabase provides for pooling (port 6543, `?pgbouncer=true` suffix), never the direct URL, for all application query traffic
- Set `?pgbouncer=true&connection_limit=1` in the URL when using Prisma, because Prisma opens its own internal pool on top of PgBouncer — stacking two pools multiplies connections, it does not share them
- For Supabase's `@supabase/supabase-js` client, use the anon/service key approach through the REST/PostgREST API for most queries; it does not open raw Postgres connections at all
- Reserve the direct connection string (`DATABASE_URL` on port 5432) exclusively for migrations run from a long-lived process (CI pipeline, local machine), never from a serverless function

**Phase**: Infrastructure setup (before any feature work). Configure this before writing a single database query.

---

### 2. Instantiating the Supabase Client Outside the Request Lifecycle

Declaring `const supabase = createClient(url, key)` at module level in a Next.js App Router file seems harmless but causes two problems: (1) the client can be shared across requests in the same warm function instance, leaking cookies and auth context between users; (2) in Server Actions and Route Handlers, the auth session must be read from the incoming request headers — a module-level client cannot do this and will always behave as an anonymous, unauthenticated user.

**Warning signs:**
- User A sees User B's data intermittently
- Server Actions that check authentication always fail even when the user is logged in
- Auth works in the browser but not in server-side fetches

**Prevention strategy:**
- Create the Supabase client inside each Server Component, Route Handler, and Server Action using `createServerClient` from `@supabase/ssr` (the successor to `auth-helpers-nextjs`), passing the `cookies()` store from `next/headers`
- Create a utility function (e.g., `lib/supabase/server.ts`) that constructs the server client from cookies on every call — do not cache or reuse the returned instance across requests
- For Client Components, use `createBrowserClient` from `@supabase/ssr` — one instance per component tree is fine because the browser has one user

**Phase**: Auth scaffold (Phase 1). Get this pattern right before building any protected routes.

---

### 3. Missing Database Indexes on High-Query Forum Tables

A Reddit-style forum has predictable query patterns that will destroy performance without proper indexes: listing threads by category sorted by `created_at` or `vote_count`, fetching a thread with its reply count, ordering posts by "hot" score. Supabase's free tier runs on shared infrastructure — a sequential scan over 50,000 posts is not just slow, it consumes connection time and will cause timeouts.

**Warning signs:**
- Thread listing pages become slow after a few thousand rows
- Supabase dashboard shows high query execution times in the SQL editor
- Vote/count queries slow down disproportionately as rows grow

**Prevention strategy:**
- Add composite indexes at migration time for the exact queries the forum will run:
  - `CREATE INDEX idx_threads_category_created ON threads(category_id, created_at DESC);`
  - `CREATE INDEX idx_threads_category_votes ON threads(category_id, vote_count DESC);`
  - `CREATE INDEX idx_replies_thread_id ON replies(thread_id, created_at ASC);`
  - `CREATE INDEX idx_votes_thread_user ON votes(thread_id, user_id);` (also enforces one-vote-per-user at the DB level)
- Enable `pg_stat_statements` in Supabase to identify slow queries before they become production incidents
- Use `EXPLAIN ANALYZE` in Supabase's SQL editor against representative datasets before launch

**Phase**: Schema design (before seeding any data).

---

### 4. Cascading Deletes Not Defined — Orphaned Rows

Forum features create deeply nested relationships: categories → threads → replies → votes → notifications. Without `ON DELETE CASCADE` foreign key constraints, deleting a thread leaves orphaned replies and votes. Deleting a user leaves orphaned content. These orphans accumulate silently and surface as broken counts, broken joins, and eventually constraint violations when you try to clean them up.

**Warning signs:**
- Vote counts don't match manual counts
- Deleted threads still appear in reply counts
- User deletion throws foreign key errors

**Prevention strategy:**
- Define all foreign keys with explicit delete behavior in migrations:
  - `thread_id REFERENCES threads(id) ON DELETE CASCADE` for replies and votes
  - `user_id REFERENCES auth.users(id) ON DELETE SET NULL` for threads/replies (preserve content, remove attribution)
  - `user_id REFERENCES auth.users(id) ON DELETE CASCADE` for votes and notifications (remove personal data)
- Distinguish between "delete cascades content" (votes) and "delete anonymizes content" (user's posts) — get this decision right up front because changing it later requires data migrations

**Phase**: Schema design.

---

### 5. Vote Count Stored as Denormalized Integer Without Concurrency Protection

Storing `vote_count` as a column on the threads table and updating it with `UPDATE threads SET vote_count = vote_count + 1` from a serverless function is a race condition. Two simultaneous upvotes will both read the same value and both write the same incremented value, losing one vote. At low traffic this is undetectable. At even moderate forum activity it compounds.

**Warning signs:**
- Vote counts are consistently lower than expected
- Inconsistencies between `vote_count` column and `SELECT COUNT(*) FROM votes WHERE thread_id = ?`

**Prevention strategy:**
- Use a Postgres function (`SECURITY DEFINER` RPC) to handle vote logic atomically:
  ```sql
  CREATE OR REPLACE FUNCTION vote_on_thread(p_thread_id uuid, p_user_id uuid, p_value int)
  RETURNS void LANGUAGE plpgsql AS $$
  BEGIN
    INSERT INTO votes (thread_id, user_id, value) VALUES (p_thread_id, p_user_id, p_value)
    ON CONFLICT (thread_id, user_id) DO UPDATE SET value = EXCLUDED.value;
    UPDATE threads SET vote_count = (SELECT COALESCE(SUM(value), 0) FROM votes WHERE thread_id = p_thread_id)
    WHERE id = p_thread_id;
  END;
  $$;
  ```
- Call this function via `supabase.rpc('vote_on_thread', {...})` — the operation runs inside a single Postgres transaction
- Add a `UNIQUE(thread_id, user_id)` constraint on the votes table to enforce one vote per user at the database level

**Phase**: Forum schema and API design.

---

### 6. Running Migrations Manually Instead of Using a Migration Tool

Applying schema changes by pasting SQL into the Supabase dashboard SQL editor creates an undocumented, unreproducible database state. There is no record of what was applied, no way to roll back, and no way to recreate the schema in a staging environment.

**Warning signs:**
- The production database schema cannot be recreated from the codebase
- Schema drift between local development and production
- "I'm not sure if I applied that change" in git history

**Prevention strategy:**
- Use Supabase CLI with `supabase migration new` to create timestamped migration files committed to the repository
- Run `supabase db push` to apply migrations to production; never use the dashboard SQL editor for schema changes
- Keep `supabase/migrations/` in version control alongside application code

**Phase**: Project initialization (before the first table is created).

---

## Forum/Community Pitfalls

### 7. Implementing Nested Replies Without Deciding on a Depth Limit

Reddit-style forums need nested replies, but infinite nesting is a rendering and query nightmare. Fetching an infinitely nested tree requires recursive CTEs or application-level recursion. Rendering deeply nested threads breaks mobile layouts. Most successful forums cap nesting at 2–3 levels and render deeper comments at the same indent level as the cap.

**Warning signs:**
- Thread pages load slowly as reply counts grow
- Mobile layout breaks on deeply nested threads
- Recursive query for a single thread times out

**Prevention strategy:**
- Decide on a max nesting depth (2 levels recommended for this use case) before schema design
- Store `parent_reply_id` as a nullable foreign key on the replies table; the application enforces the depth cap, not the database
- Fetch threads using a single JOIN query: one query for the thread, one for top-level replies, one for second-level replies — three queries total, not N queries
- Never fetch the entire reply tree recursively in a single unbounded query

**Phase**: Forum schema design.

---

### 8. Not Protecting Vote and Reply Endpoints With Row Level Security

Supabase exposes a PostgREST API that clients can call directly. Without Row Level Security (RLS) policies, any authenticated user can vote multiple times, delete other users' threads, or insert replies as another user by passing any `user_id` they choose in the request body.

**Warning signs:**
- `user_id` is accepted from the client request body in insert/update operations
- RLS is disabled on community tables in the Supabase dashboard
- No policies are defined on `votes`, `threads`, or `replies`

**Prevention strategy:**
- Enable RLS on every table that holds user-generated content; disabling RLS is a valid choice only for truly public read-only reference data
- Never trust `user_id` from the client — always derive it from the authenticated session:
  ```sql
  CREATE POLICY "users insert own threads" ON threads
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "users delete own threads" ON threads
    FOR DELETE USING (auth.uid() = user_id);
  ```
- Write a policy test using the Supabase CLI's `supabase test db` capability before any content tables are exposed

**Phase**: Auth + data model (before any public-facing feature ships).

---

### 9. Building Forum Sort/Feed Without a Hot Score Algorithm

Sorting threads by `created_at DESC` (newest) or `vote_count DESC` (top all time) are the two easiest sorts but both produce bad user experiences over time. A 3-year-old post with 500 votes permanently occupies the top slot under "top." A brand new post is immediately buried under today's posts by "new." Reddit-style forums need a time-decayed hot score.

**Warning signs:**
- Forum home page shows the same top posts indefinitely
- New content is immediately invisible unless sorted by "new"
- Engagement drops as early top posts permanently dominate

**Prevention strategy:**
- Compute a `hot_score` using a time-decay formula in a Postgres function:
  ```sql
  -- Wilson score lower bound for vote confidence, decayed by age
  -- Simplified version: score = (votes) / ((age_in_hours + 2) ^ 1.5)
  ```
- Store `hot_score FLOAT` on the threads table and recompute it via a Supabase Edge Function or scheduled pg_cron job (available on Pro tier) every 15 minutes
- Offer three sort modes from day one: Hot (default), New, Top

**Phase**: Forum feed API design.

---

### 10. Forum Moderation Has No Tools for a Solo Operator

A solo-run forum without moderation tooling becomes unusable quickly once real users join. Without the ability to delete posts, ban users, or mark content as removed, a single bad actor can make the forum toxic. Healthcare professional communities have additional sensitivity — medical misinformation is a specific risk category.

**Warning signs:**
- No admin route exists with moderation controls
- Deleted content leaves a blank space with no indicator it was removed
- No way to ban a user without direct database manipulation

**Prevention strategy:**
- Add a `is_removed BOOLEAN DEFAULT false` and `removed_by UUID` to threads and replies — soft delete, never hard delete (preserves reply structure and audit trail)
- Add a `is_banned BOOLEAN DEFAULT false` to the profiles table; enforce in RLS: `CHECK (NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_banned = true))`
- Build a minimal `/admin` route (protected by a `is_admin` flag on the profiles table) in Phase 1, not as an afterthought
- Add a "report" button on threads/replies that writes to a `reports` table the admin can review

**Phase**: Forum scaffold (before opening to any users, even beta).

---

### 11. Not Handling the Empty State — Forum Looks Dead at Launch

A forum with zero posts looks abandoned and gives early visitors no reason to post. The cold start problem is the single biggest reason new forums fail. This is especially acute for a professional audience like clinicians who will only contribute to a community that appears already active.

**Warning signs:**
- No seed content strategy exists in the project plan
- Forum categories exist but all show "0 threads"

**Prevention strategy:**
- Seed each forum category with 3–5 high-quality founder-written threads before any public announcement
- The founder (solo operator) can post under their own account as a real community member
- Frame early threads as open questions: "What EHR do you find most disruptive to your workflow?" invites participation
- Use Sanity content as thread starters: publish an article, then manually post a thread linking to it and asking for community reaction

**Phase**: Pre-launch content (before any public URL goes live).

---

## Auth Pitfalls

### 12. Using `supabase.auth.getUser()` Only on the Client Side

`supabase.auth.getUser()` on the client reads the JWT from localStorage. This is fine for displaying UI state (show/hide login button) but is useless for protecting server-side data access. A Server Component that tries to verify auth by calling `getUser()` without cookies will always return null and either fail silently or expose data to unauthenticated users.

**Warning signs:**
- Protected pages show the correct UI client-side but the server-side data fetch returns all rows regardless of auth state
- Removing the auth cookie in DevTools has no effect on what data the server returns

**Prevention strategy:**
- In Server Components, Route Handlers, and Server Actions, always use `createServerClient` with the `cookies()` store and call `supabase.auth.getUser()` from that instance — this validates the JWT on the server, not from localStorage
- Never use `supabase.auth.getSession()` to authorize server-side operations; `getSession()` reads from the cookie without re-validating against the server and can return stale sessions after a password change or account revocation
- `getUser()` makes a network call to Supabase to validate the token — use it for security-critical checks; `getSession()` is only safe for non-critical display logic

**Phase**: Auth scaffold.

---

### 13. Auth Token Refresh Not Handled in Middleware

Next.js App Router caches aggressively. If the Supabase auth token expires mid-session and the `middleware.ts` file does not proactively refresh it, users will be silently logged out or get 401 errors on API calls even though they appear logged in on the client.

**Warning signs:**
- Users report being "randomly" logged out after ~1 hour of inactivity
- Token refresh errors appear in Vercel function logs
- Auth state works on initial load but degrades over a long session

**Prevention strategy:**
- Implement the Supabase middleware pattern from their official `@supabase/ssr` documentation — this runs `supabase.auth.getUser()` on every request and uses the `set-cookie` header to rotate tokens before they expire:
  ```ts
  // middleware.ts
  import { createServerClient } from '@supabase/ssr'
  import { NextResponse } from 'next/server'
  export async function middleware(request) {
    const response = NextResponse.next()
    const supabase = createServerClient(url, key, {
      cookies: { get, set, remove } // bound to request/response
    })
    await supabase.auth.getUser() // triggers token refresh
    return response
  }
  ```
- Apply this middleware to all routes, not just protected ones — the token refresh needs to happen on any page the user is on when their token expires

**Phase**: Auth scaffold.

---

### 14. Email Verification Not Enforced Before Allowing Forum Posts

Allowing unverified email accounts to post in the forum invites spam and throwaway accounts. Healthcare professional forums have an additional trust expectation — users expect other posters to be real people with real professional identities.

**Warning signs:**
- No check for `user.email_confirmed_at` before allowing thread creation or replies
- RLS policies on forum tables do not require email verification

**Prevention strategy:**
- Add `email_confirmed_at IS NOT NULL` to the RLS policy for thread and reply inserts:
  ```sql
  CREATE POLICY "verified users can post" ON threads
    FOR INSERT WITH CHECK (
      auth.uid() = user_id AND
      (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL
    );
  ```
- Show a "verify your email to post" banner for unverified users who try to participate
- Supabase's built-in email verification handles the verification flow — configure the confirmation email template in the Supabase dashboard before launch

**Phase**: Auth scaffold + forum post policy.

---

### 15. Password Reset Emails Using Supabase's Default Template

Supabase's default password reset email says "Supabase" — not "Clinical to Code." A healthcare professional receiving an email from "Supabase" will likely mark it as phishing or spam, especially given HIPAA-adjacent trust concerns in the clinical audience.

**Warning signs:**
- Password reset emails reference Supabase, not the product name
- Email links point to a `supabase.co` domain rather than `clinicaltocode.com`

**Prevention strategy:**
- Configure custom email templates in Supabase Auth > Email Templates before enabling signups
- Set up a custom SMTP provider (Resend, SendGrid) in Supabase Auth settings to send from a `@clinicaltocode.com` address — Supabase's built-in email sender has daily limits that will fail in production
- Configure the `Site URL` and `Redirect URLs` in Supabase Auth settings so confirmation and reset links point to `clinicaltocode.com`, not `supabase.co`

**Phase**: Auth scaffold (before opening any signup flow).

---

## CMS Integration Pitfalls

### 16. Fetching Sanity Content at Request Time Without Caching

Next.js 15 changed the fetch caching defaults: fetches inside Server Components are no longer cached by default (the `force-cache` default from Next.js 13/14 was removed). Every page load that calls the Sanity API will make a live network request to Sanity's CDN. For a content site where articles rarely change, this is unnecessary latency and Sanity API quota consumption.

**Warning signs:**
- Article pages feel slow even though the content hasn't changed
- Sanity API request counts in the dashboard climb with page views, not publish events
- Build logs show every page fetch going to `cdn.sanity.io` at runtime

**Prevention strategy:**
- Pass explicit caching options to every Sanity fetch:
  ```ts
  const data = await client.fetch(query, params, {
    next: { revalidate: 3600 } // revalidate hourly
  })
  ```
- For articles that should update immediately after publish, use Sanity webhooks + Next.js `revalidatePath` (on-demand ISR) instead of time-based revalidation
- Set `useCdn: true` in the Sanity client configuration for all read operations; `useCdn: false` is only needed during preview mode

**Phase**: CMS integration.

---

### 17. Sanity Preview Mode Exposing Draft Content Publicly

Sanity's preview mode lets editors see unpublished drafts. If the preview route (`/api/draft`) is implemented without authentication, anyone who discovers the URL can read all draft content — including article drafts, planned announcements, or sponsor content before it's ready.

**Warning signs:**
- The draft preview route has no auth check
- The Sanity preview secret is hardcoded in source code or a public environment variable
- Draft documents are returned by the production GROQ query

**Prevention strategy:**
- Use `NEXT_PUBLIC_` prefix only for variables that are intentionally public; the Sanity preview secret must be in a server-only env var (no `NEXT_PUBLIC_` prefix)
- Implement the `draftMode()` API from Next.js in the preview route handler and validate the incoming Sanity webhook secret before enabling draft mode
- Add `&& !(_id in path("drafts.**"))` to production GROQ queries to ensure drafts never appear in the public API response

**Phase**: CMS integration.

---

### 18. Sanity and Forum Content Treated as Separate Unconnected Systems

The highest-engagement pattern for a content + community platform is to connect articles to forum discussions. If the Sanity CMS and the Supabase forum operate in complete isolation, users have no path from reading an article to discussing it, and articles have no community signal attached.

**Warning signs:**
- No field on Sanity article schema references a forum thread ID
- Article pages have no "Discuss this" link
- Forum category taxonomy does not match article category taxonomy

**Prevention strategy:**
- Add a `discussionThreadId` field to the Sanity article schema (type: `string`, optional)
- When an article is published, manually (or via a Sanity webhook) create a corresponding thread in the forum category that matches the article's category, then store the resulting thread ID back in Sanity
- Article pages can then link directly to the forum thread with a reply count badge
- Align forum categories (`category_slug`) with Sanity article categories from day one; changing them later requires data migrations

**Phase**: CMS integration + forum scaffold.

---

## Monetization Pitfalls

### 19. Google AdSense Disapproval Due to Insufficient Content at Launch

Google AdSense requires sites to have "sufficient content" before approving an application. Applying too early — before there are 15–20 published articles with real content — results in rejection. A rejected application delays revenue and re-applications can take weeks.

**Warning signs:**
- AdSense applied for with fewer than 10 published articles
- Site has placeholder content or "coming soon" pages at the time of application

**Prevention strategy:**
- Publish a minimum of 15 substantial articles (800+ words each) before submitting the AdSense application
- Ensure all required pages exist: About, Contact, Privacy Policy (required by AdSense), Terms of Service
- The Privacy Policy must explicitly mention the use of cookies and third-party advertising — this is an AdSense requirement, not optional
- Do not add the AdSense script to the site until after approval; doing so before approval can complicate the review

**Phase**: Pre-monetization content milestone.

---

### 20. AdSense Script Blocking Core Web Vitals and Triggering Cumulative Layout Shift

Google AdSense's auto-ads script modifies the DOM after load to inject ad slots, causing Cumulative Layout Shift (CLS). CLS is a Core Web Vitals metric that Google uses in search ranking. A high CLS score will reduce organic search traffic — directly harming the primary growth channel for a content site.

**Warning signs:**
- PageSpeed Insights shows high CLS score
- Page elements visibly jump down when ads load
- Google Search Console reports "Poor" Core Web Vitals for article pages

**Prevention strategy:**
- Use fixed-height ad slot containers with placeholder backgrounds in CSS: `min-height: 250px` for banner slots, `min-height: 600px` for sidebar slots — this reserves space before the ad loads and prevents layout shift
- Load the AdSense script with `strategy="lazyOnload"` via Next.js `<Script>` component, not in `<head>` with no strategy
- Test CLS with PageSpeed Insights before and after enabling ads; target CLS < 0.1

**Phase**: Monetization implementation.

---

### 21. Paid Membership Tier Built on Top of Fragile Auth State

A paid membership tier (premium content or forum access) that relies solely on checking a `is_premium` boolean in a JWT claim or user metadata without server-side verification can be bypassed by manipulating the client-side token. Healthcare professionals are technical enough to notice and exploit this.

**Warning signs:**
- Premium content gating is done entirely in Client Components by reading auth state from localStorage
- The `is_premium` check happens only in the UI, not in the Supabase RLS policy or API route
- A user whose subscription lapsed still has access because the JWT has not refreshed

**Prevention strategy:**
- Store subscription status in a `subscriptions` table in Supabase, not only in user metadata or JWT claims
- Check subscription status in RLS policies for premium content:
  ```sql
  CREATE POLICY "premium content read" ON premium_content
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = auth.uid()
        AND status = 'active'
        AND current_period_end > now()
      )
    );
  ```
- When using Stripe, handle the `customer.subscription.updated` and `customer.subscription.deleted` webhooks to update the `subscriptions` table in real time — do not rely on the JWT refresh cycle to pick up subscription changes

**Phase**: Monetization (defer until content and forum are stable).

---

### 22. Newsletter Signup Without Double Opt-In Violates CAN-SPAM and GDPR

Collecting email addresses with a single-step form and adding them directly to a mailing list is a legal compliance issue. CAN-SPAM (US) and GDPR (EU) both require clear consent and, under GDPR, double opt-in is strongly recommended. A healthcare audience is likely to include EU-based readers. A healthcare professional audience is also more likely to be aware of and report privacy violations.

**Warning signs:**
- Newsletter form adds emails to the list without sending a confirmation email
- No privacy policy link near the newsletter form
- No clear statement of what subscribers will receive

**Prevention strategy:**
- Configure the email provider (Resend, ConvertKit, etc.) to require confirmation before adding to the active list (double opt-in)
- Add "By subscribing you agree to our Privacy Policy" with a link next to every newsletter signup form
- Include an unsubscribe link in every email — this is legally required by CAN-SPAM
- Store the signup source and timestamp in the email provider for audit purposes

**Phase**: Newsletter implementation.

---

*Last updated: 2026-03-15*
