---
phase: 04-forum
plan: "03"
subsystem: middleware
tags: [middleware, auth, forum, bookmarks]
dependency_graph:
  requires: [04-01]
  provides: [FORUM-06 auth gate]
  affects: [middleware.ts]
tech_stack:
  added: []
  patterns: [Next.js middleware route guard]
key_files:
  created: []
  modified:
    - middleware.ts
decisions:
  - "/forum/bookmarks added to unauthenticated redirect gate only — NOT the verified-user gate (bookmarks require auth but not email verification)"
metrics:
  duration: "4 minutes"
  completed: "2026-03-21"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 4 Plan 03: Middleware Bookmarks Auth Guard Summary

**One-liner:** Extended middleware.ts auth guard to redirect unauthenticated users from /forum/bookmarks to /auth/login without affecting the email-verification gate.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add /forum/bookmarks to middleware auth guard | 5bcb449 | middleware.ts |

## What Was Built

The unauthenticated user redirect block in middleware.ts was extended from guarding `/profile` and `/forum/new` to also guard `/forum/bookmarks`. The change adds `/forum/bookmarks` to the existing `!user` check only — the verified-user gate (which redirects unverified users to `/auth/verify-email`) was deliberately left unchanged because bookmarks require authentication but not email verification.

The session refresh block between `createServerClient` and `supabase.auth.getUser()` was not modified, preserving the AUTH-03 persistent session behavior.

## Key Decision

The distinction between the two middleware guards is intentional:
- **Auth gate** (`!user`): `/profile`, `/forum/new`, `/forum/bookmarks` — all require login
- **Verification gate** (`user && !email_confirmed_at`): `/profile`, `/forum/new` only — bookmarks do NOT require email verification

This prevents Pitfall 7: the bookmarks page rendering empty for logged-out users instead of redirecting.

## Deviations from Plan

None — plan executed exactly as written.

## Pre-existing Issues Noted (Out of Scope)

`tests/forum/forum.test.ts` imports `@/lib/forum/utils` which does not yet exist (belongs to a future plan). This failure pre-dated this plan and was not introduced by the middleware change. Logged for awareness.

## Self-Check: PASSED

- `grep "forum/bookmarks" middleware.ts` — match found on line 54
- `grep "forum/bookmarks" middleware.ts | grep -v "verify-email"` — match found (not in verified-user block)
- `grep -n "supabase.auth.getUser" middleware.ts` — 2 lines: 1 in comment (pre-existing), 1 actual call (no new calls added)
- `grep "forum/new" middleware.ts` — existing guard still present
- `npx tsc --noEmit | grep "middleware"` — empty (no TypeScript errors)
- Commit 5bcb449 — verified in git log
