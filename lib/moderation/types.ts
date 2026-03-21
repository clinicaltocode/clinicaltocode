export const VALID_REPORT_REASONS = [
  'Patient data / PHI risk',
  'Misinformation',
  'Harassment',
  'Spam',
  'Off-topic for platform',
] as const

export type ReportReason = typeof VALID_REPORT_REASONS[number]

export type ReportStatus = 'pending' | 'reviewed'

export interface ContentReport {
  id: string
  reporter_id: string
  target_type: 'thread' | 'post'
  target_id: string
  reason: ReportReason
  details: string | null
  status: ReportStatus
  reviewed_at: string | null
  created_at: string
  // Joined fields for admin reports page
  reporter_username?: string | null
  target_title?: string | null
}
