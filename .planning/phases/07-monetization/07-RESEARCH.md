# Phase 7: Monetization - Research

**Researched:** 2026-03-21
**Domain:** Newsletter double opt-in (Resend), AdSense ad slot containers (Next.js Script, CLS prevention)
**Confidence:** HIGH

---

## Summary

Phase 7 has two independent deliverables. The first is a newsletter signup with Resend double opt-in: a form POSTs an email to a Route Handler, which creates an unsubscribed contact in a Resend Audience and sends a confirmation email. A second Route Handler handles the confirmation link, verifies an HMAC token, and flips the contact to `unsubscribed: false`. The second deliverable is purely structural: add `<div>` ad slot containers with CSS-reserved dimensions (no JavaScript) to article detail pages, the homepage, and forum thread pages, plus wire the AdSense `<Script>` tag with `strategy="lazyOnload"` in the root layout.

No new database migrations are required. The newsletter subscriber list lives entirely in Resend Audiences. The ad slot containers are static HTML with Tailwind-compatible inline `min-height` CSS. The AdSense publisher ID and audience ID are not yet known (pending AdSense account activation), so the planner must stub those as environment variables.

**Primary recommendation:** Use Resend SDK `contacts.create` with `audienceId` + `unsubscribed: true`, HMAC-SHA256 confirmation token via Node.js `crypto` (built-in, no new package needed), and raw `<ins>` ad slot divs wrapped in a fixed-height container div — do NOT use `@ctrl/react-adsense` or any ad wrapper library.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MONEY-01 | Visitor can subscribe to the newsletter with double opt-in confirmation email (via Resend) | Resend SDK `contacts.create`/`contacts.update` + `emails.send`, HMAC token generation via Node.js `crypto`, two Route Handlers (POST subscribe, GET confirm) |
| MONEY-02 | Article and forum pages include reserved AdSense-ready ad slot containers (sized, no CLS) ready to activate | Next.js `Script` `strategy="lazyOnload"` in root layout, CSS `min-height`/`min-width` container divs, client-side `AdSlot` component with `useEffect` push, `AdSense*` env vars |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `resend` | ^4.x (already in ecosystem, install needed) | Send transactional email + manage Audience contacts | Official Resend SDK; `contacts.create` supports `audienceId` + `unsubscribed` |
| `next/script` | built-in Next.js 15 | Load AdSense script non-blocking | `strategy="lazyOnload"` defers execution until after page is idle |
| Node.js `crypto` | built-in | Generate + verify HMAC-SHA256 confirmation token | No extra package; `createHmac` + `timingSafeEqual` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-email` | optional | Styled confirmation email template | Use if you want HTML email; plain-text `html` string also acceptable for v1 |

### Not Needed
- `@ctrl/react-adsense` — unnecessary wrapper library; raw `<ins>` + `useEffect` push is the standard AdSense pattern
- `nodemailer` — Resend SDK handles delivery
- `crypto-js` — Node.js built-in `crypto` is sufficient and preferred in Edge/Node runtimes

**Installation:**
```bash
npm install resend
```

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── newsletter/
│       ├── subscribe/route.ts      # POST — create contact, send confirmation email
│       └── confirm/route.ts        # GET  — verify HMAC token, update contact to subscribed
├── newsletter/
│   └── confirmed/page.tsx          # Success landing page after confirmation click
components/
├── newsletter/
│   └── newsletter-signup.tsx       # 'use client' form component
├── ads/
│   └── ad-slot.tsx                 # 'use client' AdSense slot component
lib/
└── newsletter/
    └── token.ts                    # generateToken / verifyToken helpers (HMAC)
```

### Pattern 1: Double Opt-In Flow
**What:** Two Route Handlers implement the full subscribe + confirm lifecycle.
**When to use:** Always — required for MONEY-01 and GDPR-friendly list hygiene.

**Step 1 — Subscribe Route Handler:**
```typescript
// app/api/newsletter/subscribe/route.ts
// Source: https://resend.com/docs/send-with-nextjs + official SDK example
import { Resend } from 'resend'
import { generateToken } from '@/lib/newsletter/token'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email } = await request.json()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  // 1. Add as unsubscribed contact in Resend Audience
  const { error: contactError } = await resend.contacts.create({
    audienceId: process.env.RESEND_AUDIENCE_ID!,
    email,
    unsubscribed: true,  // starts unconfirmed
  })
  // Ignore duplicate error (contact already exists) — idempotent
  if (contactError && contactError.name !== 'validation_error') {
    return Response.json({ error: 'Failed to add contact' }, { status: 500 })
  }

  // 2. Generate HMAC token and send confirmation email
  const token = generateToken(email)
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?email=${encodeURIComponent(email)}&token=${token}`

  const { error: emailError } = await resend.emails.send({
    from: 'Clinical to Code <hello@clinicaltocode.com>',
    to: [email],
    subject: 'Confirm your subscription to Clinical to Code',
    html: `<p>Click to confirm: <a href="${confirmUrl}">${confirmUrl}</a></p>`,
  })

  if (emailError) {
    return Response.json({ error: 'Failed to send confirmation email' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
```

**Step 2 — Confirm Route Handler:**
```typescript
// app/api/newsletter/confirm/route.ts
// Source: Node.js crypto docs + Resend SDK contacts.update
import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/newsletter/token'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  if (!verifyToken(email, token)) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  // Update contact to subscribed
  await resend.contacts.update({
    audienceId: process.env.RESEND_AUDIENCE_ID!,
    email,
    unsubscribed: false,
  })

  redirect('/newsletter/confirmed')
}
```

**Step 3 — HMAC Token Helpers:**
```typescript
// lib/newsletter/token.ts
// Source: Node.js crypto built-in
import { createHmac, timingSafeEqual, BinaryLike } from 'crypto'

export function generateToken(email: string): string {
  return createHmac('sha256', process.env.NEWSLETTER_TOKEN_SECRET!)
    .update(email)
    .digest('hex')
}

export function verifyToken(email: string, token: string): boolean {
  const expected = generateToken(email)
  try {
    return timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false
  }
}
```

### Pattern 2: AdSense Script + Ad Slot Components
**What:** Script loaded once in root layout; individual `<AdSlot>` client components placed on target pages.
**When to use:** MONEY-02 — article detail pages, homepage, forum thread pages.

**Root layout script injection:**
```typescript
// app/layout.tsx — add inside <body>, after children
// Source: Next.js Script docs + Spaghetti Code Jungle / devwhirl research
import Script from 'next/script'

// Inside RootLayout return:
<Script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
  strategy="lazyOnload"
  crossOrigin="anonymous"
/>
```

**Ad slot component (client component):**
```typescript
// components/ads/ad-slot.tsx
'use client'
import { useEffect } from 'react'

interface AdSlotProps {
  slotId: string
  className?: string
}

export function AdSlot({ slotId, className }: AdSlotProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by the Google script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not yet active — safe to swallow during development
    }
  }, [])

  return (
    // CSS min-height reserves space BEFORE script loads — prevents CLS
    // Source: https://developers.google.com/publisher-tag/guides/minimize-layout-shift
    <div style={{ minWidth: '300px', minHeight: '250px' }} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
```

**Placement on article detail page:**
```typescript
// Add after article body and before Forum CTA in app/articles/[slug]/page.tsx
// (must be async Server Component — AdSlot is imported as a client component)
import { AdSlot } from '@/components/ads/ad-slot'

// After ArticleBody and before Forum CTA:
<div className="max-w-[720px] mx-auto my-8">
  <AdSlot
    slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE ?? 'placeholder'}
  />
</div>
```

### Anti-Patterns to Avoid
- **JavaScript-reserved space for ads:** Never use `useEffect` to set ad container height — this causes CLS at script execution time. Use CSS `min-height` on the wrapper `<div>`.
- **`strategy="beforeInteractive"` for AdSense:** Blocks hydration; always use `lazyOnload`.
- **Storing subscribers in Supabase instead of Resend Audiences:** Adds a custom DB table with no benefit — Resend Audiences is the subscriber list; Supabase is for user accounts.
- **Calling Resend from a Client Component:** API key would be exposed. Route Handlers only.
- **Skipping `timingSafeEqual` in token verification:** Timing attack vector for HMAC comparison.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery | Custom SMTP integration | `resend` SDK | Handles deliverability, SPF/DKIM, bounces |
| Subscriber list storage | Supabase `newsletter_subscribers` table | Resend Audiences (`contacts.create`) | Built-in list management, unsubscribe tracking, GDPR tools |
| Confirmation token crypto | Custom base64 UUID scheme | Node.js `crypto.createHmac` + `timingSafeEqual` | Timing-safe, no extra package, cryptographically strong |
| Ad script lazy loading | Custom `IntersectionObserver` ad loader | `next/script strategy="lazyOnload"` | Framework-native, works with SSR hydration |
| CLS-free ad space reservation | JavaScript-based layout reservation | CSS `min-height`/`min-width` on wrapper `<div>` | JS-based reservation itself causes a layout shift |

**Key insight:** Both newsletter and ad slot implementations are ~50 lines of code each when you use the right tools. Custom solutions in this domain inevitably reimplement logic that Resend and Next.js already provide.

---

## Common Pitfalls

### Pitfall 1: `contacts.create` duplicates on re-subscribe
**What goes wrong:** A second signup attempt for an existing email returns a validation error, leaving the user confused.
**Why it happens:** Resend Audiences enforces unique contacts per audience.
**How to avoid:** Treat duplicate errors as a success path — resend the confirmation email silently. Check `error.name === 'validation_error'` and proceed to re-send the email rather than returning 500.
**Warning signs:** Users reporting "I didn't get a confirmation email after trying again."

### Pitfall 2: `contacts.update` requires `email` OR `id` (not both required)
**What goes wrong:** Calling `contacts.update` with only `email` (no `id`) fails on some SDK versions.
**Why it happens:** The TypeScript types may suggest `id` is required.
**How to avoid:** Fetch the contact by email first if needed, or use `contacts.update({ audienceId, email, unsubscribed: false })` — the Resend SDK v4 supports email-based updates per changelog.
**Warning signs:** `TypeError` or 400 from Resend on the confirm handler.

### Pitfall 3: AdSense `<ins>` inside a Server Component
**What goes wrong:** `adsbygoogle.push({})` called on the server causes a ReferenceError.
**Why it happens:** `window` does not exist in Node.js rendering context.
**How to avoid:** The `AdSlot` component MUST have `'use client'` at the top. The `useEffect` ensures the push only runs in the browser.
**Warning signs:** Build error "window is not defined."

### Pitfall 4: CLS from fluid/responsive ad format with no reserved space
**What goes wrong:** Google serves a 728x90 leaderboard into a 300x250 slot, or the ad loads after content, pushing page content down.
**Why it happens:** `data-ad-format="auto"` lets AdSense pick dimensions; without a CSS-reserved container, height is 0 before the ad loads.
**How to avoid:** Wrapper `<div>` must have `style={{ minHeight: '250px' }}` (or the size matching the largest ad unit configured for that slot). Do NOT rely on `height` — use `min-height` so oversized creatives are not clipped.
**Warning signs:** Lighthouse CLS > 0 on article pages.

### Pitfall 5: AdSense script not loading because `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is undefined
**What goes wrong:** In development the `ca-pub-...` ID is not set, so the script URL becomes malformed and the browser blocks it.
**Why it happens:** `NEXT_PUBLIC_*` env vars are embedded at build time.
**How to avoid:** Guard the `<Script>` tag: `{process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && <Script ... />}`. This skips loading in development and before the AdSense account is activated.
**Warning signs:** Console errors "invalid src" or blank network request to pagead.

### Pitfall 6: `NEWSLETTER_TOKEN_SECRET` missing from Vercel env
**What goes wrong:** HMAC tokens are generated with `undefined` as the secret, making all tokens trivially equivalent.
**Why it happens:** New env var not added to Vercel dashboard.
**How to avoid:** Plan must include Wave 0 task to document all three new env vars (`RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `NEWSLETTER_TOKEN_SECRET`) and add them to Vercel.
**Warning signs:** All confirmation tokens are identical; any email + any token confirms any address.

---

## Code Examples

Verified patterns from official/authoritative sources:

### Resend `contacts.create` with `audienceId`
```typescript
// Source: https://github.com/resend/resend-examples/blob/main/express-resend-examples/typescript/examples/audiences.ts
const { data: contact, error } = await resend.contacts.create({
  audienceId: process.env.RESEND_AUDIENCE_ID!,
  email: 'user@example.com',
  unsubscribed: true,  // add as unconfirmed first
})
```

### Resend `contacts.update` to confirm subscription
```typescript
// Source: resend-examples audiences.ts
await resend.contacts.update({
  audienceId: process.env.RESEND_AUDIENCE_ID!,
  id: contact!.id,           // or email: '...' on SDK v4+
  unsubscribed: false,        // now subscribed
})
```

### HMAC token using Node.js built-in crypto
```typescript
// Source: Node.js crypto docs + HMAC-SHA256 best practices
import { createHmac, timingSafeEqual } from 'crypto'

function generateToken(email: string): string {
  return createHmac('sha256', process.env.NEWSLETTER_TOKEN_SECRET!)
    .update(email)
    .digest('hex')
}

function verifyToken(email: string, token: string): boolean {
  const expected = generateToken(email)
  try {
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch { return false }
}
```

### CLS-safe ad slot wrapper
```html
<!-- Source: https://developers.google.com/publisher-tag/guides/minimize-layout-shift -->
<!-- Reserve space with CSS before ad loads — NOT with JavaScript -->
<div style="min-width: 300px; min-height: 250px;">
  <ins class="adsbygoogle"
    style="display: block"
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="XXXXXXXXXX"
    data-ad-format="auto"
    data-full-width-responsive="true">
  </ins>
</div>
```

### AdSense script in Next.js layout
```typescript
// Source: Next.js Script docs + devwhirl/spaghetti-code-jungle research
import Script from 'next/script'

// strategy="lazyOnload" = loads after page is idle, non-blocking
{process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
  <Script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
    strategy="lazyOnload"
    crossOrigin="anonymous"
  />
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mailchimp API for newsletter list | Resend Audiences (same SDK as email) | 2023 | One SDK, one API key, contacts + sending unified |
| `strategy="beforeInteractive"` for analytics/ads | `strategy="lazyOnload"` | Next.js 11+ | No blocking of hydration |
| Setting ad container height with JS | CSS `min-height` on wrapper div | Always best practice, now Google-official | Eliminates CLS contribution from ad slots |
| Separate ad wrapper libraries (`@ctrl/react-adsense`) | Raw `<ins>` + `useEffect` push | 2024 — wrappers unmaintained | Fewer deps, same effect, no abstraction tax |

**Deprecated/outdated:**
- `pages/api/` route syntax: This project uses App Router — all Route Handlers go in `app/api/` and export named `GET`/`POST` functions.
- `_document.js` for script injection: Use `app/layout.tsx` with `next/script` instead.

---

## Open Questions

1. **AdSense account and publisher ID**
   - What we know: The planner must stub `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE` as env vars
   - What's unclear: Actual `ca-pub-XXXX` value and slot IDs — these come from the AdSense dashboard after account activation
   - Recommendation: Use env vars so they can be filled in without a code change; add a `NEXT_PUBLIC_ADSENSE_CLIENT_ID=""` placeholder to `.env.local.example`

2. **Resend Audience ID**
   - What we know: `RESEND_AUDIENCE_ID` must be set in Vercel; the audience is created once in the Resend dashboard
   - What's unclear: Whether this audience already exists in the Resend account
   - Recommendation: Manual Wave 0 step: "Create audience in Resend dashboard, copy ID to env"

3. **`contacts.update` by email vs. by ID**
   - What we know: SDK v4 changelog mentions email-based updates; the typed signature requires `id` in some versions
   - What's unclear: Whether the project's installed version supports `email` as the update key
   - Recommendation: The confirm Route Handler should fetch the contact ID first using `contacts.list` filtered by email, then update by ID — safest across SDK versions

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/monetization/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MONEY-01 | `generateToken(email)` returns hex string | unit | `npx vitest run tests/monetization/newsletter.test.ts` | ❌ Wave 0 |
| MONEY-01 | `verifyToken(email, validToken)` returns true | unit | `npx vitest run tests/monetization/newsletter.test.ts` | ❌ Wave 0 |
| MONEY-01 | `verifyToken(email, wrongToken)` returns false | unit | `npx vitest run tests/monetization/newsletter.test.ts` | ❌ Wave 0 |
| MONEY-01 | `verifyToken` with different-length input does not throw | unit | `npx vitest run tests/monetization/newsletter.test.ts` | ❌ Wave 0 |
| MONEY-02 | `AdSlot` renders `<ins>` with `data-ad-client` attr | unit | `npx vitest run tests/monetization/ad-slot.test.ts` | ❌ Wave 0 |
| MONEY-02 | `AdSlot` wrapper div has `minHeight` style set | unit | `npx vitest run tests/monetization/ad-slot.test.ts` | ❌ Wave 0 |
| MONEY-01 | POST `/api/newsletter/subscribe` full flow | manual | curl/browser | N/A |
| MONEY-01 | Confirmation email received + link works | manual | browser | N/A |
| MONEY-02 | Lighthouse CLS = 0 on article page | manual | Lighthouse CLI | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/monetization/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/monetization/newsletter.test.ts` — covers MONEY-01 token logic
- [ ] `tests/monetization/ad-slot.test.ts` — covers MONEY-02 component rendering

*(Framework already installed — `vitest` present in `package.json` devDependencies. No install step needed.)*

---

## Sources

### Primary (HIGH confidence)
- [github.com/resend/resend-examples — audiences.ts](https://github.com/resend/resend-examples/blob/main/express-resend-examples/typescript/examples/audiences.ts) — `contacts.create`/`contacts.update` method signatures
- [resend.com/docs/send-with-nextjs](https://resend.com/docs/send-with-nextjs) — Resend Next.js App Router pattern, SDK import and init
- [github.com/resend/resend-double-opt-in-example](https://github.com/resend/resend-double-opt-in-example) — official double opt-in flow structure
- [developers.google.com/publisher-tag/guides/minimize-layout-shift](https://developers.google.com/publisher-tag/guides/minimize-layout-shift) — Google official CLS prevention; CSS `min-height`/`min-width` technique
- [nodejs.org/api/crypto.html](https://nodejs.org/api/crypto.html) — `createHmac`, `timingSafeEqual` API

### Secondary (MEDIUM confidence)
- [resend.com/docs/dashboard/audiences/contacts](https://resend.com/docs/dashboard/audiences/contacts) — Contact management including `unsubscribed` flag
- [spaghetticodejungle.com — Google AdSense with Next.js](https://www.spaghetticodejungle.com/blog/2025/june/google-adsense-with-nextjs/google-adsense-with-nextjs) — `strategy="lazyOnload"` + AdPlaceholder pattern for dev
- [devwhirl.com — Integrating AdSense with latest Next.js](https://devwhirl.com/blog/integrating-google-adsense-with-latest-nextjs) — `lazyOnload` strategy confirmed

### Tertiary (LOW confidence — flag for validation)
- Various Medium posts on Next.js AdSense integration — cross-referenced but some recommend `afterInteractive` instead of `lazyOnload`; `lazyOnload` confirmed by Google official guidance

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Resend SDK and Node.js crypto are authoritative; Next.js Script is framework-native
- Architecture: HIGH — Double opt-in flow is the official Resend example pattern; CLS technique is Google-official
- Pitfalls: HIGH — Most are direct consequences of the technology constraints (window in SSR, timingSafeEqual, env vars)
- `contacts.update` by email vs. ID: MEDIUM — SDK v4 changelog not fully verified

**Research date:** 2026-03-21
**Valid until:** 2026-06-21 (Resend SDK API stable; Next.js 15 stable)
