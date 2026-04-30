import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

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

const imageMap = {
  // ── Seed content articles (12) ─────────────────────────────────────────
  'alert-fatigue-patient-safety-crisis': {
    url: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1200&h=800&fit=crop',
    alt: 'Hospital monitor displaying multiple clinical alerts and notifications',
  },
  'nurse-guide-breaking-into-health-it': {
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=800&fit=crop',
    alt: 'Healthcare professional working at a modern computer workstation',
  },
  'ehr-implementation-mistakes-everyone-makes': {
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop',
    alt: 'Medical team reviewing digital health records on a large screen',
  },
  'fhir-explained-clinicians-interoperability': {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=800&fit=crop',
    alt: 'Connected network of servers representing health data exchange',
  },
  'ai-generated-clinical-notes-promise-peril': {
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop',
    alt: 'Artificial intelligence interface overlaid on a clinical setting',
  },
  'nursing-documentation-burden-driving-nurses-out': {
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop',
    alt: 'Nurse documenting patient information at a bedside computer terminal',
  },
  'what-clinical-informaticist-does-all-day': {
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop',
    alt: 'Professional working with data and clinical systems on multiple screens',
  },
  'reduced-sepsis-mortality-clinical-decision-support': {
    url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=800&fit=crop',
    alt: 'Intensive care unit with patient monitoring equipment and vital sign displays',
  },
  'five-medication-safety-gaps-ehr-missing': {
    url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&h=800&fit=crop',
    alt: 'Pharmacist reviewing medication orders on a digital system',
  },
  'informatics-governance-matters-more-than-ehr-vendor': {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop',
    alt: 'Healthcare leadership team meeting around a conference table',
  },
  'cphims-certification-worth-it-honest-assessment': {
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop',
    alt: 'Professional studying health informatics materials at a desk',
  },
  'telehealth-workflow-lessons-learned': {
    url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200&h=800&fit=crop',
    alt: 'Doctor conducting a telehealth video consultation with a patient',
  },

  // ── Older seed articles ────────────────────────────────────────────────
  'nurses-guide-ai-clinical-documentation': {
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop',
    alt: 'Nurse working at a computer station in a modern hospital',
  },
  'chatgpt-pharmacy-clinical-pharmacists': {
    url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=800&fit=crop',
    alt: 'Pharmacist reviewing medication information on a digital screen',
  },
  'clinicians-break-into-health-it': {
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=800&fit=crop',
    alt: 'Clinician transitioning from bedside care to a technology role',
  },
  'why-ehr-clicks-are-killing-clinician-morale': {
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=800&fit=crop',
    alt: 'Exhausted clinician at a computer workstation late at night',
  },
  'what-healthcare-it-leaders-get-wrong-about-clinical-adoption': {
    url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=800&fit=crop',
    alt: 'Healthcare IT team gathered around a whiteboard planning session',
  },
  'epic-vs-cerner-nurses-honest-comparison': {
    url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=800&fit=crop',
    alt: 'Nurse using an electronic health record system at a hospital station',
  },
}

async function addImages() {
  const articles = await client.fetch('*[_type == "article"]{_id, "slug": slug.current, coverImage}')
  let updated = 0
  let skipped = 0

  for (const article of articles) {
    const mapping = imageMap[article.slug]
    if (!mapping) {
      console.log(`  No image mapped for: ${article.slug}`)
      skipped++
      continue
    }

    if (article.coverImage?.asset) {
      console.log(`  Already has image: ${article.slug}`)
      skipped++
      continue
    }

    console.log(`  Uploading image for: ${article.slug}`)
    try {
      const res = await fetch(mapping.url)
      if (!res.ok) { console.log(`    Failed to fetch: ${res.status}`); continue }
      const buffer = Buffer.from(await res.arrayBuffer())

      const asset = await client.assets.upload('image', buffer, {
        filename: `${article.slug}.jpg`,
        contentType: 'image/jpeg',
      })

      await client.patch(article._id).set({
        coverImage: {
          _type: 'image',
          alt: mapping.alt,
          asset: { _type: 'reference', _ref: asset._id },
        },
      }).commit()

      console.log(`    Done: ${asset._id}`)
      updated++
    } catch (err) {
      console.log(`    Error: ${err.message}`)
    }
  }

  console.log(`\nFinished. Updated: ${updated}, Skipped: ${skipped}`)
}

addImages()
