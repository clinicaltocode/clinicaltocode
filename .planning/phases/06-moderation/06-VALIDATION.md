---
phase: 6
slug: moderation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + jsdom |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tests/forum/moderation.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/forum/moderation.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | MOD-01 | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | MOD-01 | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | MOD-02 | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 3 | MOD-03 | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 3 | MOD-03 | unit | `npx vitest run tests/forum/moderation.test.ts` | ❌ W0 | ⬜ pending |
| 06-04-01 | 04 | 4 | MOD-04 | manual | N/A — browser verification | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/forum/moderation.test.ts` — stubs for MOD-01 through MOD-03 (duplicate report rejection, reason allowlist, markReviewed transition, soft-delete placeholder, banUser/unbanUser toggle)

*Existing infrastructure covers framework setup — only new test file needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Community guidelines page renders all required sections | MOD-04 | Static page content, no logic to unit test | Navigate to /community-guidelines, verify sections: De-identification, Professional Conduct, Acceptable Content, Enforcement are present and linked from forum header banner |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
