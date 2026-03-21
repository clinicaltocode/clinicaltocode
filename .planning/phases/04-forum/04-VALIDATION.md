---
phase: 4
slug: forum
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run tests/forum/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/forum/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|-------------|-----------|-------------------|--------|
| Wave 0 stub | 0 | FORUM-01–06 | unit | `npx vitest run tests/forum/` | ⬜ pending |
| Migration | 1 | FORUM-01,05 | integration | `npx vitest run tests/forum/schema.test.ts` | ⬜ pending |
| RLS policies | 1 | FORUM-02,03,04 | integration | `npx vitest run tests/forum/rls.test.ts` | ⬜ pending |
| toggle_vote RPC | 1 | FORUM-04 | integration | `npx vitest run tests/forum/votes.test.ts` | ⬜ pending |
| Category index | 2 | FORUM-01,05 | unit | `npx vitest run tests/forum/` | ⬜ pending |
| Thread list | 2 | FORUM-01 | unit | `npx vitest run tests/forum/` | ⬜ pending |
| Thread detail | 2 | FORUM-01,03 | unit | `npx vitest run tests/forum/` | ⬜ pending |
| Thread create | 3 | FORUM-02 | unit | `npx vitest run tests/forum/` | ⬜ pending |
| Reply create | 3 | FORUM-03 | unit | `npx vitest run tests/forum/` | ⬜ pending |
| Upvote action | 3 | FORUM-04 | unit | `npx vitest run tests/forum/votes.test.ts` | ⬜ pending |
| Bookmarks | 4 | FORUM-06 | unit | `npx vitest run tests/forum/` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/forum/forum.test.ts` — stubs for FORUM-01 through FORUM-06
- [ ] `tests/forum/votes.test.ts` — toggle_vote RPC idempotency and race-condition guard stubs
- [ ] `tests/forum/schema.test.ts` — schema structure assertions (tables, columns, constraints)

*Existing vitest infrastructure from Phase 3 covers setup — only new stub files needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visitor can browse forum without signing in | FORUM-01 | Requires browser, logged-out session | Open incognito → /forum → browse categories and threads |
| Thread visible immediately after creation | FORUM-02 | Requires two browser sessions | Create thread as user A → verify visible as user B (incognito) |
| 2-level reply nesting renders correctly | FORUM-03 | Visual rendering requires browser | Reply to a thread, reply to that reply → verify indentation |
| Upvote race condition | FORUM-04 | Concurrent clicks require browser | Rapid-click upvote button → verify count increments once per toggle |
| Bookmark page shows saved threads | FORUM-06 | Requires auth + browser | Bookmark thread → visit /forum/bookmarks → verify thread listed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
