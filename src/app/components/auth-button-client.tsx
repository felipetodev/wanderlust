'use client'

import type { Session } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import UserNav from './user-nav'
import { Button } from './ui/button'

export function AuthButtonClient ({ session }: { session: Session | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: process.env.NODE_ENV === 'production'
          ? `${process.env.NEXT_PUBLIC_APP_HOST}/auth/callback`
          : 'http://localhost:3000/auth/callback'
      }
    })
  }

  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return <>
    {(session !== null)
      ? (
        <UserNav
          avatarUrl={session.user.user_metadata.avatar_url}
          email={session.user.email}
          handleSignOut={handleSignOut}
          username={session.user.user_metadata.user_name}
        />
        )
      : (
        <Button className='px-2 h-7 font-semibold' size='sm' onClick={handleSignIn}>
          Sign In
        </Button>
        )}
  </>
}
