---
phase: 07-monetization
plan: 01
subsystem: api
tags: [resend, newsletter, hmac, double-opt-in, email, route-handlers]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js app structure and environment variable patterns
provides:
  - HMAC-SHA256 token library for double opt-in confirmation links
  - POST /api/newsletter/subscribe — creates Resend contact + sends confirmation email
  - GET /api/newsletter/confirm — verifies HMAC token + marks contact as subscribed
  - /newsletter/confirmed success page
affects: [07-monetization]

# Tech tracking
tech-stack:
  added: [resend@6.9.4]
  patterns:
    - HMAC-SHA256 token with timingSafeEqual for timing-attack-safe verification
    - Double opt-in flow — contact created as unsubscribed: true, confirmed to unsubscribed: false
    - validation_error name check to handle duplicate Resend contacts idempotently
    - Fetch contact by email then update by ID to avoid Resend SDK v4 contacts.update ambiguity

key-files:
  created:
    - lib/newsletter/token.ts
    - app/api/newsletter/subscribe/route.ts
    - app/api/newsletter/confirm/route.ts
    - app/newsletter/confirmed/page.tsx
    - tests/monetization/newsletter.test.ts
  modified:
    - .env.example
    - package.json

key-decisions:
  - "HMAC token stored as 64-char hex string; timingSafeEqual used in verifyToken; try/catch returns false for invalid-length hex inputs rather than throwing"
  - "Resend contact created with unsubscribed: true on subscribe — only set to unsubscribed: false after HMAC confirmation to enforce double opt-in"
  - "validation_error from Resend contacts.create is treated as success (duplicate contact) so confirmation email is resent"
  - "Confirm route fetches contact list then finds by email to obtain ID before calling contacts.update — avoids SDK v4 ambiguity about email vs id param"

patterns-established:
  - "TDD: unit tests in tests/monetization/ mirror tests/forum/ pattern with vitest import + describe/it blocks"
  - "Route Handlers use Response.json() directly (not NextResponse) per Next.js App Router convention"

requirements-completed: [MONEY-01]

# Metrics
duration: 8min
completed: 2026-03-23
---

# Phase 7 Plan 01: Newsletter Double Opt-In Backend Summary

**HMAC-SHA256 double opt-in newsletter backend using Resend SDK — subscribe and confirm Route Handlers with token library, success page, and 5 passing unit tests**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-23T07:19:02Z
- **Completed:** 2026-03-23T07:20:45Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed resend SDK and documented all required env vars in .env.example (RESEND_API_KEY, RESEND_AUDIENCE_ID, NEWSLETTER_TOKEN_SECRET, NEXT_PUBLIC_ADSENSE_CLIENT_ID, NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE)
- Implemented generateToken/verifyToken HMAC library with timing-safe comparison; all 5 unit tests pass
- Created POST /api/newsletter/subscribe with idempotent duplicate-contact handling and HMAC-signed confirmation email
- Created GET /api/newsletter/confirm with token verification, contact subscription update, and redirect to confirmed page
- Created /newsletter/confirmed success page matching UI-SPEC copywriting contract

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 test stubs + resend install + HMAC token lib** - `c072692` (feat)
2. **Task 2: Newsletter Route Handlers + confirmed page** - `6f7f193` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `lib/newsletter/token.ts` — HMAC-SHA256 generateToken/verifyToken helpers using Node.js crypto
- `tests/monetization/newsletter.test.ts` — 5 unit tests covering token generation, correct/wrong/empty/odd-length inputs
- `app/api/newsletter/subscribe/route.ts` — POST handler: email validation, Resend contact create (unsubscribed: true), confirmation email send
- `app/api/newsletter/confirm/route.ts` — GET handler: HMAC verification, contact list fetch + ID lookup, contacts.update to unsubscribed: false, redirect
- `app/newsletter/confirmed/page.tsx` — Success page with "You're subscribed" heading and /articles CTA
- `.env.example` — Added Resend and AdSense env var stubs
- `package.json` / `package-lock.json` — resend SDK added

## Decisions Made
- HMAC token is a 64-character hex string using HMAC-SHA256; timingSafeEqual prevents timing attacks; try/catch in verifyToken returns false for invalid-length inputs without throwing
- Resend contact created as unsubscribed: true on initial subscribe — only set to false after HMAC confirmation to properly enforce double opt-in
- Duplicate contact (validation_error) treated as success so the confirmation email is resent to users who sign up again
- Confirm route fetches full contact list and finds by email to get the contact ID before calling contacts.update — safest pattern across Resend SDK versions

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**External services require manual configuration before the newsletter feature is functional:**
- Set `RESEND_API_KEY` — create API key at resend.com
- Set `RESEND_AUDIENCE_ID` — create an Audience in Resend dashboard, copy the ID
- Set `NEWSLETTER_TOKEN_SECRET` — generate a random 32+ char secret (e.g., `openssl rand -hex 32`)
- Verify the sending domain `clinicaltocode.com` is configured in Resend dashboard

## Next Phase Readiness
- Newsletter backend complete; Plan 07-02 can build the NewsletterSignup frontend component that calls POST /api/newsletter/subscribe
- All MONEY-01 backend requirements met; MONEY-02 (AdSense) env vars documented in .env.example

---
*Phase: 07-monetization*
*Completed: 2026-03-23*

## Self-Check: PASSED

All files verified present. All commits verified in git log.
