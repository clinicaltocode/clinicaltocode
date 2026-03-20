import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service'

const secret = process.env.SANITY_WEBHOOK_SECRET!

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SanityArticlePayload {
  _id:        string
  _type:      string
  title?:     string
  slug?:      { current: string }
  excerpt?:   string
  category?:  { _ref: string; _type: 'reference' }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // 1. Read raw body as text — MUST happen before any parsing.
  //    In App Router Route Handlers, calling request.text() once reads the
  //    full body stream. Do not call request.json() afterwards.
  const rawBody = await request.text()

  // 2. Verify Sanity webhook signature
  const signature = request.headers.get(SIGNATURE_HEADER_NAME) ?? ''
  const valid = await isValidSignature(rawBody, signature, secret)

  if (!valid) {
    console.error('[sanity/revalidate] Invalid webhook signature')
    return Response.json({ message: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse payload
  const payload = JSON.parse(rawBody) as SanityArticlePayload

  if (payload._type !== 'article') {
    return Response.json({ message: 'Not an article — skipped' }, { status: 200 })
  }

  // 4. Revalidate Data Cache tags
  //    'article'            — busts the index page query cache
  //    'article:<slug>'     — busts this specific detail page query cache
  revalidateTag('article')
  if (payload.slug?.current) {
    revalidateTag(`article:${payload.slug.current}`)
  }

  // 5. Create forum thread (CONT-04 — idempotent)
  await createForumThreadForArticle(payload)

  return Response.json({ revalidated: true, now: Date.now() })
}

// ---------------------------------------------------------------------------
// CONT-04 — Auto forum thread creation
// ---------------------------------------------------------------------------
async function createForumThreadForArticle(payload: SanityArticlePayload) {
  // Idempotency check: skip if a thread already exists for this Sanity document.
  // article_sanity_id stores the Sanity _id (not slug) because _id is immutable.
  const { data: existing } = await supabaseAdmin
    .from('forum_threads')
    .select('id')
    .eq('article_sanity_id', payload._id)
    .maybeSingle()

  if (existing) {
    console.log(`[sanity/revalidate] Thread already exists for ${payload._id} — skipped`)
    return
  }

  // Resolve the Postgres category_id from the Sanity category _ref
  let categoryId: string | null = null
  if (payload.category?._ref) {
    const { data: cat } = await supabaseAdmin
      .from('forum_categories')
      .select('id')
      .eq('sanity_category_id', payload.category._ref)
      .maybeSingle()
    categoryId = cat?.id ?? null
  }

  const { error } = await supabaseAdmin.from('forum_threads').insert({
    title:             payload.title ?? 'Untitled article',
    slug:              payload.slug?.current ?? payload._id,
    body_preview:      payload.excerpt?.slice(0, 200) ?? null,
    article_sanity_id: payload._id,
    category_id:       categoryId,
    is_article_thread: true,
    author_id:         null,   // service insert; no user session in Phase 3
  })

  if (error) {
    console.error('[sanity/revalidate] Failed to create forum thread:', error.message)
    // Do not throw — revalidation already succeeded; thread failure is non-blocking
  } else {
    console.log(`[sanity/revalidate] Forum thread created for article ${payload._id}`)
  }
}
