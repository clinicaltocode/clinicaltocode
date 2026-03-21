---
phase: "06"
plan: "02"
subsystem: moderation
tags: [data-layer, server-actions, types, admin-guard]
dependency_graph:
  requires:
    - "06-01: content_reports table, admin update policies, middleware guard"
    - "05-01: user_profiles table with is_admin, is_banned columns"
    - "04-01: forum_posts and forum_threads tables with is_removed column"
  provides:
    - "lib/moderation/types.ts: ContentReport, ReportStatus, ReportReason, VALID_REPORT_REASONS"
    - "lib/moderation/actions.ts: submitReport, markReviewed, softDeleteContent, banUser, unbanUser, restoreContent, permanentDeleteContent"
  affects:
    - "future app/admin/* pages: import Server Actions from lib/moderation/actions.ts"
    - "future ReportButton component: import submitReport and VALID_REPORT_REASONS"
tech_stack:
  added: []
  patterns:
    - "requireAdmin() internal guard — defense-in-depth beyond middleware, throws Unauthorized"
    - "23505 unique constraint treated as success (no-op) in submitReport"
    - "reporter_id always from auth.getUser(), never from formData"
key_files:
  created:
    - lib/moderation/types.ts
    - lib/moderation/actions.ts
  modified: []
decisions:
  - "requireAdmin() throws new Error('Unauthorized') — not redirect() — so admin actions fail loudly if called without proper context"
  - "restoreContent and permanentDeleteContent included per plan spec (MOD-03d/e) — seven actions total, not five"
metrics:
  duration_seconds: 72
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 6 Plan 02: Moderation Data Layer — Types and Server Actions Summary

TypeScript types and seven Server Actions for the moderation system, with requireAdmin() defense-in-depth guard on all admin mutations and 23505 duplicate suppression on submitReport.

## What Was Built

### Task 1: `lib/moderation/types.ts`

Created the moderation type contracts:

- **VALID_REPORT_REASONS**: `as const` tuple with 5 values — `'Patient data / PHI risk'`, `'Misinformation'`, `'Harassment'`, `'Spam'`, `'Off-topic for platform'`
- **ReportReason**: derived union type from the tuple (single source of truth)
- **ReportStatus**: `'pending' | 'reviewed'` union
- **ContentReport**: interface matching all `content_reports` table columns plus optional joined fields (`reporter_username`, `target_title`) for the admin reports page

TypeScript: 0 errors.

### Task 2: `lib/moderation/actions.ts`

Created all Server Actions with `'use server'` directive:

**Internal guard:**
- `requireAdmin()` — fetches user via `auth.getUser()`, queries `user_profiles.is_admin`, throws `new Error('Unauthorized')` if false. All admin mutations call this first (defense-in-depth beyond middleware).

**User-facing:**
- `submitReport(formData)` — validates reason against VALID_REPORT_REASONS allowlist, inserts row with `reporter_id: user.id` (never from formData), treats error code `23505` as success (duplicate = already reported = no-op)

**Admin-only (all call requireAdmin() first):**
- `markReviewed(reportId)` — updates `status = 'reviewed'` and `reviewed_at = now()`
- `softDeleteContent(targetType, targetId)` — sets `is_removed = true` on `forum_threads` or `forum_posts`
- `banUser(userId)` — sets `is_banned = true` on `user_profiles`
- `unbanUser(userId)` — sets `is_banned = false` on `user_profiles`
- `restoreContent(targetType, targetId)` — sets `is_removed = false` on thread/post
- `permanentDeleteContent(targetType, targetId)` — hard-deletes from DB

TypeScript: 0 errors. Tests: 11 passed, 8 todo.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `npx tsc --noEmit`: 0 errors
- `npx vitest run tests/forum/moderation.test.ts`: 11 passed, 8 todo
- `lib/moderation/types.ts` exports: VALID_REPORT_REASONS, ReportReason, ReportStatus, ContentReport
- `lib/moderation/actions.ts` exports: submitReport, markReviewed, softDeleteContent, banUser, unbanUser, restoreContent, permanentDeleteContent
- `grep "'use server'"`: 1 match (top of actions.ts)
- `grep "requireAdmin"`: 7 matches (1 definition + 6 admin action calls)
- `grep "error.code !== '23505'"`: 1 match
- `grep "reporter_id: user.id"`: 1 match

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 2b26fbe | feat(06-02): create lib/moderation/types.ts with ContentReport, ReportStatus, ReportReason |
| 2 | 0031de3 | feat(06-02): create lib/moderation/actions.ts with all seven Server Actions |

## Self-Check: PASSED

- FOUND: lib/moderation/types.ts
- FOUND: lib/moderation/actions.ts
- FOUND: commit 2b26fbe
- FOUND: commit 0031de3
