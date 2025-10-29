"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  authenticateWithCredentials,
  authenticateWithQRCodeAutoLogin,
} from "./actions";

function ParentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [isAutoLogging, setIsAutoLogging] = useState(false);

  // Form states
  const [loginCode, setLoginCode] = useState("");
  const [password, setPassword] = useState("");

  // Auto-login via URL params
  useEffect(() => {
    const autologin = searchParams.get("autologin");

    // Check for QR code auto-login
    const code = searchParams.get("code");
    if (autologin === "true" && code) {
      setIsAutoLogging(true);

      startTransition(async () => {
        const result = await authenticateWithQRCodeAutoLogin(code);

        if (result.success && result.data) {
          router.push(result.data.redirectUrl);
          router.refresh();
        } else {
          setIsAutoLogging(false);
          setError(result.error || "Échec de la connexion automatique");
        }
      });
      return;
    }

    // Check for legacy login/password auto-login
    const login = searchParams.get("login");
    const pwd = searchParams.get("password");
    if (autologin === "true" && login && pwd) {
      setIsAutoLogging(true);
      setLoginCode(login);
      setPassword(pwd);

      startTransition(async () => {
        const result = await authenticateWithCredentials(login, pwd);

        if (result.success && result.data) {
          router.push(result.data.redirectUrl);
          router.refresh();
        } else {
          setIsAutoLogging(false);
          setError(result.error || "Échec de la connexion automatique");
        }
      });
    }
  }, [searchParams, router, startTransition]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await authenticateWithCredentials(loginCode, password);

      if (result.success && result.data) {
        router.push(result.data.redirectUrl);
        router.refresh();
      } else {
        setError(result.error || "Erreur d'authentification");
      }
    });
  };

  // Show auto-login loader
  if (isAutoLogging) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
              <svg
                className="w-8 h-8 text-blue-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connexion en cours...
            </h2>
            <p className="text-gray-600">
              Authentification automatique via QR code
            </p>
          </div>
        </div>
      </div>
    );
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
            <p className="text-gray-600">Connectez-vous pour voir vos photos</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-5">
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
                className="text-slate-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isPending}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                className="text-slate-500  w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isPending}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isPending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Vous êtes un établissement ?{" "}
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
  );
}

export default function ParentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      }
    >
      <ParentLoginContent />
    </Suspense>
  );
}
