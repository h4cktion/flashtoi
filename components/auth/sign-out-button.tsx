'use client'

import { signOut } from 'next-auth/react'
import { useStudentsStore } from '@/lib/stores/students-store'
import { useCartStore } from '@/lib/stores/cart-store'

interface SignOutButtonProps {
  variant?: 'default' | 'compact'
}

export function SignOutButton({ variant = 'default' }: SignOutButtonProps) {
  const clearStudents = useStudentsStore((state) => state.clearStudents)
  const clearCart = useCartStore((state) => state.clearCart)

  const handleSignOut = () => {
    // Vider les stores avant de déconnecter
    clearStudents()
    clearCart()

    // Déconnecter l'utilisateur
    signOut({ callbackUrl: '/' })
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleSignOut}
        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Déconnexion
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Déconnexion
    </button>
  )
}
