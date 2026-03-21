---
phase: 05-user-profiles
plan: "03"
subsystem: ui
tags: [shadcn, base-ui, supabase-storage, react, avatar, select, credential-badge]

# Dependency graph
requires:
  - phase: 05-02
    provides: lib/profile/types.ts VALID_CREDENTIALS, UserProfile, ProfileActivity types; lib/profile/actions.ts updateAvatarUrl, removeAvatar
provides:
  - CredentialBadge display component (components/profile/credential-badge.tsx)
  - CredentialSelect dropdown component (components/profile/credential-select.tsx)
  - AvatarUpload client component with Supabase Storage upload (components/profile/avatar-upload.tsx)
  - ProfilePostHistory server component with isOwnProfile empty state (components/profile/profile-post-history.tsx)
  - shadcn Avatar, Select, Input primitives installed at components/ui/
affects:
  - 05-04 (profile settings page consumes CredentialSelect, AvatarUpload)
  - 05-05 (public profile page consumes CredentialBadge, ProfilePostHistory)

# Tech tracking
tech-stack:
  added:
    - shadcn Avatar (Base UI avatar primitive wrapper)
    - shadcn Select (Base UI select primitive wrapper)
    - shadcn Input (Base UI input primitive wrapper)
  patterns:
    - buttonVariants on <label> element for file input trigger (Base UI Button has no asChild support)
    - Base UI SelectRoot onValueChange receives (value: string | null) — bridge to (value: string) consumer via null guard
    - Fixed Supabase Storage path {userId}/avatar with upsert:true for avatar overwrite
    - Cache-busting avatar URLs via ?t={Date.now()} appended after getPublicUrl

key-files:
  created:
    - components/ui/avatar.tsx
    - components/ui/select.tsx
    - components/ui/input.tsx
    - components/profile/credential-badge.tsx
    - components/profile/credential-select.tsx
    - components/profile/avatar-upload.tsx
    - components/profile/profile-post-history.tsx
  modified: []

key-decisions:
  - "Base UI Button has no asChild — use buttonVariants class on <label> element to create file input trigger styled as button (matches Phase 4 pattern)"
  - "Base UI SelectRoot onValueChange signature is (value: string | null, eventDetails) — bridge via null guard wrapper in CredentialSelect"
  - "CredentialBadge has no 'use client' directive — pure display component, no hooks needed, safe for server rendering"

patterns-established:
  - "Pattern 1: All profile components live at components/profile/ — no index barrel, import by full path"
  - "Pattern 2: File input triggers use buttonVariants on <label> not Button asChild"
  - "Pattern 3: AvatarUpload validates size and MIME client-side before Storage upload, shows inline role=alert errors"

requirements-completed: [PROF-01, PROF-02, PROF-03]

# Metrics
duration: 15min
completed: 2026-03-21
---

# Phase 5 Plan 03: Profile UI Components Summary

**shadcn Avatar/Select/Input installed; CredentialBadge, CredentialSelect, AvatarUpload, and ProfilePostHistory components built as the UI contract for plans 04 and 05**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-21T11:30:00Z
- **Completed:** 2026-03-21T11:45:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed shadcn Avatar, Select, Input via `npx shadcn add` — all three use Base UI primitives
- CredentialBadge: null-safe display badge with border-primary text-primary override on outline variant, no 'use client' needed
- CredentialSelect: lists all 10 VALID_CREDENTIALS options from types.ts, bridges Base UI's `(value: string | null)` signature
- AvatarUpload: 2MB + MIME validation, fixed Storage path with upsert, cache-busting URL, Loader2 spinner during upload, role="alert" inline errors, destructive Remove button
- ProfilePostHistory: empty state with isOwnProfile branching per UI-SPEC copy, threads link to /forum/[categorySlug]/[slug], posts show body excerpt

## Task Commits

Each task was committed atomically:

1. **Task 1: Install shadcn components and implement CredentialBadge + CredentialSelect** - `58ab99d` (feat)
2. **Task 2: Implement AvatarUpload and ProfilePostHistory components** - `841ff87` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `components/ui/avatar.tsx` - Base UI Avatar wrapper (Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup)
- `components/ui/select.tsx` - Base UI Select wrapper (Select, SelectTrigger, SelectContent, SelectItem, etc.)
- `components/ui/input.tsx` - Base UI Input wrapper
- `components/profile/credential-badge.tsx` - Null-safe credential badge, variant="outline" with border-primary text-primary override
- `components/profile/credential-select.tsx` - Credential dropdown with all 10 VALID_CREDENTIALS options
- `components/profile/avatar-upload.tsx` - Full upload flow: validation, Storage upsert, cache-busting, spinner, inline errors, remove
- `components/profile/profile-post-history.tsx` - Activity list with isOwnProfile branching and correct forum links

## Decisions Made
- Base UI Button has no `asChild` prop (same issue encountered in Phase 4-04). Used `buttonVariants` directly on `<label>` element for file input trigger.
- Base UI SelectRoot's `onValueChange` callback signature is `(value: string | null, eventDetails: SelectRootChangeEventDetails)`. Added a null-guard wrapper in CredentialSelect to bridge to the simpler `(value: string) => void` consumer interface.
- CredentialBadge stays as a server component (no 'use client') — it's purely display, no hooks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CredentialSelect onValueChange type mismatch**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** Plan specified `onValueChange?: (value: string) => void` but Base UI SelectRoot requires `(value: string | null, eventDetails: SelectRootChangeEventDetails) => void`
- **Fix:** Wrapped the consumer callback in a null-guard `(value) => { if (value) onValueChange(value) }` to bridge the type difference
- **Files modified:** components/profile/credential-select.tsx
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** 58ab99d (Task 1 commit)

**2. [Rule 1 - Bug] Fixed AvatarUpload Button asChild (not supported in Base UI)**
- **Found during:** Task 2 (TypeScript verification)
- **Issue:** Plan used `<Button asChild>` pattern but Base UI Button has no asChild prop (same as Phase 4-04 discovery)
- **Fix:** Applied `buttonVariants({ variant: 'default' })` directly on the `<label>` element; added `cursor-pointer` and conditional opacity for disabled state
- **Files modified:** components/profile/avatar-upload.tsx
- **Verification:** `npx tsc --noEmit` exits 0, `npx vitest run tests/profile/` passes
- **Committed in:** 841ff87 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — type bugs from Base UI API differences)
**Impact on plan:** Both fixes are required for correct TypeScript compilation. No scope creep. Identical Base UI constraint to Phase 4-04.

## Issues Encountered
None beyond the Base UI type deviations documented above.

## User Setup Required
None - no external service configuration required for this plan.

## Next Phase Readiness
- All 4 profile components have confirmed exports and TypeScript-clean interfaces
- Plans 04 and 05 can import from components/profile/ with the exact prop signatures defined here
- AvatarUpload requires the `avatars` Supabase Storage bucket (provisioned in Plan 01 migration)

---
*Phase: 05-user-profiles*
*Completed: 2026-03-21*
