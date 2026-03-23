---
phase: 07-monetization
plan: 02
subsystem: ui
tags: [adsense, ads, next-script, cls-prevention, react, testing-library]

# Dependency graph
requires:
  - phase: 07-monetization
    provides: UI-SPEC and RESEARCH defining ad placement contracts and CLS prevention approach
provides:
  - AdSlot client component with CSS-reserved 300x250px space and Advertisement label
  - AdSense Script tag in root layout with lazyOnload strategy, conditional on env var
  - Ad placements on article detail, forum thread, and homepage pages
affects: [article-detail, forum-thread, homepage, monetization-activation]

# Tech tracking
tech-stack:
  added: ["@testing-library/react", "@testing-library/jest-dom"]
  patterns:
    - "Inline style for CLS-safe ad dimensions (not Tailwind) per Google's official technique"
    - "Conditional Script tag pattern: guard on NEXT_PUBLIC_ADSENSE_CLIENT_ID prevents dev console errors"
    - "Env var fallback: NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE ?? 'placeholder' for pre-activation safety"

key-files:
  created:
    - components/ads/ad-slot.tsx
    - tests/monetization/ad-slot.test.tsx
  modified:
    - app/layout.tsx
    - app/articles/[slug]/page.tsx
    - app/forum/[categorySlug]/[threadSlug]/page.tsx
    - app/page.tsx

key-decisions:
  - "Inline style for minWidth/minHeight on the wrapper div, not Tailwind arbitrary values — Google-official CLS prevention technique"
  - "Script tag is conditional on NEXT_PUBLIC_ADSENSE_CLIENT_ID env var to prevent console errors before AdSense publisher account is activated"
  - "adsbygoogle push() inside useEffect with try/catch — safe no-op when script not yet loaded"
  - "Advertisement <p> label sits above the ins wrapper, aria-hidden=true so screen readers skip the ad label"

patterns-established:
  - "AdSlot: outer className prop for page-level layout, inner inline styles for CLS guarantee"
  - "Ad env var fallback pattern: env ?? 'placeholder' enables page rendering before AdSense activation"

requirements-completed: [MONEY-02]

# Metrics
duration: 3min
completed: 2026-03-23
---

# Phase 7 Plan 02: Ad Slot Infrastructure Summary

**AdSense-ready AdSlot component with 300x250px CLS-safe reserved space, conditional Script tag in root layout, and placements on article, forum thread, and homepage pages**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-23T13:19:06Z
- **Completed:** 2026-03-23T13:22:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- AdSlot client component with inline-style CLS prevention (minHeight: 250px, minWidth: 300px), adsbygoogle class on `<ins>`, Advertisement label, and useEffect push
- Root layout conditionally loads AdSense Script with `strategy="lazyOnload"` only when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set — zero console errors in development
- Ad slot placements on article detail (after body, before Forum CTA), forum thread (between posts and reply form), and homepage aside (300px grid column)

## Task Commits

Each task was committed atomically:

1. **Task 1: AdSlot component + Wave 0 test stubs** - `50fadf4` (feat + test, TDD)
2. **Task 2: Wire AdSense Script in layout + ad slot placements on 3 pages** - `6f7f193` (feat)

**Plan metadata:** (docs commit follows)

_Note: Task 1 used TDD — tests written first (RED), component written to pass (GREEN), all 5 tests passing_

## Files Created/Modified

- `components/ads/ad-slot.tsx` - Client component with CLS-safe reserved space, adsbygoogle `<ins>`, Advertisement label, useEffect push
- `tests/monetization/ad-slot.test.tsx` - 5 unit tests covering ins rendering, data-ad-slot, minHeight, minWidth, Advertisement label
- `app/layout.tsx` - Added conditional AdSense Script tag with lazyOnload strategy
- `app/articles/[slug]/page.tsx` - AdSlot placed after ArticleBody, before Forum CTA, in max-w-[720px] container
- `app/forum/[categorySlug]/[threadSlug]/page.tsx` - AdSlot placed between posts section and reply form
- `app/page.tsx` - AdSlot placed in homepage aside (300px grid column)

## Decisions Made

- Inline style for `minWidth`/`minHeight` on wrapper div (not Tailwind arbitrary values) — this is the Google-official CLS prevention technique; CSS applied at render time guarantees the space is reserved before AdSense script loads
- Script tag guarded by `process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID` — prevents `adsbygoogle.js` 400 errors in development before publisher account is configured
- `adsbygoogle.push({})` wrapped in try/catch inside `useEffect` — safe no-op when AdSense script hasn't loaded yet
- `Advertisement` `<p>` label uses `aria-hidden="true"` — screen readers skip the ad label since ads provide no semantic value to assistive tech users

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @testing-library/react dependency**
- **Found during:** Task 1 (AdSlot component tests — GREEN phase)
- **Issue:** `@testing-library/react` not installed; test file import failed with "Failed to resolve import"
- **Fix:** Ran `npm install --save-dev @testing-library/react @testing-library/jest-dom`
- **Files modified:** package.json, package-lock.json
- **Verification:** All 5 tests pass after installation
- **Committed in:** 50fadf4 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing dependency)
**Impact on plan:** Required for component test execution. No scope creep.

## Issues Encountered

None beyond the missing testing-library dependency resolved via Rule 3.

## User Setup Required

None — no external service configuration required at this stage. AdSense activation requires setting `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE` in `.env.local` when the publisher account is approved. Pages render correctly without these variables (Script tag is omitted, slot IDs fall back to 'placeholder').

## Next Phase Readiness

- AdSense infrastructure ready to activate: set env vars and AdSense begins loading on all three pages
- All placements match UI-SPEC.md layout contracts (article max-w-[720px], homepage 300px aside, forum thread before reply form)
- TypeScript clean (`npx tsc --noEmit` exits 0)
- 5 unit tests provide regression coverage for AdSlot component rendering

---
*Phase: 07-monetization*
*Completed: 2026-03-23*
