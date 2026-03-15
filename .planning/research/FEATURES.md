# Features Research

**Platform type:** Healthcare professional content hub + Reddit-style community forum
**Reference platforms analyzed:** Doximity, Figure 1, Medscape Community, Hacker News, Reddit, niche professional subreddits (r/medicine, r/nursing, r/healthIT)
**Date:** 2026-03-15

---

## Table Stakes

These are features users expect by default. Absence causes immediate abandonment or signals an unfinished product.

### Authentication & Identity

| Feature | Notes | Complexity |
|---|---|---|
| Email/password signup + login | Minimum viable auth — already in scope | Low |
| Email verification on signup | Required to gate participation, prevent spam | Low |
| Password reset via email | Users expect this; without it, accounts become locked out | Low |
| Persistent sessions | Users should not re-login on every visit | Low |
| Public user profiles | Basic: username, join date, post history | Medium |

### Content (Articles)

| Feature | Notes | Complexity |
|---|---|---|
| Readable article pages | Clean typography, author byline, publish date, read time, category tag | Low |
| Article browsing / listing | Category filters, recent articles, pagination or infinite scroll | Low |
| Search | Users expect to search articles and forum posts; without it the archive becomes inaccessible | Medium |
| RSS or shareable links | Professionals share articles via Slack, email, social — canonical URLs matter | Low |
| Mobile-responsive layout | Clinical staff often read on phones; not optional | Low–Medium |

### Community (Forum)

| Feature | Notes | Complexity |
|---|---|---|
| Threaded discussions | Nested replies (at least 2 levels) — flat comment threads feel broken to Reddit-trained users | Medium |
| Upvote / downvote on posts and replies | The core signal for surfacing quality content; Hacker News uses upvote-only | Low |
| Forum categories / topics | Organized by specialty (Nursing, EHR, Informatics, etc.) — users must be able to find relevant discussions | Low |
| New thread creation | Authenticated users can post; lurkers can read | Low |
| Pagination or load-more on listings | Long threads and category pages need it | Low |
| Basic spam/abuse controls | Report button, ability for admin to remove posts; without this a solo-operated forum becomes unmanageable fast | Medium |

### Infrastructure / UX

| Feature | Notes | Complexity |
|---|---|---|
| Fast page loads | Slow load = bounce; critical for SEO and professional credibility | Low (with Next.js SSG/ISR) |
| Clear navigation | Articles vs Community must be distinct; users should never feel lost | Low |
| 404 and error pages | Missing these signals amateurishness | Low |
| Newsletter signup | Standard lead capture; expected on any content site | Low |

---

## Differentiators

Features that set a healthcare professional platform apart from generic Reddit or a general blog. These are the reasons a clinician chooses this over posting in r/nursing or reading Medscape.

### Professional Credentialing & Trust Signals

| Feature | Why It Differentiates | Complexity |
|---|---|---|
| Role/credential badge on profiles | Doximity and Figure 1 both verify clinical credentials. Even an unverified self-reported badge ("RN", "MD", "CMIO") increases trust and signals this is a professional space, not a general public forum | Medium — self-reported first; verified later |
| Author credential display on articles | Showing "Staff Nurse, 12 years ICU experience" alongside an article builds credibility that Medscape bylines don't offer for frontline contributors | Low — CMS field |
| "Written by a clinician" trust marker | Distinct visual treatment for articles authored by practicing clinicians vs. editorial staff | Low — taxonomy/tag |

### Content Quality & Clinical Relevance

| Feature | Why It Differentiates | Complexity |
|---|---|---|
| Clinical specialty filtering | Users in informatics don't want nursing workflow posts. Topic-level filtering by specialty keeps signal-to-noise high | Low–Medium |
| Curated "Editor's Pick" or featured threads | Hacker News front page, Reddit pinning. A human-curated feed (manageable by a solo admin) surfaces quality over recency | Low |
| Article + thread linking | Allowing a forum thread to be spawned directly from an article ("Discuss this article") creates a virtuous content loop — articles drive discussion, discussion drives return visits | Medium |
| "Clinical case" thread type | A designated post type for de-identified case discussions (Figure 1's core feature). Extremely high engagement in clinical communities; clinicians are trained to learn from cases | Medium |

### Community Experience

| Feature | Why It Differentiates | Complexity |
|---|---|---|
| Upvote-only (no downvotes) | Hacker News model. Downvotes in clinical communities produce pile-ons and silencing of minority clinical opinions. Upvote-only keeps tone constructive | Low — intentional omission |
| Saved / bookmarked posts | Clinicians return to reference threads; bookmarking encourages repeat visits | Medium |
| Weekly or digest-style newsletter | Curated top articles + top forum threads. Doximity's "news feed" is a major engagement driver. A weekly digest is manageable for a solo operator and creates a re-engagement loop | Medium |
| Forum post flair / tagging | User-added tags on threads (e.g., "Epic", "Nursing informatics", "Burnout", "Workflow") — finer-grained than categories alone | Low–Medium |

### Tone & Professionalism

| Feature | Why It Differentiates | Complexity |
|---|---|---|
| Community guidelines tuned to clinical discourse | Explicit norms around de-identification, no patient-identifying details, civil disagreement on clinical topics. Reddit's generic rules don't serve this; Doximity enforces professional tone. Posting these prominently signals the platform's identity | Low — content/policy |
| Admin/moderator transparency | Solo-operated forums benefit from a visible "founder's note" or pinned posts from the operator. It creates accountability and trust that anonymous Reddit mods don't offer | Low |

---

## Anti-Features (v1)

Things to deliberately not build in v1. Each omission has a rationale — these are not failures of ambition but constraints that protect launch quality and solo-operator sanity.

| Feature | Why to Skip | Revisit When |
|---|---|---|
| OAuth / Social login (Google, LinkedIn) | Adds complexity, requires OAuth app setup and maintenance, LinkedIn is particularly useful for credentialing but the return doesn't justify v1 effort | After launch when auth friction is confirmed as a drop-off signal |
| Real-time notifications / WebSockets | Significant infrastructure complexity (Supabase Realtime is available but requires careful implementation). Email notification for replies is sufficient for v1 | After community reaches meaningful daily active user count |
| Direct messaging / DMs | Doximity's DM feature is a massive engagement driver — but also a moderation and HIPAA surface area. Not worth it until community is established | Post-launch, with clear HIPAA guidance baked in |
| Credential verification (automated) | Doximity verifies via NPI lookup. This requires an API integration, legal review, and user support overhead. Self-reported roles are sufficient to create the right community tone for v1 | If verification becomes a competitive differentiator or trust issue |
| Video content | Text-first is the right call. Video requires transcoding infrastructure, storage costs, and significant content production overhead | If video case discussions become a clear user demand |
| Mobile app (iOS/Android) | Web-first is correct. A PWA wrapper can come later if mobile engagement justifies native investment | Post-product-market-fit |
| Multi-author CMS workflow | Contributor management, approval workflows, revision history — all require significant admin UI and process overhead for a solo operator | When the platform has enough volume to justify guest contributors |
| Advanced search (Elasticsearch / semantic) | Basic full-text search (Postgres `tsvector` or a simple Sanity search) is sufficient for v1 content volume. Semantic/AI search is over-engineering at launch | When content library exceeds ~500 articles and search miss rate is measurable |
| Polls / surveys in forum | Adds UI complexity. Community value doesn't justify it until there's an active user base to respond | Nice-to-have after v1 stabilizes |
| Points / karma / gamification | Reddit karma, Doximity CME points. Gamification can distort community incentives and creates maintenance overhead. Launch without it, observe organic engagement patterns first | If user retention data shows engagement drop-off that gamification could address |
| Paid membership / paywalled content | In scope per PROJECT.md but high complexity: requires payment processor integration (Stripe), access control logic, and a content strategy for premium material. De-risk by launching free first | After validating that users will pay — i.e., after free community is active |

---

## Healthcare-Specific Considerations

These are not standard software features — they are the domain constraints that shape every feature decision on a clinical platform.

### HIPAA Awareness (Not Compliance)

Clinical to Code is a **content and community platform, not a covered entity** — it is not storing, processing, or transmitting Protected Health Information (PHI) on behalf of patients. However:

- **Forum posts may contain quasi-PHI**: Clinicians discussing cases may inadvertently include patient-identifying details. Community guidelines must explicitly prohibit this and the platform must have a clear process for removing such posts.
- **No clinical data storage**: The platform must never position itself as a place to store or share actual patient records, images, or identifiable case details. This is both a legal boundary and a community norm to enforce.
- **Direct messaging risk**: DMs between users become a higher HIPAA surface area than public forum posts — another reason to exclude DMs in v1.
- **Legal footer language**: A clear disclaimer that the platform is for educational and professional discussion, not clinical decision support, is standard practice and reduces liability exposure.

### Professional Tone Moderation

- Solo-operated moderation is viable for a small community but requires clear written community guidelines that enforce clinical standards:
  - No patient identification
  - No medical advice to non-professionals
  - Civil disagreement is expected; clinical communities are trained in critique (M&M conference culture)
- Reporting mechanism must feed directly to admin — no community moderation queue in v1.

### Credentialing Surface Area

- Even self-reported role labels ("RN", "NP", "CMIO", "Healthcare IT") on profiles meaningfully change community dynamics. Clinicians self-police in verified professional spaces more than anonymous ones (observed on Doximity, LinkedIn health groups).
- Role field on signup (optional in v1) costs almost nothing to build and pays dividends in community tone.
- NPI-based verification (like Doximity) is the gold standard but is v2+ territory.

### Content Standards

- Articles written by clinicians should carry a "clinical perspective" marker and ideally a brief author bio with credentials — this is standard on NEJM, JAMA, and nursing journals, and clinical audiences expect it.
- The platform sits in a space where professional reputation is on the line for contributors. CMS author profiles with credential fields signal that the platform takes this seriously.

### SEO & Discoverability for Clinical Professionals

- Clinical professionals search Google with highly specific queries ("Epic downtime workflow nursing", "medication reconciliation EHR informatics"). Long-tail SEO on article titles and forum thread titles is a significant acquisition channel.
- Forum threads indexed by Google are an often-overlooked traffic driver — Reddit's SEO dominance is partially explained by this. Ensuring forum posts are crawlable (not behind auth) is a strategic decision to make early.
- Structured data (schema.org `Article`, `HealthTopicContent`) can improve SERP appearance for clinical content.

---

*Research based on: Doximity, Figure 1, Medscape Community, Hacker News, Reddit (r/medicine, r/nursing, r/healthIT, r/ems), Stack Overflow (community model), Substack (newsletter loop), and general SaaS community platform patterns.*
