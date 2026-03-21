import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CredentialBadgeProps {
  credential: string | null
  className?: string
}

export function CredentialBadge({ credential, className }: CredentialBadgeProps) {
  if (!credential) return null

  return (
    <Badge
      variant="outline"
      className={cn('border-primary text-primary text-xs font-semibold', className)}
    >
      {credential}
    </Badge>
  )
}
