"use client";

import { useState } from "react";
import { updateSchoolRib } from "@/lib/actions/school";
import { useRouter } from "next/navigation";
import { IbanInput } from "@/components/ui/iban-input";

interface RibFormProps {
  schoolId: string;
  initialRib?: string;
}

export function RibForm({ schoolId, initialRib = "" }: RibFormProps) {
  const router = useRouter();
  const [rib, setRib] = useState(initialRib);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateSchoolRib(schoolId, rib);

      if (result.success) {
        setMessage({ type: "success", text: "RIB mis à jour avec succès" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Une erreur est survenue" });
      }
    } catch {
      setMessage({ type: "error", text: "Une erreur est survenue" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label htmlFor="rib" className="block text-sm font-medium text-gray-700 mb-1">
          RIB / IBAN
        </label>
        <IbanInput
          id="rib"
          value={rib}
          onChange={setRib}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Ces informations seront utilisées pour les virements bancaires.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer le RIB"}
      </button>
    </form>
  );
}
