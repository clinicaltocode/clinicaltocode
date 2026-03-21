'use client'

import { useState } from 'react'
import { Loader2, Upload, X, User } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { updateAvatarUrl, removeAvatar } from '@/lib/profile/actions'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

interface AvatarUploadProps {
  userId: string
  username: string
  currentUrl: string | null
}

export function AvatarUpload({ userId, username, currentUrl }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_SIZE_BYTES) {
      setError('Photo must be under 2MB.')
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP files are accepted.')
      return
    }

    setError(null)
    setUploading(true)

    // Fixed path — upsert replaces the existing object
    const path = `${userId}/avatar`
    const supabase = createClient()

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError('Upload failed. Try again.')
      setUploading(false)
      return
    }

    // Append timestamp for cache-busting since path is fixed
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    const versionedUrl = `${publicUrl}?t=${Date.now()}`

    await updateAvatarUrl(versionedUrl)
    setPreviewUrl(versionedUrl)
    setUploading(false)
    // Reset file input
    e.target.value = ''
  }

  async function handleRemove() {
    setRemoving(true)
    setError(null)
    const supabase = createClient()
    await supabase.storage.from('avatars').remove([`${userId}/avatar`])
    await removeAvatar()
    setPreviewUrl(null)
    setRemoving(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Avatar className="h-20 w-20">
        {previewUrl ? (
          <AvatarImage src={previewUrl} alt={`${username}'s profile photo`} />
        ) : null}
        <AvatarFallback>
          <User className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-2">
        <label
          htmlFor="avatar-file-input"
          aria-label="Upload profile photo"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'min-h-[44px] cursor-pointer',
            uploading && 'pointer-events-none opacity-50'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload new photo
            </>
          )}
        </label>
        <input
          id="avatar-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
          disabled={uploading}
          aria-label="Upload profile photo"
        />

        {previewUrl && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={removing}
            className="min-h-[44px]"
          >
            {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
            Remove photo
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
