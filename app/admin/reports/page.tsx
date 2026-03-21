import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { markReviewed, softDeleteContent, banUser } from '@/lib/moderation/actions'
import { formatRelativeTime } from '@/lib/forum/utils'

export const metadata = { title: 'Reports | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const showAll = filter === 'all'

  const supabase = await createClient()
  let query = supabase
    .from('content_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (!showAll) {
    query = query.eq('status', 'pending')
  }

  const { data: reports } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <a
          href={showAll ? '/admin/reports' : '/admin/reports?filter=all'}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAll ? 'Show Pending' : 'Show All'}
        </a>
      </div>

      {!reports || reports.length === 0 ? (
        <p className="text-muted-foreground py-8">
          {showAll
            ? 'No reports have been submitted yet.'
            : 'No pending reports. The queue is clear.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Target</th>
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Reason</th>
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Date</th>
                <th scope="col" className="text-left py-3 pr-4 font-semibold text-sm text-muted-foreground">Status</th>
                <th scope="col" className="text-left py-3 font-semibold text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs capitalize">{report.target_type}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{report.target_id.slice(0, 8)}…</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 max-w-[200px]">
                    <Badge variant="default" className="text-xs whitespace-normal">{report.reason}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">
                    {formatRelativeTime(report.created_at)}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={report.status === 'pending' ? 'default' : 'secondary'}>
                      {report.status === 'pending' ? 'Pending' : 'Reviewed'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {report.status === 'pending' && (
                        <form action={markReviewed.bind(null, report.id)}>
                          <Button type="submit" size="sm" className="min-h-[44px]">
                            Mark Reviewed
                          </Button>
                        </form>
                      )}
                      <form action={softDeleteContent.bind(null, report.target_type, report.target_id)}>
                        <Button type="submit" size="sm" variant="destructive" className="min-h-[44px] opacity-80">
                          Delete Content
                        </Button>
                      </form>
                      <form action={banUser.bind(null, report.reporter_id)}>
                        <Button type="submit" size="sm" variant="destructive" className="min-h-[44px] opacity-80">
                          Ban User
                        </Button>
                      </form>
                    </div>
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
