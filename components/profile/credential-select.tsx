'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VALID_CREDENTIALS } from '@/lib/profile/types'

interface CredentialSelectProps {
  name: string
  defaultValue?: string | null
  onValueChange?: (value: string) => void
}

export function CredentialSelect({ name, defaultValue, onValueChange }: CredentialSelectProps) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue ?? undefined}
      onValueChange={onValueChange ? (value) => { if (value) onValueChange(value) } : undefined}
    >
      <SelectTrigger id="credential-select" className="min-h-[44px]">
        <SelectValue placeholder="Select your credential" />
      </SelectTrigger>
      <SelectContent>
        {VALID_CREDENTIALS.map((cred) => (
          <SelectItem key={cred} value={cred}>
            {cred}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
