import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/auth/sign-out-button'

export async function SiteNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e0dcd5] h-16 flex items-center">
      <div className="mx-auto px-6 w-full flex items-center justify-between max-w-[1200px]">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#1a1a1a]">
          Clinical to Code
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/articles" className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            Articles
          </Link>
          <Link href="/forum" className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
            Forum
          </Link>
          {user ? (
            <>
              <Link
                href={`/profile/${encodeURIComponent(user.user_metadata?.username ?? user.id)}`}
                className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              >
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
