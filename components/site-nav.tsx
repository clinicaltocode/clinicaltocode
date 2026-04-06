import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/auth/sign-out-button'

export async function SiteNav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] h-[72px] flex items-center"
    >
      <div className="mx-auto px-5 w-full flex items-center justify-between max-w-[1200px]">
        <Link href="/" className="font-semibold text-xl text-primary">
          Clinical to Code
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/articles"
            className="text-sm text-[#666666] hover:text-primary transition-colors min-h-[48px] flex items-center"
          >
            Articles
          </Link>
          <Link
            href="/forum"
            className="text-sm text-[#666666] hover:text-primary transition-colors min-h-[48px] flex items-center"
          >
            Forum
          </Link>
          {user ? (
            <>
              <Link
                href={`/profile/${encodeURIComponent(user.user_metadata?.username ?? user.id)}`}
                className="text-sm text-[#666666] hover:text-primary transition-colors min-h-[48px] flex items-center"
              >
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-[#666666] hover:text-primary transition-colors min-h-[48px] flex items-center"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
