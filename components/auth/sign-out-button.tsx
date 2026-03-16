import { signOut } from '@/app/auth/actions'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-sm text-[#666666] hover:text-primary min-h-[48px]">
        Sign out
      </button>
    </form>
  )
}
