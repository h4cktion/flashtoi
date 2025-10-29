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
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-4 mb-4 border-green-200/50">
      <h3 className="font-semibold text-green-800 mb-1">Ajouter un élève</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value)}
            placeholder="Code de connexion"
            className="flex-1 px-4 py-2 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700 bg-white placeholder:text-gray-400"
            disabled={isLoading}
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="flex-1 px-4 py-2 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-700 bg-white placeholder:text-gray-400"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r md:mt-0 mt-4 from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
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
