"use client";

import { useState } from "react";
import { getStudentByLogin } from "@/lib/actions/student";
import { useStudentsStore } from "@/lib/stores/students-store";

export function AddStudentForm() {
  const [loginCode, setLoginCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addStudent = useStudentsStore((state) => state.addStudent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginCode.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);

    try {
      const result = await getStudentByLogin(loginCode.trim(), password.trim());

      if (!result.success || !result.data) {
        setError(result.error || "Identifiants incorrects");
        return;
      }

      const wasAdded = addStudent(result.data);

      if (!wasAdded) {
        setError("Cet élève est déjà ajouté");
        return;
      }

      setSuccess(
        `${result.data.firstName} ${result.data.lastName} ajouté avec succès`
      );
      setLoginCode("");
      setPassword("");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding student:", error);
      setError("Erreur lors de l&apos;ajout de l&apos;élève");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Ajouter un élève
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value)}
            placeholder="Code de connexion"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#192F84] focus:border-transparent text-slate-500"
            disabled={isLoading}
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#192F84] focus:border-transparent text-slate-500"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#192F84] hover:bg-[#1a3699] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Recherche..." : "Ajouter"}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {success && <p className="text-sm text-green-600">{success}</p>}
      </form>
    </div>
  );
}
