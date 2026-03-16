import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

// This route handles the ?code=... query parameter that Supabase appends
// to email confirmation links. The flow is:
//   Email link → GET /auth/callback?code=xxxx
//   → exchangeCodeForSession(code) sets session cookie
//   → redirect to /auth/confirm
//
// PKCE is Supabase Auth's default for email confirmations. Do not pass
// flowType: 'implicit' to any Supabase client config — it will break this
// exchange.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Optional: support a ?next= param for post-auth redirects in future phases
  const next = searchParams.get('next') ?? '/auth/confirm'

  if (code) {
    // cookies() is async in Next.js 15 — must be awaited.
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session is now written into the response cookies.
      // Redirect to the confirmation landing page.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code or exchange failed — redirect back to login with an error flag.
  return NextResponse.redirect(
    `${origin}/auth/login?message=confirmation-error`
  )
}
