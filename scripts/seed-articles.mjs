import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Helper: portable text block
function p(text) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
    markDefs: [],
  }
}

function h2(text) {
  return { ...p(text), style: 'h2' }
}

function h3(text) {
  return { ...p(text), style: 'h3' }
}

function blockquote(text) {
  return { ...p(text), style: 'blockquote' }
}

function list(items, type = 'bullet') {
  return items.map((text) => ({
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    listItem: type,
    level: 1,
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
    markDefs: [],
  }))
}

async function seed() {
  console.log('Creating authors...')

  const author1 = await client.create({
    _type: 'author',
    name: 'Sarah Chen',
    credential: 'RN, MSN',
    bio: 'Critical care nurse turned clinical informaticist. 12 years of bedside experience before transitioning to health IT. Passionate about making technology work for clinicians, not against them.',
    slug: { _type: 'slug', current: 'sarah-chen' },
  })

  const author2 = await client.create({
    _type: 'author',
    name: 'Marcus Williams',
    credential: 'PharmD, BCPS',
    bio: 'Clinical pharmacist and EHR optimization specialist. Works at the intersection of medication safety and health information technology.',
    slug: { _type: 'slug', current: 'marcus-williams' },
  })

  console.log('Creating categories...')

  const catAI = await client.create({
    _type: 'category',
    title: 'AI in Healthcare',
    slug: { _type: 'slug', current: 'ai-in-healthcare' },
    description: 'Artificial intelligence tools, workflows, and adoption strategies for clinical professionals.',
  })

  const catWorkflows = await client.create({
    _type: 'category',
    title: 'Clinical Workflows',
    slug: { _type: 'slug', current: 'clinical-workflows' },
    description: 'Optimizing clinical processes with technology — from documentation to decision support.',
  })

  const catCareer = await client.create({
    _type: 'category',
    title: 'Career Development',
    slug: { _type: 'slug', current: 'career-development' },
    description: 'Growing your career at the intersection of clinical practice and technology.',
  })

  console.log('Creating articles...')

  // --- Article 1 ---
  await client.create({
    _type: 'article',
    title: 'A Nurse\'s Guide to Using AI for Clinical Documentation',
    slug: { _type: 'slug', current: 'nurses-guide-ai-clinical-documentation' },
    author: { _type: 'reference', _ref: author1._id },
    category: { _type: 'reference', _ref: catAI._id },
    tags: ['AI', 'Documentation', 'Nursing', 'Ambient Listening'],
    publishedAt: '2026-04-01T09:00:00Z',
    excerpt: 'AI-powered documentation tools promise to give nurses back hours of their shift. Here\'s what actually works, what doesn\'t, and how to get started without disrupting your workflow.',
    body: [
      h2('The Documentation Problem'),
      p('If you\'re a nurse, you already know: documentation eats your shift alive. Studies consistently show that nurses spend 25-35% of their time on documentation — time that could be spent at the bedside. AI tools are finally mature enough to help, but adopting them requires a thoughtful approach.'),
      p('I\'ve spent the last eight months piloting AI documentation tools in a 32-bed ICU. Here\'s what I learned.'),

      h2('What AI Documentation Tools Actually Do'),
      p('There are two main categories of AI documentation tools available to clinicians today:'),
      h3('Ambient Listening Tools'),
      p('These tools listen to your patient interactions and generate structured notes. Think of them as a scribe that never gets tired. Products like DAX Copilot and Abridge fall into this category. They capture the conversation, extract relevant clinical details, and draft a note in your EHR\'s preferred format.'),
      h3('Smart Templates and Auto-Completion'),
      p('These tools work inside your existing EHR. They predict what you\'re about to type based on context — the patient\'s history, current vitals, and your documentation patterns. They don\'t replace your clinical judgment; they reduce keystrokes.'),

      h2('Getting Started: A Practical Framework'),
      p('Don\'t try to overhaul your entire workflow at once. Start with these steps:'),
      ...list([
        'Pick one documentation type to pilot (I started with admission assessments)',
        'Use the AI tool alongside your normal process for two weeks — don\'t replace anything yet',
        'Review every AI-generated note carefully and track where it gets things wrong',
        'Share your findings with your charge nurse and unit educator',
        'Gradually expand to other note types as you build confidence',
      ]),

      h2('Common Pitfalls'),
      blockquote('The biggest risk with AI documentation isn\'t that it gets things wrong — it\'s that you stop reading what it generates.'),
      p('Every AI tool will produce errors. Sometimes it mishears a medication name. Sometimes it attributes a symptom to the wrong body system. These errors are manageable when you\'re actively reviewing, but dangerous when you\'re rubber-stamping.'),
      p('Other pitfalls I\'ve seen:'),
      ...list([
        'Over-reliance on AI for clinical reasoning — these tools document, they don\'t diagnose',
        'Forgetting to customize templates for your specialty\'s needs',
        'Not involving your IT department early — they need to approve and configure these tools',
        'Ignoring patient consent requirements for ambient listening',
      ]),

      h2('The Bottom Line'),
      p('AI documentation tools are not science fiction anymore. They\'re available, they work reasonably well, and they can genuinely reduce your documentation burden. But they require the same critical thinking you bring to every other aspect of patient care. Start small, stay skeptical, and let your clinical expertise guide the technology — not the other way around.'),
    ],
  })

  // --- Article 2 ---
  await client.create({
    _type: 'article',
    title: 'ChatGPT in the Pharmacy: What Clinical Pharmacists Need to Know',
    slug: { _type: 'slug', current: 'chatgpt-pharmacy-clinical-pharmacists' },
    author: { _type: 'reference', _ref: author2._id },
    category: { _type: 'reference', _ref: catAI._id },
    tags: ['AI', 'Pharmacy', 'ChatGPT', 'Drug Information', 'Patient Safety'],
    publishedAt: '2026-04-03T09:00:00Z',
    excerpt: 'Large language models like ChatGPT are showing up in pharmacies and clinics. A clinical pharmacist breaks down where they help, where they hallucinate, and how to use them responsibly.',
    body: [
      h2('AI Is Already in Your Pharmacy'),
      p('Whether your organization has formally adopted AI tools or not, your colleagues are using them. A recent survey found that 38% of healthcare professionals have used ChatGPT or similar tools for work-related tasks. In pharmacy, that number is likely higher — we\'re information workers at our core.'),
      p('The question isn\'t whether to engage with these tools. It\'s how to use them safely.'),

      h2('Where LLMs Actually Help'),
      h3('Drug Information Summaries'),
      p('Need a quick comparison of two medications\' side effect profiles for a patient counseling session? LLMs are surprisingly good at synthesizing drug information from their training data. They can generate a first draft that you then verify against your authoritative sources — Lexicomp, Clinical Pharmacology, or primary literature.'),
      h3('Patient Education Materials'),
      p('Creating plain-language medication guides is time-consuming. AI can generate a first draft at a 6th-grade reading level that you then review for accuracy. I\'ve cut my patient education development time by 60% this way.'),
      h3('Protocol and Policy Drafting'),
      p('Starting a new antibiotic stewardship protocol from scratch? Use an LLM to generate a framework based on current guidelines, then customize it for your institution. It\'s a starting point, not a finished product.'),

      h2('Where LLMs Fail — Dangerously'),
      blockquote('An LLM will confidently tell you a drug interaction exists that doesn\'t, or miss one that does. It has no concept of patient safety.'),
      p('Critical limitations:'),
      ...list([
        'Drug interaction checking — LLMs miss interactions and invent ones that don\'t exist. Never use them as your interaction database.',
        'Dosing calculations — they frequently get renal or hepatic adjustments wrong. Always verify against approved references.',
        'New drug information — training data has a cutoff. Anything approved or updated recently may be missing or inaccurate.',
        'Clinical decision-making — they cannot weigh patient-specific factors the way you can.',
      ]),

      h2('A Safe Framework for Pharmacy AI Use'),
      p('I use a simple three-step process:'),
      ...list([
        'Generate: Use the AI tool to create a first draft or summary',
        'Verify: Check every clinical claim against an authoritative source',
        'Document: Note that AI-assisted content was verified and by whom',
      ], 'number'),
      p('This framework keeps AI as a productivity tool while maintaining the clinical rigor your patients depend on.'),

      h2('Looking Ahead'),
      p('Pharmacy-specific AI tools are coming. Some EHR vendors are already integrating LLMs into their clinical decision support. As pharmacists, we should be at the table shaping how these tools work — not reacting after they\'re deployed. Learn the technology now so you can advocate for safe implementation later.'),
    ],
  })

  // --- Article 3 ---
  await client.create({
    _type: 'article',
    title: 'From Bedside to Keyboard: How Clinicians Can Break Into Health IT',
    slug: { _type: 'slug', current: 'clinicians-break-into-health-it' },
    author: { _type: 'reference', _ref: author1._id },
    category: { _type: 'reference', _ref: catCareer._id },
    tags: ['Career', 'Health IT', 'Clinical Informatics', 'Transition'],
    publishedAt: '2026-04-05T09:00:00Z',
    excerpt: 'Thinking about moving from clinical practice to health IT? A nurse informaticist shares the skills you already have, the ones you need to build, and how AI is creating new roles that didn\'t exist two years ago.',
    body: [
      h2('Your Clinical Experience Is Your Superpower'),
      p('Here\'s something health IT hiring managers won\'t always tell you: they\'re desperate for people who understand clinical workflows. Every major EHR vendor, every health system IT department, and every healthcare AI startup needs people who\'ve actually delivered patient care. You don\'t need to start from zero — you need to translate what you already know.'),

      h2('Skills You Already Have'),
      p('If you\'ve worked as a clinician, you already possess skills that take IT professionals years to develop:'),
      ...list([
        'Workflow analysis — you\'ve navigated broken processes and found workarounds every single shift',
        'Requirements gathering — you know what clinicians actually need because you\'ve been one',
        'User acceptance testing — you can spot a bad interface in seconds because you\'ve suffered through them',
        'Stakeholder communication — you translate complex information for patients daily; translating for developers isn\'t that different',
        'Change management — you\'ve seen what happens when a new protocol rolls out poorly',
      ]),

      h2('Skills You Need to Build'),
      h3('Data Literacy'),
      p('You don\'t need to become a data scientist, but you need to be comfortable with SQL basics, data visualization, and understanding how clinical data flows through systems. Free resources like Khan Academy\'s SQL course or Google\'s Data Analytics Certificate are solid starting points.'),
      h3('Project Management'),
      p('Health IT lives and dies by project management. A PMP or CAPM certification signals that you understand the methodology. If you\'ve ever led a unit-based quality improvement project, you\'re closer than you think.'),
      h3('Basic Technical Fluency'),
      p('Learn what APIs are, how databases work at a high level, and what HL7/FHIR means for healthcare interoperability. You don\'t need to code — but you need to speak the language well enough to collaborate with developers.'),

      h2('The AI Opportunity'),
      p('AI is creating entirely new roles in healthcare IT that barely existed two years ago:'),
      ...list([
        'Clinical AI Validation Specialist — testing AI tools against real clinical scenarios',
        'AI Implementation Coordinator — bridging the gap between AI vendors and clinical staff',
        'Prompt Engineering for Healthcare — designing AI prompts that produce clinically accurate outputs',
        'Clinical AI Ethics Advisor — ensuring AI tools are deployed equitably and safely',
      ]),
      p('These roles specifically require clinical experience. A computer scientist can build the model, but they can\'t evaluate whether the output would actually help or harm a patient. That\'s your lane.'),

      h2('Making the Transition'),
      blockquote('You don\'t have to quit your clinical job to start. The best transitions happen gradually.'),
      p('Practical steps:'),
      ...list([
        'Volunteer for your unit\'s next EHR upgrade or optimization project',
        'Join your hospital\'s clinical informatics committee',
        'Pursue a clinical informatics certificate or graduate program (many are online and part-time)',
        'Start attending health IT conferences — HIMSS, AMIA, or their regional equivalents',
        'Build a professional network on LinkedIn with health IT leaders',
      ], 'number'),

      h2('The Path Forward'),
      p('The healthcare industry is at an inflection point. AI, interoperability mandates, and value-based care are reshaping how health systems operate. Clinicians who can bridge the gap between patient care and technology will be in demand for decades. Your bedside experience isn\'t something to leave behind — it\'s the foundation everything else is built on.'),
    ],
  })

  console.log('Seed complete! Created 2 authors, 3 categories, and 3 articles.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
