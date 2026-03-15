---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — Wave 0 installs vitest |
| **Config file** | `vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | INFRA-01 | manual | `npx next build` exits 0 | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | INFRA-01 | manual | Supabase health route returns 200 | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | INFRA-01 | manual | `npx sanity check` exits 0 | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 2 | INFRA-01 | manual | Vercel preview URL loads without errors | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 2 | INFRA-01 | manual | `supabase db push` exits 0 | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — test runner config
- [ ] `tests/setup.ts` — shared setup
- [ ] `tests/infra/env.test.ts` — env var presence checks
- [ ] `tests/infra/db.test.ts` — Supabase connection stub
- [ ] `app/api/health/route.ts` — health check endpoint for DB verification

*Wave 0 installs test infrastructure and creates stub tests before feature code is written.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel preview URL loads | INFRA-01 | Requires live Vercel deployment | Open preview URL, confirm 200, no console errors |
| Sanity Studio loads at /studio | INFRA-01 | Requires browser and local dev server | Run `npm run dev`, open localhost:3000/studio |
| PgBouncer query succeeds | INFRA-01 | Requires live Supabase project + Docker | Hit /api/health, confirm `{"status":"ok"}` |
| supabase db push succeeds | INFRA-01 | Requires Supabase CLI + project linked | Run `supabase db push`, confirm exit 0 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
