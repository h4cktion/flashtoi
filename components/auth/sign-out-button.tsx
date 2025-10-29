'use client'

import { signOut } from 'next-auth/react'

interface SignOutButtonProps {
  variant?: 'default' | 'compact'
}

export function SignOutButton({ variant = 'default' }: SignOutButtonProps) {
  if (variant === 'compact') {
    return (
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Déconnexion
      </button>
    )
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Déconnexion
    </button>
  )
}
