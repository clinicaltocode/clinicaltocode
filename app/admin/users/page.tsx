import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { banUser, unbanUser } from '@/lib/moderation/actions'

export const metadata = { title: 'Users | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('user_profiles')
    .select('id, username, credential_badge, is_banned, created_at')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('username', `%${q}%`)
  }

  const { data: users } = await query

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <form method="GET" action="/admin/users" className="mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by username…"
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>

      {!users || users.length === 0 ? (
        <p className="text-muted-foreground py-8">No users found matching your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Username</th>
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Credential</th>
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Joined</th>
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Status</th>
                <th scope="col" className="text-left py-3 font-semibold text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium">{user.username}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{user.credential_badge ?? '—'}</td>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={user.is_banned ? 'destructive' : 'default'}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {user.is_banned ? (
                      <form action={unbanUser.bind(null, user.id)}>
                        <Button type="submit" size="sm" variant="outline" className="min-h-[44px]">
                          Unban
                        </Button>
                      </form>
                    ) : (
                      <form action={banUser.bind(null, user.id)}>
                        <Button type="submit" size="sm" variant="destructive" className="min-h-[44px] opacity-80">
                          Ban User
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
