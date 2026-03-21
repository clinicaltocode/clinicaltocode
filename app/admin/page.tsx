import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Admin Dashboard | Clinical to Code' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [reportsResult, bansResult, usersResult] = await Promise.all([
    supabase
      .from('content_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_banned', true),
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true }),
  ])

  const pendingReports = reportsResult.count ?? 0
  const bannedUsers = bansResult.count ?? 0
  const totalUsers = usersResult.count ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="flex gap-4 mb-8">
        {[
          { label: 'Pending Reports', value: pendingReports, href: '/admin/reports' },
          { label: 'Banned Users', value: bannedUsers, href: '/admin/users' },
          { label: 'Total Users', value: totalUsers, href: '/admin/users' },
        ].map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="flex-1 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-[28px] font-semibold leading-tight">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
