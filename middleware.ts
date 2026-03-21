import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add any code between createServerClient and
  // supabase.auth.getUser(). Even a simple conditional can break session
  // refresh and cause users to be randomly logged out.
  //
  // getUser() validates the JWT with the Supabase Auth server and writes
  // a refreshed token into supabaseResponse via the setAll cookie handler.
  // This is what makes AUTH-03 (persistent sessions) work.
  // Never use getSession() here — it reads from the cookie without
  // re-validating and cannot be trusted for security-critical checks.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes.
  // In Phase 2 only /profile/* is protected. /forum/* write routes
  // are added to this guard in Phase 4.
  if (
    !user &&
    (pathname.startsWith('/profile') ||
      pathname.startsWith('/forum/new') ||
      pathname.startsWith('/forum/bookmarks'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated but unverified users away from write routes.
  // email_confirmed_at is null until the user clicks the confirmation link.
  if (
    user &&
    !user.email_confirmed_at &&
    (pathname.startsWith('/profile') || pathname.startsWith('/forum/new'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/verify-email'
    return NextResponse.redirect(url)
  }

  // Redirect already-authenticated users away from login/signup.
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Always return supabaseResponse — not NextResponse.next().
  // Returning a new NextResponse.next() here discards the Set-Cookie headers
  // that carry the refreshed session token, silently logging the user out.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run middleware on all paths EXCEPT:
     * - _next/static  (compiled JS/CSS bundles)
     * - _next/image   (image optimization API)
     * - favicon.ico
     * - Static file extensions (svg, png, jpg, jpeg, gif, webp)
     *
     * Without this exclusion, getUser() would fire a Supabase Auth network
     * request for every CSS and image asset, adding unnecessary latency.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
