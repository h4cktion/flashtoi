'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { authenticateWithQRCode, authenticateWithCredentials } from './actions'

export default function ParentLoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'qr' | 'credentials'>('qr')
  const [error, setError] = useState<string>('')

  // Form states
  const [qrCode, setQrCode] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [password, setPassword] = useState('')

  const handleQRLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const result = await authenticateWithQRCode(qrCode, password)

      if (result.success && result.data) {
        router.push(result.data.redirectUrl)
        router.refresh()
      } else {
        setError(result.error || 'Erreur d\'authentification')
      }
    })
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const result = await authenticateWithCredentials(loginCode, password)

      if (result.success && result.data) {
        router.push(result.data.redirectUrl)
        router.refresh()
      } else {
        setError(result.error || 'Erreur d\'authentification')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Espace Parents
            </h1>
            <p className="text-gray-600">
              Connectez-vous pour voir vos photos
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('qr')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                mode === 'qr'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              QR Code
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('credentials')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                mode === 'credentials'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Identifiants
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* QR Code Form */}
          {mode === 'qr' && (
            <form onSubmit={handleQRLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="qrCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Code QR
                </label>
                <input
                  id="qrCode"
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Entrez le code du QR"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isPending}
                />
              </div>

              <div>
                <label
                  htmlFor="qr-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe
                </label>
                <input
                  id="qr-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
              >
                {isPending ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          {/* Credentials Form */}
          {mode === 'credentials' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="loginCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Identifiant
                </label>
                <input
                  id="loginCode"
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="Votre identifiant"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isPending}
                />
              </div>

              <div>
                <label
                  htmlFor="credentials-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe
                </label>
                <input
                  id="credentials-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
              >
                {isPending ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Vous êtes un établissement ?{' '}
              <a
                href="/school/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Connectez-vous ici
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
