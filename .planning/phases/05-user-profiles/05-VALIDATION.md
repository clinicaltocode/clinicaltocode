---
phase: 05
slug: user-profiles
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1 + jsdom |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tests/profile/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/profile/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PROF-01, PROF-02, PROF-03 | unit | `npx vitest run tests/profile/` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | PROF-01 | unit | `npx vitest run tests/profile/` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | PROF-01, PROF-02, PROF-03 | unit | `npx vitest run tests/profile/` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | PROF-02 | unit | `npx vitest run tests/profile/` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 3 | PROF-01 | unit | `npx vitest run tests/profile/` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 3 | PROF-02, PROF-03 | unit + manual | `npx vitest run tests/profile/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/profile/profile.test.ts` — stubs for PROF-01, PROF-02, PROF-03

*Existing Vitest + jsdom infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Avatar renders on profile page | PROF-03 | Requires Supabase Storage bucket + browser rendering | Upload avatar in settings, visit `/profile/[username]`, confirm image visible |
| Credential badge appears next to forum posts | PROF-02 | Requires live DB join across user_profiles + forum_posts | Set badge in settings, post a forum reply, verify badge shows next to post |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
