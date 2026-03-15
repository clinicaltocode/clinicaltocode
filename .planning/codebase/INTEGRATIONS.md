# External Integrations

## Overview
Clinical to Code integrates with external services for analytics, advertising, and newsletter functionality. Most integrations are configured but not fully implemented.

## Analytics

### Google Analytics 4

**Status:** Integrated (placeholder configuration)

**Configuration Location:** `/Users/potts/Claude Projects/clinicaltocode/app/layout.js`

**Details:**
- Service: Google Analytics (GA4)
- Measurement ID: `G-XXXXXXXXXX` (placeholder - needs configuration)
- Implementation: Direct script tag injection via Next.js head
- Code snippet:
  ```jsx
  <script
    async
    src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  />
  <script
    dangerouslySetInnerHTML={{
      __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
      `,
    }}
  />
  ```
- Tracking: Page views and custom events configured but not tested
- Setup Required: Replace placeholder ID with actual Google Analytics property ID

### Google Search Console

**Status:** Planned (not implemented)

**Configuration Location:** `/Users/potts/Claude Projects/clinicaltocode/app/layout.js`

**Details:**
- Verification method: Meta tag
- Placeholder: `google: 'YOUR_GOOGLE_VERIFICATION_CODE'`
- Code location: app/layout.js metadata object
- Purpose: Domain ownership verification for Google Search indexing
- Setup Required: Obtain verification code from Google Search Console and replace placeholder

## Advertising

### Google AdSense

**Status:** Integrated (commented out - awaiting approval)

**Configuration Location:** `/Users/potts/Claude Projects/clinicaltocode/app/layout.js`

**Details:**
- Service: Google AdSense
- Client ID: `ca-pub-XXXXXXXXXX` (placeholder)
- Script source: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`
- Status: Currently commented out (lines 50-54 in layout.js)
- Code:
  ```jsx
  {/* <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
    crossOrigin="anonymous"
  /> */}
  ```
- Ad Placements: Ad space placeholder exists on home page
  - Location: `/Users/potts/Claude Projects/clinicaltocode/app/page.js`, line 50
  - ID: `ad-content-1`
  - Placement: After 4 article cards in grid
  - Current content: "Advertisement" placeholder text

**Setup Required:**
1. Apply for Google AdSense account
2. Obtain publisher client ID
3. Replace `ca-pub-XXXXXXXXXX` with actual ID
4. Uncomment script tag in layout.js
5. Configure ad units for each placement

### Ad Network Targeting
- Premium healthcare IT placement (per code comment)
- Target audience: Healthcare IT leaders, clinicians
- Content type: Healthcare technology articles

## Email & Newsletter

### Newsletter Signup Component

**Status:** Component structure exists (implementation incomplete)

**Configuration Location:**
- Component: `components/NewsletterSignup` (referenced in `/Users/potts/Claude Projects/clinicaltocode/app/page.js` line 8)
- Home page placement: Line 64
- Component file: NOT FOUND (incomplete implementation)

**Details:**
- Purpose: Capture user email subscriptions
- Current status: Placeholder component only - no email service integrated
- Expected integration: Email service for list management (likely SendGrid, Mailchimp, or similar)

**Setup Required:**
1. Select email service provider (SendGrid, Mailchimp, ConvertKit, etc.)
2. Create newsletter signup component
3. Configure API credentials
4. Implement email list subscription flow

## Metadata & Open Graph

### Social Media Integration

**Status:** Configured with placeholders

**Configuration Location:** `/Users/potts/Claude Projects/clinicaltocode/app/layout.js`

**Details:**
- Open Graph metadata (lines 5-19):
  - Title: "Clinical to Code"
  - Description: "Bridging clinical expertise with healthcare IT"
  - Site URL: `https://clinicaltocode.com`
  - Image: `https://clinicaltocode.com/og-image.jpg`
  - Image dimensions: 1200x630px
  - Type: website
  - Locale: en_US

- Twitter Card (lines 20-24):
  - Card type: summary_large_image
  - Title and description same as OG

**Setup Required:**
1. Configure actual domain URL (currently hardcoded as clinicaltocode.com)
2. Upload OG image to appropriate location
3. Update image URLs to match deployed domain

## Content & Data

### Markdown Content Processing

**Status:** Structure in place (content not found)

**Configuration Location:**
- Parser imports: `gray-matter` (^4.0.3), `remark` (^14.0.2), `remark-html` (^15.0.1)
- Usage function: `getAllPosts()` in `../lib/posts` (referenced in `/Users/potts/Claude Projects/clinicaltocode/app/page.js` line 2)
- Content file location: NOT FOUND

**Details:**
- gray-matter: Extracts YAML/JSON frontmatter from markdown
- remark: Processes markdown AST
- remark-html: Renders to HTML
- Expected structure: Markdown files with frontmatter metadata
- Used for: Blog posts with title, date, author, category data

**Setup Required:**
1. Create `/lib/posts.js` file with getAllPosts() function
2. Create `/posts` directory with markdown files
3. Implement post fetching, filtering, and sorting logic

## Unimplemented Components

### Referenced but Missing

The following components are imported but files not found:
- `/components/Navigation` - Site navigation header
- `/components/Hero` - Hero section banner
- `/components/ArticleCard` - Article preview card component
- `/components/Sidebar` - Sidebar with recent posts
- `/components/Footer` - Site footer

**Status:** All component files missing - likely early-stage project
**Location:** Expected at `/Users/potts/Claude Projects/clinicaltocode/components/`

## Infrastructure

### Deployment Target
- Default: Vercel (typical for Next.js apps)
- Configuration: No Vercel config file found (using defaults)
- Environment variables needed:
  - `G_XXXXXXXXXX` - Google Analytics ID
  - `ca-pub-XXXXXXXXXX` - Google AdSense ID
  - Email service credentials (TBD)

### Domain Configuration
- Configured domain: `clinicaltocode.com` (in metadata)
- Status: Not deployed or domain not configured in code

## Integration Checklist

### Completed
- [x] Google Analytics 4 script tags (placeholders in code)
- [x] Open Graph metadata structure
- [x] Ad network placeholder configuration
- [x] Newsletter signup component reference

### In Progress / Incomplete
- [ ] Google Analytics - Replace ID with actual property ID
- [ ] Google Search Console - Add verification code
- [ ] Google AdSense - Uncomment, replace client ID, await approval
- [ ] Newsletter signup - Select email service, implement component
- [ ] Social media - Update with actual domain and images

### Not Started
- Email service provider selection and configuration
- Newsletter list management backend
- Analytics data collection testing
- Ad unit configuration and testing
- Content management system (if needed for post management)

## Third-Party Service Dependencies

| Service | Purpose | Status | Credentials | Location |
|---------|---------|--------|-------------|----------|
| Google Analytics | Traffic tracking | Placeholders | G-XXXXXXXXXX | app/layout.js |
| Google AdSense | Revenue generation | Commented out | ca-pub-XXXXXXXXXX | app/layout.js |
| Google Search Console | SEO indexing | Not configured | Verification code | app/layout.js |
| Email Service (TBD) | Newsletter | Not selected | TBD | components/NewsletterSignup |
| Domain registrar | DNS | Configured | clinicaltocode.com | Metadata |

## Notes

- All external service integrations use placeholder credentials
- Production deployment requires replacing all placeholders with actual IDs
- Email service integration is planned but provider not selected
- No authentication or user account system currently integrated
- No database backend configured
- API routes not implemented
