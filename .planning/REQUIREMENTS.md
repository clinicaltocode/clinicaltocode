# Requirements: Clinical to Code

**Defined:** 2026-03-15
**Core Value:** Clinicians and healthcare IT professionals have a trusted place to both read real frontline perspectives AND have meaningful discussions with each other.

---

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives verification email after signup; email must be verified before forum participation is allowed
- [ ] **AUTH-03**: User can log in with email/password and session persists across browser refresh and new tabs

### Content

- [ ] **CONT-01**: Admin can create, edit, and publish articles via Sanity CMS Studio editor UI (no code deploy required)
- [ ] **CONT-02**: Visitor can browse article index page with category filtering and pagination
- [ ] **CONT-03**: Visitor can read individual article pages showing title, author name + credential, read time, category, and tags
- [ ] **CONT-04**: Each published article automatically spawns a linked forum discussion thread in the appropriate category

### Forum

- [ ] **FORUM-01**: Visitor can browse and read all forum categories and threads without an account
- [ ] **FORUM-02**: Authenticated verified user can create a new thread in a forum category
- [ ] **FORUM-03**: Authenticated verified user can reply to a thread (minimum 2-level nesting)
- [ ] **FORUM-04**: Authenticated user can upvote a post or reply (upvote only, no downvote)
- [ ] **FORUM-05**: Forum is organized into clinical specialty categories (e.g. Nursing, EHR, Clinical Informatics, Pharmacy, Physician Perspectives)
- [ ] **FORUM-06**: Authenticated user can bookmark a thread and view their saved threads

### User Profiles

- [ ] **PROF-01**: User has a public profile page showing username, join date, credential badge, and post history
- [ ] **PROF-02**: User can set a self-reported credential badge on their profile (RN, NP, MD, PharmD, CMIO, Health IT, etc.)
- [ ] **PROF-03**: User can upload a profile avatar and write a short bio

### Moderation

- [ ] **MOD-01**: Authenticated user can report a post or thread via a report button
- [ ] **MOD-02**: Admin can view a queue of reported content and mark reports as reviewed
- [ ] **MOD-03**: Admin can soft-delete any post or thread and ban a user account
- [ ] **MOD-04**: Site has a publicly visible Community Guidelines page explaining platform norms (clinical discourse, de-identification, professional tone)

### Monetization

- [ ] **MONEY-01**: Visitor can subscribe to the newsletter with double opt-in confirmation email (via Resend)
- [ ] **MONEY-02**: Article and forum pages include reserved AdSense-ready ad slot containers (sized, no CLS) ready to activate

### Infrastructure

- [ ] **INFRA-01**: Application is built on Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres via PgBouncer port 6543) + Sanity CMS, deployed to Vercel with all environment variables configured

---

## v2 Requirements

### Authentication

- **AUTH-04**: User can reset password via email link
- **AUTH-05**: Auth emails sent from branded @clinicaltocode.com address via Resend SMTP

### Forum

- **FORUM-07**: Clinical case thread type — designated format for de-identified patient case discussions
- **FORUM-08**: Real-time notifications for replies to user's threads

### Discovery

- **DISC-01**: Site-wide search across articles and forum posts
- **DISC-02**: SEO metadata (generateMetadata), sitemap.ts, robots.ts, JSON-LD structured data on all routes

### Monetization

- **MONEY-03**: Paid membership tier via Stripe — subscription with premium content gate enforced in server components and RLS
- **MONEY-04**: Dedicated sponsorship/partner placement ad zones for direct healthcare IT vendor deals

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Social/OAuth login | Email/password sufficient for v1; avoids OAuth complexity |
| Mobile app | Web-first; responsive design covers mobile use |
| Real-time chat / DMs | HIPAA surface area, moderation overhead, async forum is sufficient |
| Credential verification (NPI lookup) | Legal overhead; self-reported badges sufficient for v1 |
| Gamification / karma points | Distorts community incentives before norms are established |
| Video content | Storage/bandwidth cost; text-first for v1 |

---

## Traceability

*Populated during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 3 | Pending |
| FORUM-01 | Phase 4 | Pending |
| FORUM-02 | Phase 4 | Pending |
| FORUM-03 | Phase 4 | Pending |
| FORUM-04 | Phase 4 | Pending |
| FORUM-05 | Phase 4 | Pending |
| FORUM-06 | Phase 4 | Pending |
| PROF-01 | Phase 5 | Pending |
| PROF-02 | Phase 5 | Pending |
| PROF-03 | Phase 5 | Pending |
| MOD-01 | Phase 6 | Pending |
| MOD-02 | Phase 6 | Pending |
| MOD-03 | Phase 6 | Pending |
| MOD-04 | Phase 6 | Pending |
| MONEY-01 | Phase 7 | Pending |
| MONEY-02 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after initial definition*
