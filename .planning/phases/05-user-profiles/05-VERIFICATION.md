---
phase: 05-user-profiles
verified: 2026-03-21T12:02:00Z
status: human_needed
score: 18/18 must-haves verified
re_verification: false
human_verification:
  - test: "Navigate to /settings/profile as a signed-in user"
    expected: "Page loads with existing bio, credential badge, and avatar displayed. Selecting a credential and saving shows 'Profile updated.' Save button shows 'Saving...' during submission."
    why_human: "useActionState form submission flow and optimistic state require a live browser session"
  - test: "Upload a profile avatar image under 2MB on /settings/profile"
    expected: "Avatar updates immediately in the UI. Navigating to /profile/[username] shows the new avatar."
    why_human: "Supabase Storage upload requires an applied migration and live bucket — cannot verify statically"
  - test: "Try uploading a file over 2MB on /settings/profile"
    expected: "Inline error 'Photo must be under 2MB.' appears without a page reload"
    why_human: "Client-side file validation behavior requires browser interaction"
  - test: "Navigate to /profile/[username] for a signed-in user who has set a credential badge"
    expected: "Avatar (80px), username (28px semibold), join date ('Month YYYY'), credential badge (accent-bordered), bio, and post history Discussions section are all visible"
    why_human: "Visual layout and join date formatting require a real database row with created_at"
  - test: "Navigate to /profile/thisdoesnotexist12345"
    expected: "Next.js 404 page renders"
    why_human: "notFound() rendering requires the Next.js runtime"
  - test: "Post a forum reply while signed in as a user with the 'RN' credential badge set"
    expected: "'RN' badge appears next to the username on the post in the thread"
    why_human: "End-to-end credential propagation through ThreadCard/PostItem requires live data and browser rendering"
  - test: "Sign out and navigate to /settings/profile"
    expected: "Redirect to /auth/login"
    why_human: "Middleware redirect requires the Next.js request lifecycle"
  - test: "Sign in as a user with unverified email and navigate to /settings/profile"
    expected: "Redirect to /auth/verify-email"
    why_human: "Second middleware block behavior requires a live unverified user session"
  - test: "Apply migration 20260322000000_add_profile_storage.sql in Supabase SQL Editor"
    expected: "avatars bucket created with public=true; all RLS policies applied; existing NULL usernames backfilled; handle_new_user() trigger updated"
    why_human: "SQL migration must be manually applied to the live Supabase project — cannot be auto-verified"
---

# Phase 5: User Profiles Verification Report

**Phase Goal:** Give every user a public profile page showing their identity and post history, and allow users to configure their credential badge and avatar.
**Verified:** 2026-03-21T12:02:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Test stubs for PROF-01, PROF-02, PROF-03 exist and run | VERIFIED | `tests/profile/profile.test.ts` exists; 3 live tests pass, 10 todos; `npx vitest run tests/profile/` exits 0 |
| 2 | A Supabase Storage bucket migration exists with correct RLS policies | VERIFIED | `supabase/migrations/20260322000000_add_profile_storage.sql` contains `INSERT INTO storage.buckets`, 4 RLS policies using `storage.foldername(name)[1]` |
| 3 | Existing NULL usernames get backfilled via migration | VERIFIED | Migration contains `UPDATE public.user_profiles ... WHERE user_profiles.username IS NULL` |
| 4 | Signup trigger sets auto-generated username for new users | VERIFIED | Migration contains `CREATE OR REPLACE FUNCTION public.handle_new_user()` that inserts username on signup |
| 5 | /settings/profile redirects unauthenticated users to /auth/login | VERIFIED (needs human) | `middleware.ts` has `pathname.startsWith('/settings')` in unauthenticated block (grep -c returns 2) |
| 6 | /settings/profile redirects unverified users to /auth/verify-email | VERIFIED (needs human) | `middleware.ts` has `pathname.startsWith('/settings')` in email_confirmed_at block |
| 7 | UserProfile interface exported from lib/profile/types.ts | VERIFIED | `export const VALID_CREDENTIALS`, `export interface UserProfile`, `export type ProfileActivity` all present |
| 8 | getProfile returns null for missing user, UserProfile when matched | VERIFIED | `lib/profile/queries.ts`: `PGRST116` check returns null; `from('user_profiles').select()` wired |
| 9 | getProfilePostHistory returns paginated merged list, 20 per page | VERIFIED | `lib/profile/queries.ts`: Promise.all of two queries, sort + slice to PAGE_SIZE |
| 10 | updateProfile validates credential badge and slices bio | VERIFIED | `lib/profile/actions.ts`: VALID_CREDENTIALS check, `.trim().slice(0, 280)`, auth from `getUser()` never formData |
| 11 | CredentialBadge renders null when credential is null | VERIFIED | `components/profile/credential-badge.tsx` line 10: `if (!credential) return null` |
| 12 | CredentialBadge renders with border-primary text-primary | VERIFIED | `className={cn('border-primary text-primary text-xs font-semibold', className)}` |
| 13 | CredentialSelect renders all 10 credential options from VALID_CREDENTIALS | VERIFIED | Imports `VALID_CREDENTIALS` from `@/lib/profile/types`; maps over all 10 values |
| 14 | AvatarUpload rejects >2MB and non-image MIME types with inline errors | VERIFIED | Both error strings present in component; `role="alert"` on error `<p>`; `animate-spin` Loader2 present |
| 15 | /profile/[username] shows avatar, username, join date, badge, post history; 404 for missing | VERIFIED | `notFound()` called when `getProfile` returns null; CredentialBadge, ProfilePostHistory, `await params`, `format(new Date(...))` all wired |
| 16 | /settings/profile loads with user data; form saves with inline confirmation | VERIFIED | `settings-form.tsx`: `useActionState`, `AvatarUpload`, `CredentialSelect`, bio textarea, `{bioLength} / {MAX_BIO}`, "Saving..." / "Save Settings", "Profile updated." |
| 17 | ThreadCard and PostItem display author username + CredentialBadge | VERIFIED | Both components import `CredentialBadge` and `AuthorMeta`; PostItem replaces hardcoded "Anonymous" with `author?.username ?? 'Anonymous'` |
| 18 | Thread list and detail pages use single batch getProfilesByIds (no N+1) | VERIFIED | Both forum pages import and call `getProfilesByIds` once; pass `profilesById[...] ?? null` to each component |

**Score:** 18/18 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tests/profile/profile.test.ts` | Wave 0 test stubs covering PROF-01, PROF-02, PROF-03 | VERIFIED | 3 live tests pass, 10 todos; `describe('PROF-01'` present |
| `supabase/migrations/20260322000000_add_profile_storage.sql` | Storage bucket + RLS + username backfill + trigger update | VERIFIED | All 4 sections present and correct |
| `middleware.ts` | /settings guard in both auth blocks | VERIFIED | `pathname.startsWith('/settings')` in both blocks (grep -c = 2) |
| `lib/profile/types.ts` | UserProfile, ProfilePost, ProfileThread, ProfileActivity, VALID_CREDENTIALS | VERIFIED | All 5 exports present |
| `lib/profile/queries.ts` | getProfile, getProfilePostHistory, getProfilesByIds | VERIFIED | All 3 functions implemented; `from('user_profiles')` wired |
| `lib/profile/actions.ts` | updateProfile, updateAvatarUrl, removeAvatar as Server Actions | VERIFIED | `'use server'`; all 3 functions use `auth.getUser()` for identity; no `formData.get('user_id')` anti-pattern |
| `components/ui/avatar.tsx` | shadcn Avatar component | VERIFIED | File exists |
| `components/ui/select.tsx` | shadcn Select component | VERIFIED | File exists |
| `components/ui/input.tsx` | shadcn Input component | VERIFIED | File exists |
| `components/profile/credential-badge.tsx` | CredentialBadge display component | VERIFIED | null-safe, border-primary text-primary override, no 'use client' needed |
| `components/profile/credential-select.tsx` | CredentialSelect dropdown | VERIFIED | 'use client', imports VALID_CREDENTIALS, maps all 10 options |
| `components/profile/avatar-upload.tsx` | AvatarUpload with Storage upload | VERIFIED | 'use client', 2MB + MIME validation, fixed path upsert, Loader2 spinner, role="alert" errors, calls updateAvatarUrl |
| `components/profile/profile-post-history.tsx` | ProfilePostHistory display component | VERIFIED | isOwnProfile branching, thread + post item rendering, links to /forum/[categorySlug]/[slug] |
| `app/profile/[username]/page.tsx` | Public profile Server Component | VERIFIED | `notFound()`, `await params`, getProfile + getProfilePostHistory, CredentialBadge, isOwnProfile branching, "Add one in settings" link |
| `app/settings/profile/page.tsx` | Settings page Server Component | VERIFIED | No 'use client', fetches by user.id, passes to SettingsForm |
| `app/settings/profile/settings-form.tsx` | Settings form with useActionState | VERIFIED | 'use client', useActionState, AvatarUpload + CredentialSelect + bio textarea + char count + "Saving..." / "Save Settings" + "Profile updated." |
| `components/forum/thread-card.tsx` | ThreadCard with author + credential | VERIFIED | Imports CredentialBadge and AuthorMeta; optional author prop; renders username + badge |
| `components/forum/post-item.tsx` | PostItem with author + credential | VERIFIED | Replaces hardcoded "Anonymous"; `author?.username ?? 'Anonymous'`; CredentialBadge |
| `app/forum/[categorySlug]/page.tsx` | Thread list with batch profile fetch | VERIFIED | Imports and calls `getProfilesByIds` once; passes profilesById to ThreadCard |
| `app/forum/[categorySlug]/[threadSlug]/page.tsx` | Thread detail with batch profile fetch | VERIFIED | Imports and calls `getProfilesByIds` once; passes profilesById to PostItem and thread header |
| `lib/forum/types.ts` | AuthorMeta interface added | VERIFIED | `export interface AuthorMeta` at line 67 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `middleware.ts` | `/settings/profile` route | `pathname.startsWith('/settings')` in both auth blocks | VERIFIED | grep -c = 2 |
| `supabase/migrations/20260322000000_add_profile_storage.sql` | `storage.objects` RLS | `storage.foldername(name)[1] = auth.uid()::text` | VERIFIED | Pattern present in 3 RLS policies |
| `lib/profile/queries.ts` | `user_profiles` table | `supabase.from('user_profiles').select()` | VERIFIED | Lines 10, 84 |
| `lib/profile/actions.ts` | `auth.getUser()` | `supabase.auth.getUser()` in all 3 actions | VERIFIED | Lines 14, 43, 60 |
| `components/profile/avatar-upload.tsx` | `lib/profile/actions.ts updateAvatarUrl` | `import { updateAvatarUrl } from '@/lib/profile/actions'` | VERIFIED | Line 9; called at line 63 |
| `components/profile/avatar-upload.tsx` | `lib/supabase/client.ts` | `import { createClient } from '@/lib/supabase/client'` | VERIFIED | Browser client used for Storage upload |
| `components/profile/credential-select.tsx` | `lib/profile/types.ts VALID_CREDENTIALS` | `import { VALID_CREDENTIALS } from '@/lib/profile/types'` | VERIFIED | Line 10; used in map at line 29 |
| `app/profile/[username]/page.tsx` | `lib/profile/queries.ts getProfile` | `import { getProfile, getProfilePostHistory }` | VERIFIED | Lines 8, 24, 33 |
| `app/settings/profile/settings-form.tsx` | `lib/profile/actions.ts updateProfile` | `import { updateProfile } from '@/lib/profile/actions'` | VERIFIED | Called inside `updateProfileAction` wrapper |
| `app/forum/[categorySlug]/[threadSlug]/page.tsx` | `lib/profile/queries.ts getProfilesByIds` | `import { getProfilesByIds } from '@/lib/profile/queries'` | VERIFIED | Line 9; called at line 43 |
| `components/forum/post-item.tsx` | `components/profile/credential-badge.tsx` | `import { CredentialBadge } from '@/components/profile/credential-badge'` | VERIFIED | Line 7; used at line 26 |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PROF-01 | 05-01, 05-02, 05-03, 05-04 | User has a public profile page showing username, join date, credential badge, and post history | SATISFIED | `app/profile/[username]/page.tsx` renders all four elements; `getProfile` + `getProfilePostHistory` wired |
| PROF-02 | 05-01, 05-02, 05-03, 05-04, 05-05 | User can set a self-reported credential badge (RN, NP, MD, PharmD, CMIO, Health IT, etc.) | SATISFIED | `CredentialSelect` lists all 10 VALID_CREDENTIALS; `updateProfile` validates against allowlist; CredentialBadge propagated to ThreadCard and PostItem |
| PROF-03 | 05-01, 05-02, 05-03, 05-04 | User can upload a profile avatar and write a short bio | SATISFIED | `AvatarUpload` performs 2MB/MIME validation + Storage upload + `updateAvatarUrl` call; bio textarea with 280-char server-side slice in `updateProfile`; both visible on public profile page |

No orphaned requirements — all Phase 5 requirements (PROF-01, PROF-02, PROF-03) are claimed by plans and implemented.

---

### Anti-Patterns Found

No blockers or warnings found.

| File | Pattern | Severity | Notes |
|------|---------|----------|-------|
| `components/profile/credential-select.tsx` line 26 | `placeholder="Select your credential"` | Info | `<SelectValue placeholder>` attribute — not a code stub, expected UX copy |
| `lib/profile/queries.ts` line 15 | `return null` | Info | Intentional early return for `PGRST116` (no row found) — correct pattern |
| `components/profile/credential-badge.tsx` line 10 | `return null` | Info | Intentional null-safety guard — correct pattern |

---

### Human Verification Required

All automated checks passed. The following flows require a running dev server with the Supabase migration applied.

#### 1. Settings page — save flow

**Test:** Sign in, navigate to `/settings/profile`, select a credential badge (e.g. "RN"), write a bio, click "Save Settings".
**Expected:** Button shows "Saving..." during submit, then reverts to "Save Settings". Inline message "Profile updated." appears.
**Why human:** `useActionState` submission flow and optimistic state require a live browser session.

#### 2. Avatar upload — success path

**Test:** On `/settings/profile`, click "Upload new photo" and select a JPEG/PNG under 2MB.
**Expected:** Loader2 spinner shows during upload ("Uploading..."), then the new avatar appears in the UI. Navigating to `/profile/[username]` shows the new avatar.
**Why human:** Supabase Storage upload requires the migration to be applied and a live bucket.

#### 3. Avatar upload — 2MB rejection

**Test:** On `/settings/profile`, try uploading a file over 2MB.
**Expected:** Inline error "Photo must be under 2MB." appears without a page reload.
**Why human:** File size validation requires browser file input interaction.

#### 4. Public profile page — visual verification

**Test:** Navigate to `/profile/[username]` for a user who has set a credential badge and bio.
**Expected:** Avatar (80px), username (28px semibold), "Joined Month YYYY" label, credential badge with accent border, bio text, and "Discussions" section with post history.
**Why human:** Layout, typography sizes, and join date formatting require real database rows and browser rendering.

#### 5. Missing profile — 404

**Test:** Navigate to `/profile/thisdoesnotexist12345`.
**Expected:** Next.js 404 page renders.
**Why human:** `notFound()` rendering requires the Next.js server runtime.

#### 6. Credential badge on forum posts

**Test:** While signed in with "RN" badge set, post a forum reply. View the thread.
**Expected:** "RN" badge appears next to username on the post.
**Why human:** End-to-end credential propagation through the batch `getProfilesByIds` call requires live database data and browser rendering.

#### 7. Unauthenticated redirect to /settings/profile

**Test:** Sign out, then navigate to `http://localhost:3000/settings/profile`.
**Expected:** Redirect to `/auth/login`.
**Why human:** Middleware redirect requires the Next.js request lifecycle.

#### 8. Unverified user redirect

**Test:** Sign in as a user with unverified email, navigate to `/settings/profile`.
**Expected:** Redirect to `/auth/verify-email`.
**Why human:** Requires a live user session with `email_confirmed_at = null`.

#### 9. DB migration application

**Test:** Apply `supabase/migrations/20260322000000_add_profile_storage.sql` in the Supabase SQL Editor.
**Expected:** `avatars` bucket created (public), 4 RLS policies applied, NULL usernames backfilled for existing rows, `handle_new_user()` trigger updated.
**Why human:** Migration must be manually applied to the live Supabase project — `supabase db push` not yet configured for remote.

---

### Test Suite Summary

```
npx vitest run tests/profile/
  Test Files  1 passed (1)
       Tests  3 passed | 10 todo (13)
```

```
npx tsc --noEmit — 0 errors
```

---

### Note: Live Test Count Variance

The plan specified 4 live unit tests (2 credential allowlist + 2 bio truncation). The implemented file has 3 live tests: 2 credential allowlist tests and 1 bio truncation test. The second bio truncation case (`'bio truncated to 280 chars before save'`) is an `it.todo`. This is a minor gap in test coverage but does not affect goal achievement — the server-side slice behavior is implemented and correct in `lib/profile/actions.ts`.

---

_Verified: 2026-03-21T12:02:00Z_
_Verifier: Claude (gsd-verifier)_
