/**
 * Seed forum threads — creates a guidelines thread + starter discussion
 * thread for each forum category.
 *
 * Usage: node scripts/seed-forum.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load env from .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envFile = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l && !l.startsWith('#')).map(l => {
    const i = l.indexOf('=')
    return [l.slice(0, i), l.slice(i + 1)]
  })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function makePreview(body, maxLen = 200) {
  const plain = body
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/#{1,6}\s+/g, '')
    .trim()
  if (plain.length <= maxLen) return plain
  const cut = plain.lastIndexOf(' ', maxLen)
  return plain.slice(0, cut > 0 ? cut : maxLen) + '…'
}

// ---------- Seed content per category ----------

const seeds = {
  nursing: {
    guideline: {
      title: 'Welcome to Nursing — Forum Guidelines',
      body: `Welcome to the Nursing forum! This space is for clinical nurses, nurse informaticists, and anyone working at the intersection of nursing and technology.

**What belongs here:**
- Experiences with EHR workflows from a nursing perspective
- Questions about clinical decision support tools
- Discussions about documentation burden and how technology can help
- Staffing, scheduling, and workforce tech
- Nursing informatics career paths and certifications

**Please keep in mind:**
- No patient-identifiable information — ever. Follow HIPAA at all times.
- Be respectful of different clinical backgrounds and experience levels.
- Cite sources when making clinical claims.
- Keep vendor discussions balanced — share experiences, not sales pitches.
- Use the upvote system to surface helpful content.

We're glad you're here. Pull up a chair and share what you know.`,
    },
    starter: {
      title: 'What EHR feature would save you the most time on shift?',
      body: `Curious what nurses here would change first about their EHR if they had a magic wand. For me, it's medication reconciliation — the current workflow at my facility requires way too many clicks for something that should be straightforward.

What's the one thing that eats the most of your time in the system? Bonus points if you've actually seen a good implementation somewhere else.`,
    },
  },
  ehr: {
    guideline: {
      title: 'Welcome to EHR — Forum Guidelines',
      body: `Welcome to the EHR forum! This is the place to discuss electronic health record systems — usability, implementation, optimization, interoperability, and everything in between.

**What belongs here:**
- EHR implementation war stories and lessons learned
- Usability issues and workflow design
- Interoperability, HL7 FHIR, and data exchange
- Build vs. buy decisions for EHR customizations
- Vendor comparisons (keep it constructive)
- Upgrade planning and change management

**Please keep in mind:**
- No patient-identifiable information — follow HIPAA at all times.
- Share experiences honestly but constructively — avoid pure venting.
- When discussing vendors, focus on features and workflows, not personalities.
- Tag your posts with the relevant EHR system when applicable.
- Respect that different organizations have different constraints.

Let's build better systems together.`,
    },
    starter: {
      title: 'How is your org handling the shift to FHIR-based integrations?',
      body: `We're in the middle of migrating several legacy HL7v2 interfaces to FHIR at our health system, and it's been... an adventure. The promise of standardized APIs is great, but the reality of mapping existing workflows to FHIR resources has been more complex than expected.

Anyone else in the thick of this? Curious about:
- How you're handling the transition period where both HL7v2 and FHIR coexist
- Which FHIR resources you tackled first
- Whether you've seen actual interoperability wins yet or if it still feels theoretical`,
    },
  },
  'clinical-informatics': {
    guideline: {
      title: 'Welcome to Clinical Informatics — Forum Guidelines',
      body: `Welcome to the Clinical Informatics forum! This space is for discussions about data, analytics, clinical decision support, and the discipline of clinical informatics itself.

**What belongs here:**
- Clinical decision support (CDS) design and alert fatigue
- Data analytics, quality metrics, and population health
- Informatics training, board certification, and career development
- Research methodology for health IT studies
- AI/ML applications in clinical settings
- Governance, data quality, and master data management

**Please keep in mind:**
- No patient-identifiable information — follow HIPAA at all times.
- When discussing AI/ML, be honest about limitations and evidence.
- Distinguish between peer-reviewed evidence and anecdotal experience.
- Respect the multidisciplinary nature of informatics — clinicians, engineers, and data scientists all belong here.
- Share failures as well as successes — the field learns from both.

This is a place for rigorous, thoughtful discussion. Welcome aboard.`,
    },
    starter: {
      title: 'Alert fatigue: what actually works to reduce it?',
      body: `Our clinical decision support committee just finished reviewing our alert override rates and... they're not great. We're seeing 85%+ override rates on drug-drug interaction alerts, which basically means clinicians have been trained to click through everything.

We've started tiering alerts and suppressing low-severity ones, but I'm curious what other organizations have done that actually moved the needle. Specifically interested in:
- How you categorized alert severity (what framework?)
- Whether you involved frontline clinicians in the review process
- Any measurable outcomes after changes (override rates, near-miss events, etc.)

The literature is helpful but I'd love to hear real-world implementation stories.`,
    },
  },
  pharmacy: {
    guideline: {
      title: 'Welcome to Pharmacy — Forum Guidelines',
      body: `Welcome to the Pharmacy forum! This space is for pharmacists, pharmacy informaticists, and anyone working on medication management technology.

**What belongs here:**
- Pharmacy informatics workflows and system design
- CPOE and medication safety technology
- Automated dispensing and inventory management systems
- Clinical pharmacy and MTM technology tools
- 340B program technology and compliance
- Interoperability between pharmacy and EHR systems

**Please keep in mind:**
- No patient-identifiable information — follow HIPAA at all times.
- When discussing medication safety, be specific about the system context.
- Avoid sharing proprietary formulary or pricing data.
- NDC, RxNorm, and terminology discussions are welcome and encouraged.
- Share implementation lessons — what worked and what didn't.

Pharmacy sits at a unique intersection of clinical care and technology. Let's make the most of this space.`,
    },
    starter: {
      title: 'Best practices for CPOE alert configuration in pharmacy?',
      body: `We're doing a major overhaul of our CPOE drug alerts and I'm looking for input from other pharmacy informaticists. Currently we have way too many alerts firing — the classic problem — and our override rate tells us clinicians aren't reading them anymore.

Our plan is to create a tiered approach:
1. Hard stops for truly dangerous interactions (contraindicated combos)
2. Interruptive alerts for significant clinical concerns
3. Passive/informational for nice-to-know items

But the devil is in the details. How are other orgs deciding what goes in each tier? Are you using a specific evidence source (Clinical Pharmacology, Lexicomp, First Databank) as your baseline? And how do you handle the political side — the physicians who want fewer alerts vs. the risk managers who want more?`,
    },
  },
  'physician-perspectives': {
    guideline: {
      title: 'Welcome to Physician Perspectives — Forum Guidelines',
      body: `Welcome to Physician Perspectives! This forum is for physicians and those working closely with them to discuss how technology affects clinical practice.

**What belongs here:**
- Physician experience with EHR usability and documentation
- Clinical workflow optimization from the physician's viewpoint
- Burnout, pajama time, and the documentation burden
- AI scribes, ambient documentation, and emerging tech
- CMIO/physician informaticist career discussions
- Bridging the gap between IT and clinical practice

**Please keep in mind:**
- No patient-identifiable information — follow HIPAA at all times.
- Respect that physicians across specialties face different challenges.
- Technology opinions are welcome; absolutism is not. What works in one setting may not work in another.
- If you're not a physician, you're still welcome — just be clear about your perspective.
- Constructive criticism of tools and workflows is encouraged; personal attacks are not.

The physician voice is critical in health IT. Make yours heard here.`,
    },
    starter: {
      title: 'Has anyone tried AI ambient documentation? What\'s your honest take?',
      body: `I've been hearing a lot about AI-powered ambient documentation tools — DAX Copilot, Abridge, Nabla, and others. The pitch is compelling: the AI listens to the patient encounter and drafts the note for you.

A few colleagues have started using one of these tools and the reactions are mixed. Some say it's cut their documentation time in half. Others say the notes need so much editing that it barely saves time, and they worry about accuracy for complex visits.

For those who've actually used these in practice:
- Which tool are you using and in what specialty?
- How much editing do the generated notes typically need?
- Have you noticed any impact on the patient interaction itself?
- Any concerns about accuracy that have come up in practice?

I'm particularly interested in hearing from specialists — most of the marketing seems targeted at primary care.`,
    },
  },
}

// ---------- Insert logic ----------

async function seed() {
  // Fetch existing categories
  const { data: categories, error: catError } = await supabase
    .from('forum_categories')
    .select('id, slug')

  if (catError) {
    console.error('Failed to fetch categories:', catError.message)
    process.exit(1)
  }

  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]))

  let created = 0
  let skipped = 0

  for (const [catSlug, content] of Object.entries(seeds)) {
    const categoryId = catMap[catSlug]
    if (!categoryId) {
      console.warn(`  ⚠ Category "${catSlug}" not found in DB — skipping`)
      skipped += 2
      continue
    }

    for (const [type, thread] of Object.entries(content)) {
      const slug = `${slugify(thread.title)}-seed`

      // Check if already exists (idempotent)
      const { data: existing } = await supabase
        .from('forum_threads')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        console.log(`  ✓ Already exists: "${thread.title}"`)
        skipped++
        continue
      }

      // Insert thread
      const { data: newThread, error: threadError } = await supabase
        .from('forum_threads')
        .insert({
          title: thread.title,
          slug,
          body_preview: makePreview(thread.body),
          category_id: categoryId,
          author_id: null,
          is_article_thread: false,
        })
        .select('id')
        .single()

      if (threadError) {
        console.error(`  ✗ Failed to create thread "${thread.title}":`, threadError.message)
        continue
      }

      // Insert opening post
      const { error: postError } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: newThread.id,
          parent_post_id: null,
          author_id: null,
          body: thread.body,
          depth: 0,
        })

      if (postError) {
        console.error(`  ✗ Failed to create post for "${thread.title}":`, postError.message)
        continue
      }

      // Update reply_count to reflect the opening post
      await supabase
        .from('forum_threads')
        .update({ reply_count: 1 })
        .eq('id', newThread.id)

      console.log(`  ✓ Created: "${thread.title}"`)
      created++
    }
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped`)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
