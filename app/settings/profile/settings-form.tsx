'use client'

import { useActionState, useState } from 'react'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { CredentialSelect } from '@/components/profile/credential-select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/lib/profile/actions'
import { cn } from '@/lib/utils'

const MAX_BIO = 280
const BIO_WARN = 250

interface SettingsFormProfile {
  id: string
  username: string
  bio: string | null
  credential_badge: string | null
  avatar_url: string | null
}

interface SettingsFormProps {
  profile: SettingsFormProfile
}

type FormState = { success: boolean; error: string | null }

async function updateProfileAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await updateProfile(formData)
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to save. Try again.' }
  }
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [state, action, isPending] = useActionState(updateProfileAction, {
    success: false,
    error: null,
  })
  const [bioLength, setBioLength] = useState(profile.bio?.length ?? 0)

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Avatar section */}
      <section>
        <h2 className="text-sm font-medium mb-3">Profile photo</h2>
        <AvatarUpload
          userId={profile.id}
          username={profile.username}
          currentUrl={profile.avatar_url}
        />
      </section>

      {/* Credential badge section */}
      <section>
        <label
          htmlFor="credential-select"
          className="block text-sm font-medium mb-1"
        >
          Your professional credential
        </label>
        <CredentialSelect name="credential_badge" defaultValue={profile.credential_badge} />
        <p className="text-sm text-muted-foreground mt-1">
          Displayed next to your name on forum posts.
        </p>
      </section>

      {/* Bio section */}
      <section>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          About you
        </label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ''}
          maxLength={MAX_BIO + 1}
          rows={4}
          className="resize-none"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBioLength(e.target.value.length)}
          aria-describedby="bio-count"
        />
        <p
          id="bio-count"
          className={cn(
            'text-xs mt-1',
            bioLength >= MAX_BIO + 1
              ? 'text-destructive'
              : bioLength >= BIO_WARN
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          {bioLength} / {MAX_BIO}
        </p>
      </section>

      {/* Feedback */}
      {state.success && (
        <p className="text-sm text-primary">Profile updated.</p>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      {/* Save */}
      <Button
        type="submit"
        disabled={isPending || bioLength > MAX_BIO}
        className="min-h-[44px] w-full sm:w-40"
      >
        {isPending ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
