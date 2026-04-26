/**
 * Seed script: creates authors, categories, and articles in Sanity.
 *
 * Usage:
 *   node scripts/seed-content.mjs
 *
 * Requires SANITY_API_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, and
 * NEXT_PUBLIC_SANITY_DATASET in .env.local
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l && !l.startsWith('#')).map(l => {
    const [key, ...rest] = l.split('=')
    return [key.trim(), rest.join('=').trim()]
  })
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function block(text, style = 'normal') {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  }
}

function blockWithMarks(segments, style = 'normal') {
  const markDefs = []
  const children = segments.map(seg => {
    const child = {
      _type: 'span',
      _key: Math.random().toString(36).slice(2, 10),
      text: seg.text,
      marks: seg.bold ? ['strong'] : seg.italic ? ['em'] : [],
    }
    return child
  })
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs,
    children,
  }
}

function listItem(text, level = 1, listType = 'bullet') {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    listItem: listType,
    level,
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  }
}

// ─── Authors ──────────────────────────────────────────────────────────────────

const authors = [
  {
    _id: 'author-sarah-chen',
    name: 'Sarah Chen',
    credential: 'RN, MSN',
    bio: 'Sarah is an ICU nurse turned clinical informaticist with 12 years of bedside experience. She now works at a large academic medical center leading EHR optimization projects. She writes about what actually happens when technology meets patient care.',
    slug: 'sarah-chen',
  },
  {
    _id: 'author-james-okonkwo',
    name: 'James Okonkwo',
    credential: 'MD, CMIO',
    bio: 'James is a hospitalist and Chief Medical Information Officer at a 400-bed community hospital. He bridges the gap between physician workflows and IT systems, and has led three major EHR implementations.',
    slug: 'james-okonkwo',
  },
  {
    _id: 'author-maria-santos',
    name: 'Maria Santos',
    credential: 'PharmD, BCPS',
    bio: 'Maria is a clinical pharmacist specializing in medication safety and informatics. She has spent the last eight years building and refining clinical decision support systems that reduce adverse drug events.',
    slug: 'maria-santos',
  },
  {
    _id: 'author-david-kim',
    name: 'David Kim',
    credential: 'RN, CPHIMS',
    bio: 'David transitioned from emergency nursing to health IT after a decade in the ED. He now works as a clinical analyst focused on interoperability and data exchange. He writes about the career path from bedside to IT.',
    slug: 'david-kim',
  },
  {
    _id: 'author-rachel-thompson',
    name: 'Rachel Thompson',
    credential: 'DNP, NI-BC',
    bio: 'Rachel is a board-certified nursing informaticist and Doctor of Nursing Practice. She leads informatics governance at a multi-hospital health system and focuses on nursing documentation and workflow standardization.',
    slug: 'rachel-thompson',
  },
]

// ─── Categories ───────────────────────────────────────────────────────────────

const categories = [
  {
    _id: 'cat-ehr-workflows',
    title: 'EHR & Workflows',
    slug: 'ehr-workflows',
    description: 'Electronic health record systems, clinical workflows, and optimization strategies.',
  },
  {
    _id: 'cat-clinical-informatics',
    title: 'Clinical Informatics',
    slug: 'clinical-informatics',
    description: 'The science and practice of clinical informatics — from theory to implementation.',
  },
  {
    _id: 'cat-career-transitions',
    title: 'Career Transitions',
    slug: 'career-transitions',
    description: 'Navigating the path from clinical practice to healthcare technology roles.',
  },
  {
    _id: 'cat-patient-safety',
    title: 'Patient Safety & Quality',
    slug: 'patient-safety',
    description: 'How technology impacts patient safety, quality improvement, and clinical outcomes.',
  },
  {
    _id: 'cat-interoperability',
    title: 'Interoperability',
    slug: 'interoperability',
    description: 'Data exchange, standards, and connecting healthcare systems.',
  },
  {
    _id: 'cat-ai-in-healthcare',
    title: 'AI in Healthcare',
    slug: 'ai-in-healthcare',
    description: 'Artificial intelligence, machine learning, and clinical decision support in healthcare.',
  },
]

// ─── Articles ─────────────────────────────────────────────────────────────────

const now = new Date()
function daysAgo(n) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const articles = [
  // ── Article 1 ──────────────────────────────────────────────────────────
  {
    _id: 'article-alert-fatigue',
    title: 'Alert Fatigue Is a Patient Safety Crisis — Here\'s What We Can Do About It',
    slug: 'alert-fatigue-patient-safety-crisis',
    author: { _type: 'reference', _ref: 'author-maria-santos' },
    category: { _type: 'reference', _ref: 'cat-patient-safety' },
    tags: ['alert fatigue', 'clinical decision support', 'medication safety', 'patient safety'],
    publishedAt: daysAgo(1),
    excerpt: 'Clinicians override 90%+ of drug interaction alerts. That\'s not a people problem — it\'s a design problem. A clinical pharmacist explains what meaningful CDS looks like.',
    body: [
      block('Every shift, I watch nurses and physicians click through dozens of alerts they barely read. Override. Override. Override. We\'ve trained an entire generation of clinicians to ignore the systems designed to keep patients safe.'),
      block('This isn\'t a character flaw. It\'s the predictable result of systems that cry wolf hundreds of times a day.'),
      block('The Scale of the Problem', 'h2'),
      block('Studies consistently show that clinicians override between 49% and 96% of clinical decision support (CDS) alerts, depending on the institution and alert type. In my own hospital, when we audited our medication alerts last year, we found that providers were overriding 91% of drug-drug interaction warnings.'),
      block('That number sounds alarming until you look at what was actually being flagged. The vast majority of those alerts were low-severity interactions that any competent clinician would already know about — things like "aspirin interacts with ibuprofen." Of course it does. The physician prescribed both intentionally.'),
      block('Meanwhile, the handful of genuinely dangerous interactions — the ones that could kill someone — get lost in the noise.'),
      block('Why Most CDS Implementations Fail', 'h2'),
      block('The root cause is almost always the same: alerts are configured by vendors or committees far removed from the clinical workflow. They\'re designed for legal defensibility, not clinical usefulness.'),
      block('Here\'s what I see most often:'),
      listItem('Alerts fire for interactions the clinician has already accounted for'),
      listItem('Severity tiers are too broad — everything looks equally urgent'),
      listItem('No context awareness — the system doesn\'t know this is a palliative care patient where the benefit-risk calculation is completely different'),
      listItem('Alerts interrupt at the wrong time in the workflow, when the decision has already been made'),
      block('What Actually Works', 'h2'),
      block('At my hospital, we spent 18 months rebuilding our CDS approach. The results were dramatic — and the changes were less technical than you\'d think.'),
      blockWithMarks([
        { text: 'First, we reduced total alert volume by 60%.', bold: true },
        { text: ' We disabled every low-severity interaction alert and replaced them with passive informational displays. The pharmacist still reviews the order — we just stopped interrupting the ordering provider for things that don\'t need interrupting.' },
      ]),
      blockWithMarks([
        { text: 'Second, we added context.', bold: true },
        { text: ' Our high-severity alerts now incorporate patient-specific data: renal function, current medications, documented allergies with reaction types. Instead of "Drug A interacts with Drug B," the alert says "This dose of gentamicin may exceed safe levels given this patient\'s current creatinine clearance of 28 mL/min."' },
      ]),
      blockWithMarks([
        { text: 'Third, we made the alerts actionable.', bold: true },
        { text: ' Every alert now includes a specific recommendation: an alternative medication, a dose adjustment, or a monitoring parameter. Clinicians don\'t just see the problem — they see a path forward.' },
      ]),
      block('The result? Override rates for our remaining high-severity alerts dropped from 87% to 34%. More importantly, we caught three potential adverse events in the first quarter that the old system would have buried in noise.'),
      block('The Takeaway for Health IT Teams', 'h2'),
      block('If your CDS override rate is above 70%, your system isn\'t protecting patients — it\'s training clinicians to ignore safety nets. The fix isn\'t more alerts. It\'s fewer, better ones.'),
      block('Work with your pharmacists and physicians to audit what\'s actually firing. Kill the noise. Invest in context. Make every remaining alert worth the interruption.'),
    ],
  },

  // ── Article 2 ──────────────────────────────────────────────────────────
  {
    _id: 'article-nurse-to-informatics',
    title: 'From Bedside to Keyboard: A Nurse\'s Guide to Breaking Into Health IT',
    slug: 'nurse-guide-breaking-into-health-it',
    author: { _type: 'reference', _ref: 'author-david-kim' },
    category: { _type: 'reference', _ref: 'cat-career-transitions' },
    tags: ['nursing informatics', 'career change', 'clinical analyst', 'health IT careers'],
    publishedAt: daysAgo(3),
    excerpt: 'After 10 years in the ED, I made the jump to health IT. Here\'s what I wish someone had told me about the transition — the good, the hard, and the surprisingly transferable skills.',
    body: [
      block('When I told my charge nurse I was leaving the ED to work in IT, she looked at me like I\'d said I was joining the circus. "You\'re going to sit at a desk all day?" she asked. "You\'ll be bored in a week."'),
      block('That was four years ago. I haven\'t been bored once.'),
      block('Why Nurses Make Excellent Health IT Professionals', 'h2'),
      block('Here\'s what nobody tells you: the skills that make you a good nurse — critical thinking under pressure, understanding complex systems, advocating for patients, communicating with everyone from housekeeping to surgeons — are exactly what health IT needs.'),
      block('I didn\'t realize this until my first week as a clinical analyst. The developers I worked with were brilliant at building software, but they\'d never stood at a medication dispensing cabinet at 3 AM with a crashing patient wondering why the override wasn\'t working. I had. That perspective was worth more than any certification.'),
      block('The Practical Path', 'h2'),
      block('There isn\'t one path — there are several. Here\'s what I\'ve seen work:'),
      blockWithMarks([
        { text: 'Super-user or champion role: ', bold: true },
        { text: 'Most hospitals have clinicians who serve as go-to people during EHR upgrades and implementations. This is the lowest-barrier entry point. Volunteer for every upgrade, every new module rollout, every workflow committee. You\'re building a resume without leaving your clinical role.' },
      ]),
      blockWithMarks([
        { text: 'Clinical analyst position: ', bold: true },
        { text: 'These roles sit between IT and the clinical staff. You\'ll build order sets, configure documentation templates, troubleshoot workflow issues, and translate between two groups that often don\'t speak the same language. Many hospitals will hire strong clinical candidates without IT-specific degrees.' },
      ]),
      blockWithMarks([
        { text: 'Informatics graduate program: ', bold: true },
        { text: 'If you want to go deep, programs like AMIA 10x10 or a master\'s in nursing/health informatics give you the theoretical foundation. But I\'d recommend working in a hybrid role first — the degree means more when you can connect it to real experience.' },
      ]),
      block('What I Wish I\'d Known', 'h2'),
      listItem('The pay cut may be temporary. I took a 15% pay cut initially (no more shift differentials or overtime), but within two years I was earning more than my bedside salary, with better hours and no holiday rotations.'),
      listItem('You\'ll grieve the bedside. Even if you were burned out — and I was — there\'s a loss in leaving direct patient care. That\'s normal. Give yourself permission to feel it.'),
      listItem('Your clinical knowledge has a shelf life. Stay connected to clinical practice. Shadow nurses, attend grand rounds, read journals. The moment you lose touch with the bedside, you lose the thing that makes you valuable.'),
      listItem('Imposter syndrome is real. You\'ll sit in meetings with people who have computer science degrees and feel like a fraud. Remember: they don\'t know what a nurse knows. You\'re not there despite being a nurse — you\'re there because of it.'),
      block('The Bottom Line', 'h2'),
      block('Healthcare technology desperately needs people who understand clinical workflows from the inside. If you\'re a nurse thinking about this transition, you\'re not abandoning patient care — you\'re scaling your impact. The changes you make to an EHR system affect every patient on every unit, every shift. That\'s a different kind of bedside manner, but it matters just as much.'),
    ],
  },

  // ── Article 3 ──────────────────────────────────────────────────────────
  {
    _id: 'article-ehr-implementation-lessons',
    title: 'I\'ve Led Three EHR Implementations. Here Are the Mistakes Everyone Makes.',
    slug: 'ehr-implementation-mistakes-everyone-makes',
    author: { _type: 'reference', _ref: 'author-james-okonkwo' },
    category: { _type: 'reference', _ref: 'cat-ehr-workflows' },
    tags: ['EHR implementation', 'change management', 'physician adoption', 'go-live'],
    publishedAt: daysAgo(5),
    excerpt: 'EHR implementations fail for the same reasons every time — and those reasons are rarely technical. A CMIO shares the patterns he\'s seen across three go-lives.',
    body: [
      block('I\'ve been the physician lead on three major EHR transitions. Two were migrations between major vendors. One was a community hospital going from paper charts to a fully electronic system. Each one taught me something, and the lessons were almost never about the technology.'),
      block('Mistake #1: Underestimating Physician Resistance', 'h2'),
      block('Every implementation plan I\'ve seen acknowledges "change management" as a line item. Almost none of them take it seriously enough.'),
      block('Physicians resist EHR changes for rational reasons. They\'ve been burned before. They know the new system will slow them down for months. They\'ve seen "optimization" projects that optimized for billing compliance while making their clinical workflow worse.'),
      block('What works: identify your physician influencers early — not the ones who love technology, but the ones other doctors respect. If the crusty senior cardiologist who\'s been at the hospital for 25 years says the new system is workable, the rest will follow. If she says it\'s garbage, no amount of training will save you.'),
      block('Mistake #2: Building for the Spec, Not the Workflow', 'h2'),
      block('The vendor demo looks beautiful. Everything flows perfectly. Then you put it in front of a nurse at 2 AM with five patients, and it falls apart.'),
      block('The gap between the demo and reality is always the workflow. Vendors build for idealized scenarios. Clinical workflows are messy, context-dependent, and full of workarounds that exist for good reasons.'),
      block('Before you configure anything, spend time on the floor. Shadow nurses, physicians, pharmacists, and techs through entire shifts. Watch where they click. Watch where they hesitate. Ask "why do you do it that way?" — and accept that the answer might be "because the system makes me."'),
      block('Mistake #3: Training Is Not a Two-Day Course', 'h2'),
      block('Most implementations front-load training: a few days of classroom instruction before go-live, then at-the-elbow support for the first week, then nothing. This is backwards.'),
      block('Clinicians can\'t absorb what they need in a classroom. They learn by doing — and they need help three weeks after go-live more than they need it on day one. That\'s when the real edge cases appear. That\'s when the frustration peaks.'),
      block('Our most successful implementation dedicated 60% of the training budget to post-go-live support. We kept clinical informatics staff on every unit for six weeks. The initial learning curve was the same as previous implementations, but the sustained adoption was dramatically better.'),
      block('Mistake #4: Ignoring the Night Shift', 'h2'),
      block('Almost every implementation is planned and tested by people who work day shift. Night shift staff get the same training materials, but their workflows are different. They have fewer resources, less support, and different patient acuity patterns.'),
      block('If your go-live readiness testing doesn\'t include night-shift scenarios with night-shift staff, you have a gap. Fill it.'),
      block('The One Thing That Matters Most', 'h2'),
      block('After three implementations, I believe the single biggest predictor of success is this: does the project team include clinicians who are empowered to say no?'),
      block('Not clinicians who attend meetings and provide input. Clinicians who can veto a configuration decision because it will harm patient care or destroy a workflow. If your clinical leads don\'t have that authority, your implementation is being driven by IT priorities — and it will feel like it.'),
    ],
  },

  // ── Article 4 ──────────────────────────────────────────────────────────
  {
    _id: 'article-fhir-explained',
    title: 'FHIR Explained: What Clinicians Actually Need to Know About Interoperability',
    slug: 'fhir-explained-clinicians-interoperability',
    author: { _type: 'reference', _ref: 'author-david-kim' },
    category: { _type: 'reference', _ref: 'cat-interoperability' },
    tags: ['FHIR', 'interoperability', 'health information exchange', 'data standards'],
    publishedAt: daysAgo(7),
    excerpt: 'You\'ve heard FHIR mentioned in every health IT meeting for the last five years. Here\'s what it actually means for the clinicians and analysts who work with health data every day.',
    body: [
      block('If you work in healthcare and haven\'t heard the term "FHIR" yet, you will. It stands for Fast Healthcare Interoperability Resources, and it\'s the standard that\'s supposed to finally make healthcare systems talk to each other. But most explanations of FHIR are written for developers. This one is for clinicians.'),
      block('The Problem FHIR Solves', 'h2'),
      block('When a patient transfers from Hospital A to Hospital B, their records often don\'t follow them — at least not in a useful way. You might get a faxed discharge summary. You might get a CCD (continuity of care document) that your system technically ingests but dumps into an unstructured blob that nobody reads.'),
      block('The reason is simple: different EHR systems store data in different formats. One system calls it "allergies," another calls it "adverse reactions." One stores medications as free text, another as coded entries. Without a shared language, exchanging data is like trying to have a conversation where each person is speaking a different dialect.'),
      block('FHIR is that shared language.'),
      block('What FHIR Actually Does', 'h2'),
      block('FHIR defines standardized "resources" — think of them as building blocks that represent clinical concepts. There\'s a Patient resource, a Medication resource, an Observation resource (for lab results and vitals), an AllergyIntolerance resource, and about 150 others.'),
      block('Each resource has a defined structure. A Patient resource always has the same fields: name, date of birth, identifiers, contact information. This means that when System A sends a Patient resource to System B, both systems know exactly where to find each piece of information.'),
      block('Why Should Clinicians Care?', 'h2'),
      block('You should care because FHIR is what\'s making the following things possible:'),
      listItem('Patient-facing apps: The 21st Century Cures Act requires that patients can access their health data through third-party apps. Those apps connect to your EHR through FHIR APIs.'),
      listItem('Better care coordination: When interoperability works, the specialist your patient sees next week will actually have your notes, the current med list, and the recent labs — structured and searchable, not buried in a fax.'),
      listItem('Clinical decision support that works across systems: CDS tools can pull data from multiple sources using FHIR, giving a more complete picture than any single EHR alone.'),
      listItem('Reduced documentation burden: If data flows between systems properly, you stop re-entering information that already exists somewhere else.'),
      block('What FHIR Doesn\'t Solve', 'h2'),
      block('FHIR is a technical standard, not a policy solution. It defines how to send data, but not when or whether to send it. Your hospital can have a perfect FHIR implementation and still not share data with the practice down the street because of organizational politics, competing business interests, or consent management challenges.'),
      block('It also doesn\'t guarantee data quality. If a clinician enters a medication as free text rather than selecting from a coded list, FHIR can\'t magically structure that data during exchange.'),
      block('What This Means for Your Work', 'h2'),
      block('If you\'re a clinical analyst or informaticist, FHIR literacy is becoming essential. You don\'t need to write code, but you do need to understand what\'s possible and what\'s not when someone asks "can we pull that data from the outside hospital?"'),
      block('The answer is increasingly "yes" — but only if the data was captured in a structured way at the source. That\'s where clinical documentation quality and interoperability intersect, and it\'s an area where clinicians have more influence than they realize.'),
    ],
  },

  // ── Article 5 ──────────────────────────────────────────────────────────
  {
    _id: 'article-ai-clinical-documentation',
    title: 'AI-Generated Clinical Notes: Promise, Peril, and What We\'re Getting Wrong',
    slug: 'ai-generated-clinical-notes-promise-peril',
    author: { _type: 'reference', _ref: 'author-james-okonkwo' },
    category: { _type: 'reference', _ref: 'cat-ai-in-healthcare' },
    tags: ['ambient AI', 'clinical documentation', 'AI scribes', 'physician burnout'],
    publishedAt: daysAgo(9),
    excerpt: 'Ambient AI scribes promise to eliminate documentation burden. But the clinician is still responsible for every word in that note — and that creates new risks we\'re not talking about enough.',
    body: [
      block('The pitch is seductive: an AI listens to your patient encounter, generates a complete clinical note, and you just review and sign. No more hours of charting after dinner. No more choosing between documentation quality and time with patients.'),
      block('I\'ve been piloting ambient AI documentation at my hospital for six months. The technology is genuinely impressive — and genuinely concerning. We need to have a more honest conversation about both sides.'),
      block('What\'s Working', 'h2'),
      block('The time savings are real. Our pilot physicians are spending 30-45 fewer minutes per day on documentation. That\'s not trivial. For a hospitalist seeing 16-18 patients a day, that\'s the difference between finishing notes at 5 PM and finishing at 7 PM.'),
      block('The notes are surprisingly comprehensive. The AI captures details that busy physicians often omit — exact phrases the patient used, the sequence of the review of systems, specific counseling provided. In many cases, the AI-generated note is more thorough than what the physician would have written.'),
      block('What\'s Concerning', 'h2'),
      block('Here\'s the problem nobody wants to talk about: the AI sometimes gets things wrong, and the errors are subtle enough that a tired physician doing a quick review might miss them.'),
      block('In our pilot, we found:'),
      listItem('The AI occasionally attributes symptoms to the wrong body system'),
      listItem('Negatives sometimes become positives ("patient denies chest pain" becomes "patient reports chest pain") — rare but devastating when it happens'),
      listItem('The AI fills in "expected" physical exam findings that weren\'t actually performed or stated'),
      listItem('Family history and social history can bleed between encounters if the AI model has context from prior visits'),
      block('Each of these errors, standing alone, seems minor. But a clinical note is a legal document. It drives billing, informs other providers, and can be subpoenaed in litigation. A hallucinated physical exam finding isn\'t just an inaccuracy — it\'s a potential malpractice issue.'),
      block('The Review Problem', 'h2'),
      block('The most insidious risk is what I call the "review problem." Signing off on a document you wrote engages different cognitive processes than reviewing a document someone else wrote. When you dictate or type a note, you\'re actively constructing the narrative. When you review an AI draft, you\'re doing quality assurance on someone else\'s work.'),
      block('Human beings are bad at QA. We skim. We assume. We develop trust in systems that are usually right, which makes us worse at catching the times they\'re wrong. This is the same automation complacency that causes problems in aviation and manufacturing.'),
      block('What We Should Be Doing', 'h2'),
      listItem('Structured review protocols: Don\'t just tell physicians to "review the note." Give them a checklist. Assessment and plan accurate? Medication list matches? Physical exam findings reflect what was actually done?'),
      listItem('Audit programs: Randomly sample AI-generated notes and compare them against the actual encounter (if recorded). Track error rates by type and feed corrections back to the vendor.'),
      listItem('Clear liability frameworks: Who is responsible when an AI-generated note contains an error that leads to harm? Right now, it\'s the signing physician — but they didn\'t write the note. The legal landscape here is unsettled and needs attention.'),
      listItem('Preserve clinical reasoning: The assessment and plan should always be physician-authored. The AI can draft the HPI, ROS, and exam. But the clinical thinking — the "why" behind the decisions — should come from the clinician.'),
      block('The technology is coming regardless. Our job is to implement it in a way that captures the benefits without creating new categories of harm. That requires the same rigor we apply to any clinical intervention: evidence, monitoring, and a willingness to pump the brakes when the data warrants it.'),
    ],
  },

  // ── Article 6 ──────────────────────────────────────────────────────────
  {
    _id: 'article-nursing-documentation-burden',
    title: 'The Hidden Tax: How Documentation Burden Is Driving Nurses Out of the Profession',
    slug: 'nursing-documentation-burden-driving-nurses-out',
    author: { _type: 'reference', _ref: 'author-rachel-thompson' },
    category: { _type: 'reference', _ref: 'cat-ehr-workflows' },
    tags: ['nursing documentation', 'EHR usability', 'nurse burnout', 'workflow optimization'],
    publishedAt: daysAgo(11),
    excerpt: 'Nurses spend up to 40% of their shift documenting. Much of that documentation serves compliance and billing — not patient care. A nursing informaticist examines what we can cut and what we can\'t.',
    body: [
      block('In a 12-hour shift, a medical-surgical nurse might spend four to five hours on documentation. That\'s not an exaggeration — multiple time-motion studies have confirmed it. For every hour of direct patient care, there\'s nearly an equal hour of charting.'),
      block('When I talk to nurses who are considering leaving the profession — and I talk to a lot of them — documentation burden comes up almost as often as staffing ratios and pay. "I didn\'t go to nursing school to stare at a screen" is something I hear weekly.'),
      block('Why Nursing Documentation Has Grown', 'h2'),
      block('Nursing documentation has expanded relentlessly for three decades, driven by forces that have little to do with patient care:'),
      listItem('Regulatory requirements: CMS conditions of participation, Joint Commission standards, and state regulations all mandate specific documentation elements.'),
      listItem('Legal defensibility: "If you didn\'t chart it, you didn\'t do it" has become gospel. This drives defensive documentation — charting not for clinical communication but for potential litigation.'),
      listItem('Billing and reimbursement: Many documentation requirements exist to support facility billing, DRG assignment, or quality measure reporting.'),
      listItem('EHR design: Most EHR systems were designed around physician workflows and adapted for nursing as an afterthought. Nursing flowsheets often require documenting the same information in multiple places.'),
      block('What Can We Actually Change?', 'h2'),
      block('Not all documentation is waste. Intake assessments, medication administration records, and critical clinical observations are essential for care continuity and safety. The question is: what\'s mandated by patient care, and what\'s mandated by everything else?'),
      block('At my health system, we conducted a documentation audit that categorized every nursing documentation element into four buckets:'),
      listItem('Clinically essential: Required for safe patient care and care transitions'),
      listItem('Regulatory/compliance: Required by law or accreditation but not directly used in care'),
      listItem('Redundant: Documented in more than one place or already captured automatically'),
      listItem('Legacy: Required by a policy that no one can trace to a current requirement'),
      block('The results were revealing. Nearly 30% of what we asked nurses to document fell into the "redundant" or "legacy" categories. We eliminated those elements, and nursing satisfaction scores for EHR usability improved by 22 points.'),
      block('Practical Steps for Informatics Teams', 'h2'),
      listItem('Audit your flowsheets. Look for elements that are charted but never viewed by another clinician. If no one reads it, question whether it needs to exist.'),
      listItem('Leverage device integration. If vital signs are coming from connected monitors, stop asking nurses to manually enter them. The same goes for intake/output from smart pumps and bladder scanners.'),
      listItem('Default intelligently. If 95% of patients on a unit have the same diet order, don\'t make the nurse select it from a list every assessment — default it and let them change exceptions.'),
      listItem('Talk to nurses. Not in a conference room. On the unit, during a shift, while they\'re actually doing the work. The gap between what IT thinks the workflow is and what it actually is can be enormous.'),
      block('The Bigger Picture', 'h2'),
      block('We are asking nurses to absorb the documentation needs of regulators, lawyers, billers, and quality teams — on top of caring for sick patients. Every unnecessary click is time taken from the bedside. In a profession already facing a critical shortage, documentation burden isn\'t just an IT problem. It\'s a workforce crisis.'),
    ],
  },

  // ── Article 7 ──────────────────────────────────────────────────────────
  {
    _id: 'article-clinical-informaticist-role',
    title: 'What Does a Clinical Informaticist Actually Do All Day?',
    slug: 'what-clinical-informaticist-does-all-day',
    author: { _type: 'reference', _ref: 'author-sarah-chen' },
    category: { _type: 'reference', _ref: 'cat-clinical-informatics' },
    tags: ['clinical informatics', 'informatics career', 'day in the life', 'health IT roles'],
    publishedAt: daysAgo(14),
    excerpt: 'The job title is vague and the work is invisible until something breaks. A clinical informaticist breaks down what the role actually looks like on a typical Tuesday.',
    body: [
      block('"So... you fix computers?" My family still doesn\'t understand what I do. Honestly, some days I\'m not sure I can explain it in a sentence either. But I\'ll try: I make the technology that clinicians use every day work better for patient care.'),
      block('Here\'s what a typical Tuesday looks like:'),
      block('7:30 AM — The Inbox', 'h2'),
      block('I start with tickets. Three overnight nursing complaints about a flowsheet that\'s not calculating fluid balance correctly. A physician who can\'t find the new sepsis order set we deployed last week. A request from quality to add a new documentation element for a CMS measure that takes effect next quarter.'),
      block('The fluid balance issue is a configuration error — someone mapped the wrong field to the output column during last week\'s update. Twenty-minute fix, but it\'s been wrong for three days and nobody caught it until night shift noticed their numbers didn\'t make sense. I make a mental note to add this to our post-deployment validation checklist.'),
      block('9:00 AM — Workflow Committee', 'h2'),
      block('An hour-long meeting with nursing leadership about redesigning the admission assessment. The current assessment takes 45 minutes to complete. Nursing wants it under 20. The quality team wants to add three new screening questions. The compliance officer needs the falls risk assessment to remain exactly where it is.'),
      block('My job here is to find a solution that satisfies everyone — or, more realistically, a compromise that everyone can live with. I propose breaking the assessment into a core set that\'s mandatory at admission and a secondary set that can be completed within four hours. It\'s not perfect, but it cuts the initial time to 18 minutes and preserves all the required elements.'),
      block('11:00 AM — Build and Configuration', 'h2'),
      block('This is the hands-on part. I\'m building a new order set for the orthopedic service. The surgeon wants one-click ordering for his total knee pathway. I want evidence-based defaults that reduce variation. We negotiate via email while I configure in the test environment.'),
      block('Building an order set sounds simple. It\'s not. Every order has downstream implications: medication orders trigger pharmacy review, lab orders hit the lab queue, nursing orders generate documentation requirements. A badly built order set creates work for everyone. A well-built one is invisible — it just works.'),
      block('1:00 PM — End-User Support', 'h2'),
      block('I spend an hour on the surgical unit helping a new physician assistant navigate the system. She\'s struggling with the procedure note template. The template is fine — the problem is that nobody showed her the shortcut that pre-populates patient data. Ten minutes of at-the-elbow training solves a problem she\'s been working around for two weeks.'),
      block('This is the part of my job that doesn\'t scale but matters most. One-on-one time with clinicians catches problems that would never make it into a ticket. She also mentions that the post-op order set defaults to the wrong antibiotic for their patient population. That\'s a real catch — and it came from a casual conversation, not a formal feedback channel.'),
      block('3:00 PM — Data and Reporting', 'h2'),
      block('The quality team needs data for a hand hygiene initiative. The data exists, but it\'s in three different systems and none of them agree. I spend an hour writing a query, reconciling the differences, and building a dashboard that updates automatically. This isn\'t glamorous work, but it\'s how evidence-based practice actually happens — someone has to turn raw data into information that drives decisions.'),
      block('4:30 PM — Planning for Tomorrow', 'h2'),
      block('Tomorrow we\'re deploying a new medication reconciliation workflow. I review the go-live plan, check that the training materials are current, and send a final reminder to the pharmacy liaisons who\'ll be on the floors for support.'),
      block('The Invisible Work', 'h2'),
      block('Most of what I do is invisible when it\'s working. Nobody notices that the order set flows correctly, that the dashboard updates on time, or that the flowsheet calculates accurately. They notice when it doesn\'t. That\'s the nature of informatics — success is silence.'),
      block('But between the silence, there\'s a constant effort to make systems work the way clinicians think, not the way programmers designed them. That translation work — from clinical need to technical reality — is what clinical informatics is.'),
    ],
  },

  // ── Article 8 ──────────────────────────────────────────────────────────
  {
    _id: 'article-sepsis-cds-saved-lives',
    title: 'How We Reduced Sepsis Mortality by 18% With Better Clinical Decision Support',
    slug: 'reduced-sepsis-mortality-clinical-decision-support',
    author: { _type: 'reference', _ref: 'author-sarah-chen' },
    category: { _type: 'reference', _ref: 'cat-patient-safety' },
    tags: ['sepsis', 'clinical decision support', 'quality improvement', 'outcomes'],
    publishedAt: daysAgo(17),
    excerpt: 'Our hospital built a sepsis screening tool that actually changed outcomes — not by adding more alerts, but by embedding intelligence into the workflow nurses were already using.',
    body: [
      block('Two years ago, our sepsis mortality rate was above the national benchmark. Leadership wanted an improvement initiative. The IT team wanted to build an alert. I wanted to try something different.'),
      block('The standard approach to sepsis detection in EHR systems is an alert that fires when certain criteria are met — temperature, heart rate, white blood cell count, suspected infection. The problem is that by the time all the criteria are met and the alert fires, the bedside nurse often already knows something is wrong. The alert confirms what they\'ve already recognized. What nurses needed wasn\'t a late confirmation — it was earlier pattern recognition support.'),
      block('Designing for the Workflow', 'h2'),
      block('Instead of building another pop-up alert, we embedded sepsis risk information directly into the nursing assessment flowsheet. When a nurse documents vital signs and assessment findings, the system calculates a running SIRS score and a modified qSOFA score in real time, visible right next to the vital signs display.'),
      block('No pop-up. No interruption. Just a quiet indicator that turns yellow or red as the patient\'s clinical picture evolves. The nurse sees it in context, during the work they\'re already doing.'),
      block('We added one more element: when the indicator turns red, a single button appears: "Initiate Sepsis Bundle." One click opens a pre-built order set with the SEP-1 bundle components — blood cultures, lactate, IV fluids, and antibiotics — ready for the physician to review and sign.'),
      block('What Changed', 'h2'),
      block('We measured outcomes for 12 months after deployment, compared to the 12 months prior:'),
      listItem('Time from first abnormal vital signs to first antibiotic decreased from 4.2 hours to 2.1 hours'),
      listItem('SEP-1 bundle compliance improved from 61% to 89%'),
      listItem('Sepsis mortality decreased by 18% (from 22.4% to 18.3%)'),
      listItem('False positive rate was 12% — significantly lower than the previous pop-up alert system, which had a 34% false positive rate'),
      block('We didn\'t achieve these results by being more aggressive with alerts. We achieved them by making the right action easy at the right time.'),
      block('Why This Approach Worked', 'h2'),
      block('Three principles drove the design:'),
      blockWithMarks([
        { text: 'Ambient, not interruptive. ', bold: true },
        { text: 'The information was always visible but never demanded attention. This avoided alert fatigue while keeping sepsis risk in the nurse\'s peripheral awareness.' },
      ]),
      blockWithMarks([
        { text: 'Workflow-integrated, not bolt-on. ', bold: true },
        { text: 'We didn\'t create a new screen or a new process. We enhanced the screen the nurse was already using. Zero additional clicks for awareness; one click for action.' },
      ]),
      blockWithMarks([
        { text: 'Actionable, not just informational. ', bold: true },
        { text: 'The "Initiate Sepsis Bundle" button removed the cognitive overhead of remembering which orders to place. The nurse identifies the problem; the system makes the response frictionless.' },
      ]),
      block('Lessons for Other CDS Projects', 'h2'),
      block('The sepsis project taught us a framework we now apply to all CDS design: embed intelligence where clinicians already work, make the right action the easiest action, and measure outcomes — not just alert acceptance rates.'),
      block('Most CDS projects measure whether clinicians interact with the alert. We measured whether patients lived. That\'s the standard every CDS initiative should be held to.'),
    ],
  },

  // ── Article 9 ──────────────────────────────────────────────────────────
  {
    _id: 'article-medication-safety-informatics',
    title: 'The Five Medication Safety Gaps Your EHR Isn\'t Catching',
    slug: 'five-medication-safety-gaps-ehr-missing',
    author: { _type: 'reference', _ref: 'author-maria-santos' },
    category: { _type: 'reference', _ref: 'cat-patient-safety' },
    tags: ['medication safety', 'CPOE', 'pharmacy informatics', 'adverse drug events'],
    publishedAt: daysAgo(20),
    excerpt: 'CPOE systems catch the obvious interactions. But the most dangerous medication errors happen in the gaps between what the system checks and what it doesn\'t.',
    body: [
      block('Computerized provider order entry (CPOE) has been one of the most significant patient safety advances in modern healthcare. The ability to automatically check drug-drug interactions, verify dosing ranges, and flag allergies has prevented countless adverse drug events.'),
      block('But after eight years of building and maintaining our hospital\'s medication safety systems, I can tell you that the most dangerous errors aren\'t the ones CPOE catches. They\'re the ones that slip through the gaps.'),
      block('Gap 1: Weight-Based Dosing Without a Current Weight', 'h2'),
      block('Many critical medications — anticoagulants, chemotherapy agents, certain antibiotics — require weight-based dosing. Your EHR calculates these doses using the weight in the system. But how old is that weight?'),
      block('In our audit, 23% of patients on weight-based medications had a weight that was more than 7 days old. For patients in the ICU with fluid shifts, a weight recorded at admission might be 5-10 kg off by day three. That\'s not a rounding error — for a drug like heparin, that\'s the difference between therapeutic and dangerous.'),
      block('Gap 2: Renal Dose Adjustment Timing', 'h2'),
      block('Most EHRs check renal function at the time of ordering. But kidney function changes. A patient who had normal renal function when vancomycin was ordered on Monday might have a creatinine of 3.2 by Wednesday.'),
      block('Unless your system has real-time surveillance that re-evaluates active medication orders against changing lab values, that patient is receiving a dose that\'s now too high for their renal function. Many systems don\'t do this, or do it with a significant delay.'),
      block('Gap 3: The Transition of Care Blind Spot', 'h2'),
      block('When a patient transfers from the ICU to a step-down unit, their medication orders are often rewritten. This is one of the highest-risk moments in a hospitalization. Medications get duplicated, doses change inadvertently, and "continue home medications" is interpreted differently by every provider.'),
      block('CPOE checks the new orders against each other — but it doesn\'t compare them against what was working in the ICU. That comparison is left to the pharmacist and the receiving nurse, usually under time pressure with incomplete information.'),
      block('Gap 4: PRN Medication Accumulation', 'h2'),
      block('A patient has PRN orders for acetaminophen 650mg, oxycodone/acetaminophen 5/325mg, and a headache PRN that includes Excedrin. Each order is safe individually. But a nurse giving all three in a shift could exceed 4 grams of total acetaminophen — the hepatotoxicity threshold.'),
      block('Most CPOE systems check individual orders at the time they\'re placed. Very few track cumulative doses of component drugs across multiple PRN administrations in real time.'),
      block('Gap 5: Look-Alike, Sound-Alike Drugs', 'h2'),
      block('HYDROmorphone and morphine. DOBUTamine and DOPamine. Hydroxyzine and hydralazine. CPOE systems use tall-man lettering and name differentiation, but the errors still happen — especially during verbal orders, telephone orders, and override situations at automated dispensing cabinets.'),
      block('The gap isn\'t in the ordering system. It\'s at the point of administration, where the nurse is selecting from a list in the dispensing cabinet under time pressure. Better interoperability between the EHR and the dispensing system — showing the indication alongside the drug name — could close this gap.'),
      block('Closing the Gaps', 'h2'),
      block('None of these are unsolvable problems. Real-time weight tracking, continuous renal dose surveillance, transition-of-care reconciliation workflows, cumulative dose calculators, and smart dispensing integration all exist in some form. But they\'re not standard, and they\'re not configured at most hospitals.'),
      block('The next frontier of medication safety isn\'t catching what we already know how to catch. It\'s closing the gaps between the point of ordering and the point of administration — because that\'s where the preventable harm still lives.'),
    ],
  },

  // ── Article 10 ─────────────────────────────────────────────────────────
  {
    _id: 'article-informatics-governance',
    title: 'Why Your Informatics Governance Structure Matters More Than Your EHR Vendor',
    slug: 'informatics-governance-matters-more-than-ehr-vendor',
    author: { _type: 'reference', _ref: 'author-rachel-thompson' },
    category: { _type: 'reference', _ref: 'cat-clinical-informatics' },
    tags: ['governance', 'informatics leadership', 'EHR optimization', 'organizational structure'],
    publishedAt: daysAgo(23),
    excerpt: 'Hospitals spend millions choosing the right EHR. Then they let anyone with a login request changes with no clinical oversight. A governance leader explains why the decision-making structure matters more than the software.',
    body: [
      block('I\'ve worked with five different EHR systems across four health systems. The best clinical experience I\'ve seen was at a community hospital running a mid-tier EHR with excellent governance. The worst was at an academic medical center running a top-tier EHR with no governance at all.'),
      block('The software matters. But the decision-making structure around the software matters more.'),
      block('What Informatics Governance Actually Means', 'h2'),
      block('Governance is who gets to decide what. In clinical informatics, that means: who approves new order sets? Who decides when to add a documentation element? Who prioritizes the build queue? Who can request a change to a clinical workflow, and who reviews that change before it goes live?'),
      block('At many hospitals, the answer to all of these questions is "whoever asks the loudest" or "whoever has the most administrative authority." That\'s not governance — that\'s chaos with hierarchy.'),
      block('The Three Problems Bad Governance Creates', 'h2'),
      blockWithMarks([
        { text: 'Configuration bloat. ', bold: true },
        { text: 'Without governance, every department, every physician, and every compliance initiative adds documentation elements, alerts, and order sets. Nothing ever gets removed. Over time, the system accumulates cruft that slows everyone down. I\'ve seen EHR instances with over 800 active order sets, fewer than 200 of which were used in the past year.' },
      ]),
      blockWithMarks([
        { text: 'Inconsistent clinical practice. ', bold: true },
        { text: 'When individual departments can configure their own workflows without oversight, you get five different ways to document a fall risk assessment across five units. That\'s not just inefficient — it\'s a patient safety issue when a nurse floats to an unfamiliar unit.' },
      ]),
      blockWithMarks([
        { text: 'Build team burnout. ', bold: true },
        { text: 'Without governance to triage and prioritize requests, the informatics build team is pulled in every direction. Everything is urgent. Nothing is strategic. The best analysts leave for organizations that have their act together.' },
      ]),
      block('What Good Governance Looks Like', 'h2'),
      block('The structure doesn\'t need to be complicated. At my health system, we have:'),
      listItem('A clinical informatics steering committee that meets monthly to review and prioritize requests. Chaired by the CMIO, with representation from nursing, pharmacy, and key specialty departments.'),
      listItem('A clinical review requirement for every configuration change that affects clinical workflows. No change goes live without sign-off from a clinician who understands the downstream impact.'),
      listItem('A standardization policy that requires enterprise-wide solutions for enterprise-wide problems. One falls risk assessment. One sepsis screening tool. One medication reconciliation workflow. Departments can request variations, but the burden of justification is on them.'),
      listItem('A regular sunset review that examines order sets, alerts, and documentation elements for usage. If it hasn\'t been used in 12 months, it goes to committee for retirement.'),
      block('Getting Started', 'h2'),
      block('If your organization doesn\'t have informatics governance, start small. You don\'t need a committee — you need a gatekeeper. One clinical informaticist who reviews every build request before it enters the queue and asks: Is this clinically necessary? Is there already something that does this? Will this create work for other departments?'),
      block('That single checkpoint will transform how your EHR evolves. Because the most expensive EHR problem isn\'t the wrong software — it\'s the right software managed poorly.'),
    ],
  },

  // ── Article 11 ─────────────────────────────────────────────────────────
  {
    _id: 'article-cphims-certification',
    title: 'Is the CPHIMS Certification Worth It? An Honest Assessment',
    slug: 'cphims-certification-worth-it-honest-assessment',
    author: { _type: 'reference', _ref: 'author-david-kim' },
    category: { _type: 'reference', _ref: 'cat-career-transitions' },
    tags: ['CPHIMS', 'certifications', 'health IT careers', 'professional development'],
    publishedAt: daysAgo(26),
    excerpt: 'I got my CPHIMS two years into my health IT career. Here\'s what it actually did for me — and what it didn\'t — so you can decide if it\'s worth your time and money.',
    body: [
      block('The Certified Professional in Healthcare Information and Management Systems (CPHIMS) credential is one of the most recognized certifications in health IT. HIMSS administers it, and you\'ll see it on LinkedIn profiles across the industry. But is it worth the study time, the exam fee, and the maintenance requirements?'),
      block('I passed my CPHIMS exam two years into my transition from nursing to health IT. Here\'s my honest take.'),
      block('What CPHIMS Covers', 'h2'),
      block('The exam covers a broad range of health IT topics: organizational management, technology environment, clinical informatics concepts, systems analysis, and IT project management. It\'s a generalist credential — think of it as proof that you understand the landscape of health IT, not that you\'re an expert in any one area.'),
      block('The study material gave me useful vocabulary and frameworks. Before studying for CPHIMS, I could troubleshoot an order set but couldn\'t articulate why governance structures matter. The certification gave me a higher-level view of the field.'),
      block('What It Actually Did for My Career', 'h2'),
      listItem('Resume differentiator: In my first job search after certification, two of three interviews specifically mentioned CPHIMS as a reason they selected my resume. For a career changer with a nursing background and limited IT tenure, it signaled seriousness.'),
      listItem('Salary impact: Minimal. I didn\'t receive a raise for getting certified, and my next role\'s salary negotiation was based on experience, not credentials. HIMSS surveys suggest a modest salary premium, but my anecdotal experience doesn\'t support that.'),
      listItem('Knowledge value: Moderate. The study process forced me to learn areas I\'d been ignoring — particularly around IT governance, project management, and security. That broader perspective has been useful.'),
      listItem('Professional network: HIMSS membership (required for the credential) gave me access to local chapter events and the annual conference. The networking was genuinely valuable — more valuable than the certification itself, honestly.'),
      block('Who Should Get It', 'h2'),
      block('CPHIMS makes the most sense for:'),
      listItem('Clinical professionals transitioning into health IT who need to establish credibility quickly'),
      listItem('Early-career health IT professionals who want to demonstrate breadth of knowledge'),
      listItem('People targeting management roles where the generalist perspective is valued'),
      block('Who can probably skip it:'),
      listItem('Experienced health IT professionals with strong track records — your work speaks louder'),
      listItem('People in highly specialized roles (security, data engineering, development) where domain-specific certifications matter more'),
      listItem('Anyone expecting a significant salary bump — the ROI is in career positioning, not immediate compensation'),
      block('My Recommendation', 'h2'),
      block('If you\'re early in your health IT career or making a clinical-to-IT transition, CPHIMS is worth considering as a structured learning experience and a resume signal. Don\'t expect it to open doors on its own — but paired with clinical experience and demonstrable IT skills, it tells hiring managers you\'re invested in the field.'),
      block('Study for the knowledge. Take the exam for the credential. But invest your real energy in building things, solving problems, and developing relationships. That\'s what actually advances a health IT career.'),
    ],
  },

  // ── Article 12 ─────────────────────────────────────────────────────────
  {
    _id: 'article-telehealth-workflow-lessons',
    title: 'What Telehealth Got Right — and What We Need to Fix Before It\'s Permanent',
    slug: 'telehealth-workflow-lessons-learned',
    author: { _type: 'reference', _ref: 'author-james-okonkwo' },
    category: { _type: 'reference', _ref: 'cat-ehr-workflows' },
    tags: ['telehealth', 'virtual care', 'workflow design', 'patient access'],
    publishedAt: daysAgo(29),
    excerpt: 'Telehealth went from novelty to necessity overnight. Now that it\'s a permanent part of care delivery, it\'s time to fix the workflows we duct-taped together.',
    body: [
      block('In early 2020, my hospital went from 12 telehealth visits per month to 1,200 per week. We didn\'t have time to design workflows — we improvised them. Now, years later, many of those improvised workflows are still in place, held together by workarounds and tribal knowledge.'),
      block('Telehealth is here to stay. It\'s time to build it right.'),
      block('What We Got Right', 'h2'),
      block('Credit where it\'s due — the rapid telehealth expansion proved several things:'),
      listItem('Patients want it. Satisfaction scores for telehealth visits consistently match or exceed in-person visits for appropriate use cases. Patients appreciate not taking a half-day off work for a 15-minute follow-up.'),
      listItem('Clinical quality holds up. For chronic disease management, post-operative follow-ups, behavioral health, and medication management, the clinical evidence supports telehealth as equivalent to in-person care.'),
      listItem('Access improved. Patients in rural areas, patients with mobility limitations, and patients with transportation barriers got access to specialists they couldn\'t reach before.'),
      block('What Needs Fixing', 'h2'),
      block('The problems are mostly operational and technical, not clinical:'),
      blockWithMarks([
        { text: 'The EHR workflow is fragmented. ', bold: true },
        { text: 'In most systems, telehealth visits use the same encounter type and documentation templates as in-person visits. But the workflow is fundamentally different. You can\'t do a hands-on physical exam. You need to document what you observed versus what you couldn\'t assess. The vital signs may come from a patient-reported source rather than a calibrated clinical device. Current templates don\'t accommodate these differences.' },
      ]),
      blockWithMarks([
        { text: 'Scheduling is a mess. ', bold: true },
        { text: 'Many practices still use the same scheduling templates for telehealth and in-person visits. But visit durations are different, room requirements are different, and the staff support model is different. A dedicated telehealth scheduling template with appropriate time blocks, buffer time for technical issues, and different check-in workflows would solve problems that practices are currently handling manually.' },
      ]),
      blockWithMarks([
        { text: 'The patient technology gap. ', bold: true },
        { text: 'We assumed everyone has a smartphone with a camera and reliable internet. They don\'t. Approximately 20% of our patient population struggles with the technology. We need permanent solutions: tech support hotlines, library and community center telehealth stations, and simplified interfaces for older adults.' },
      ]),
      blockWithMarks([
        { text: 'Clinical triage for visit type. ', bold: true },
        { text: 'Which visits should be telehealth and which should be in-person? Most practices leave this to the patient\'s preference or the scheduler\'s judgment. We need clinical criteria — developed by clinicians, not administrators — for when virtual care is appropriate and when it\'s not.' },
      ]),
      block('Building Sustainable Telehealth Workflows', 'h2'),
      block('The organizations doing telehealth well share a few characteristics:'),
      listItem('Dedicated telehealth encounter types in the EHR with appropriate documentation templates'),
      listItem('Clinical triage protocols that match the visit type to the clinical need'),
      listItem('Technology support as a staffed function, not an afterthought'),
      listItem('Quality metrics specific to virtual care — not just "did the visit happen" but "was the clinical outcome equivalent"'),
      block('We have an opportunity to design telehealth workflows intentionally rather than accepting the emergency-era improvisations as permanent. The technology works. The clinical evidence supports it. What we need now is the operational rigor to make it sustainable.'),
    ],
  },
]

// ─── Execution ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding Sanity content...\n')

  // Create authors
  for (const a of authors) {
    console.log(`  Author: ${a.name}`)
    await client.createOrReplace({
      _type: 'author',
      _id: a._id,
      name: a.name,
      credential: a.credential,
      bio: a.bio,
      slug: { _type: 'slug', current: a.slug },
    })
  }

  // Create categories
  for (const c of categories) {
    console.log(`  Category: ${c.title}`)
    await client.createOrReplace({
      _type: 'category',
      _id: c._id,
      title: c.title,
      slug: { _type: 'slug', current: c.slug },
      description: c.description,
    })
  }

  // Create articles
  for (const a of articles) {
    console.log(`  Article: ${a.title}`)
    await client.createOrReplace({
      _type: 'article',
      _id: a._id,
      title: a.title,
      slug: { _type: 'slug', current: a.slug },
      author: a.author,
      category: a.category,
      tags: a.tags,
      publishedAt: a.publishedAt,
      excerpt: a.excerpt,
      body: a.body,
    })
  }

  console.log(`\nDone! Created ${authors.length} authors, ${categories.length} categories, and ${articles.length} articles.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
