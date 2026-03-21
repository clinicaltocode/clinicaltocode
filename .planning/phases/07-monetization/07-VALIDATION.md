---
phase: 7
slug: monetization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest / jest (Next.js project) |
| **Config file** | vitest.config.ts or jest.config.ts (Wave 0 installs if absent) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | MONEY-01 | unit | `npm test -- --run newsletter/token` | ❌ W0 | ⬜ pending |
| 7-01-02 | 01 | 1 | MONEY-01 | integration | `npm test -- --run newsletter/subscribe` | ❌ W0 | ⬜ pending |
| 7-01-03 | 01 | 1 | MONEY-01 | integration | `npm test -- --run newsletter/confirm` | ❌ W0 | ⬜ pending |
| 7-02-01 | 02 | 2 | MONEY-02 | unit | `npm test -- --run AdSlot` | ❌ W0 | ⬜ pending |
| 7-02-02 | 02 | 2 | MONEY-02 | e2e | Manual: Lighthouse CLS check | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/newsletter/token.test.ts` — HMAC token generation and verification stubs
- [ ] `__tests__/newsletter/subscribe.test.ts` — subscribe route handler stubs
- [ ] `__tests__/newsletter/confirm.test.ts` — confirm route handler stubs
- [ ] `__tests__/components/AdSlot.test.tsx` — AdSlot component render stubs
- [ ] Test framework config — if not already present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CLS score 0 in Lighthouse | MONEY-02 | Requires browser rendering + Lighthouse audit | Run Lighthouse on article/forum pages; CLS must be 0 |
| Email received in inbox | MONEY-01 | External email delivery | Submit form with real email; confirm delivery |
| Confirmation link subscribes user | MONEY-01 | Requires Resend dashboard check | Click confirm link; verify contact `unsubscribed: false` in Resend Audiences |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
