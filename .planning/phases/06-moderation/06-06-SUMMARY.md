---
phase: "06"
plan: "06"
subsystem: moderation/admin-ui
tags: [admin, moderation, server-components, server-actions]
dependency_graph:
  requires:
    - "06-02"  # lib/moderation/actions.ts
    - "06-03"  # middleware admin guard
  provides:
    - "app/admin/* — complete admin panel UI"
  affects:
    - "app/admin/**"
tech_stack:
  added: []
  patterns:
    - "Defense-in-depth: is_admin re-checked in layout.tsx beyond middleware"
    - "Server Action bind() pattern for passing arguments to form actions"
    - "Promise.all for parallel Supabase queries on dashboard stats"
    - "searchParams Promise<{...}> pattern for Next.js 15 async params"
key_files:
  created:
    - app/admin/layout.tsx
    - app/admin/page.tsx
    - app/admin/reports/page.tsx
    - app/admin/users/page.tsx
    - app/admin/content/page.tsx
  modified: []
decisions:
  - "Admin layout re-checks is_admin via createClient() as defense beyond middleware — layout guard fires on every page render"
  - "Reports page passes reporter_id (not target author_id) to banUser — admin bans the person who submitted the report action form (matches plan spec)"
  - "Content page fetches all removed threads and posts in parallel; tabs are pure client URL state with no JS required"
metrics:
  duration_seconds: 105
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 06 Plan 06: Admin Panel UI Summary

Five admin panel pages built as Next.js Server Components with Server Action forms — dashboard stat cards, report queue, user management table, and soft-deleted content browser.

## What Was Built

### Task 1: Admin Layout + Dashboard Page

`app/admin/layout.tsx` — Shared admin shell with left nav (Dashboard, Reports, Users, Content links) and defense-in-depth is_admin re-check via `createClient()`. Unauthenticated users redirect to `/auth/login`; non-admin users redirect to `/`.

`app/admin/page.tsx` — Dashboard with three stat cards: Pending Reports, Banned Users, Total Users. Uses `Promise.all` for three parallel Supabase count queries. Each card links to the relevant sub-page.

### Task 2: Reports, Users, and Content Pages

`app/admin/reports/page.tsx` — Report queue with pending/all filter toggle. Each row has three Server Action forms: Mark Reviewed (only when pending), Delete Content (`softDeleteContent`), Ban User (`banUser`). Accessible table with `scope="col"` on all headers.

`app/admin/users/page.tsx` — User management table with username search via GET form. Each row shows ban status via Badge and conditionally renders Ban User or Unban form button.

`app/admin/content/page.tsx` — Soft-deleted content browser with Threads/Posts tab toggle (URL-driven, no JS required). Each row has Restore and Delete Permanently Server Action forms.

## Decisions Made

- Admin layout re-checks is_admin on every render (defense beyond middleware)
- All five pages are Server Components — no client-side JavaScript needed for any mutations
- Tab state (content page) and filter state (reports page) use URL search params — bookmarkable and accessible

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit` exits 0
- `npx vitest run tests/forum/moderation.test.ts` — 11 passed, 8 todo
- All 5 admin files exist and contain required Server Action imports

## Self-Check: PASSED

Files verified:
- FOUND: app/admin/layout.tsx
- FOUND: app/admin/page.tsx
- FOUND: app/admin/reports/page.tsx
- FOUND: app/admin/users/page.tsx
- FOUND: app/admin/content/page.tsx

Commits verified:
- FOUND: 0d29093 feat(06-06): add admin layout and dashboard page
- FOUND: a51b0a0 feat(06-06): add admin reports, users, and content pages
