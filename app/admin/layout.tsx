import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Defense-in-depth: re-check is_admin in layout (beyond middleware)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex gap-8">
        {/* Left nav */}
        <nav className="w-48 shrink-0">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Admin
          </h2>
          <ul className="space-y-1">
            {[
              { href: '/admin', label: 'Dashboard' },
              { href: '/admin/reports', label: 'Reports' },
              { href: '/admin/users', label: 'Users' },
              { href: '/admin/content', label: 'Content' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
