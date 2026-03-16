---
phase: 2
slug: auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (installed in Phase 1) |
| **Config file** | `vitest.config.ts` — exists |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|-------------|-----------|-------------------|--------|
| 2-02-01 | 0 | AUTH-01 | automated | `npx vitest run --reporter=verbose` | ⬜ pending |
| 2-02-02 | 1 | AUTH-01 | automated | `npx next build` exits 0 | ⬜ pending |
| 2-02-03 | 1 | AUTH-01 | automated | `npx tsc --noEmit` | ⬜ pending |
| 2-02-04 | 2 | AUTH-01/02 | automated | `npx next build` exits 0 | ⬜ pending |
| 2-02-05 | 2 | AUTH-03 | automated | `npx tsc --noEmit` | ⬜ pending |
| 2-02-06 | 3 | AUTH-02 | manual | Sign up → check email arrives | ⬜ pending |
| 2-02-07 | 3 | AUTH-02 | manual | Click verification link → confirm page | ⬜ pending |
| 2-02-08 | 3 | AUTH-03 | manual | Login → refresh → still authenticated | ⬜ pending |
| 2-02-09 | 3 | AUTH-02 | manual | Unverified user → /forum → blocked | ⬜ pending |
| 2-02-10 | 3 | AUTH-01 | manual | Sign out → protected route → redirect to login | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth/auth.test.ts` — stub tests for auth route existence and middleware config

*Wave 0 extends existing vitest infra from Phase 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Verification email arrives | AUTH-02 | Requires live Supabase email send | Sign up with real email, check inbox |
| Email link → confirmation page | AUTH-02 | Requires live email + browser | Click link in email, confirm redirect |
| Session persists on refresh | AUTH-03 | Requires browser state | Login, refresh, confirm still logged in |
| Unverified user blocked | AUTH-02 | Requires browser + auth state | Sign up (unverified), try /forum, confirm redirect |
| Sign out invalidates session | AUTH-01 | Requires browser session | Login, sign out, try protected route |
| Auth email shows correct sender | AUTH-02 | Requires inbox inspection | Check "From" name shows "Clinical to Code" |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or explicit manual instruction
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
