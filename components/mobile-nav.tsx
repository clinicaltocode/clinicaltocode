'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

interface MobileNavProps {
  isAuthenticated: boolean
  profileHref: string | null
}

export function MobileNav({ isAuthenticated, profileHref }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 -mr-2 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-[#e0dcd5] shadow-sm z-50">
          <div className="flex flex-col px-6 py-4 gap-1">
            <Link
              href="/articles"
              onClick={() => setOpen(false)}
              className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] py-2 transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/forum"
              onClick={() => setOpen(false)}
              className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] py-2 transition-colors"
            >
              Forum
            </Link>
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] py-2 transition-colors"
            >
              Search
            </Link>
            {isAuthenticated ? (
              <>
                {profileHref && (
                  <Link
                    href={profileHref}
                    onClick={() => setOpen(false)}
                    className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] py-2 transition-colors"
                  >
                    Profile
                  </Link>
                )}
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] py-2 transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-primary hover:text-primary-dark py-2 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
