"use client";

import { useState } from "react";
import { ISchool } from "@/types";
import { updateSchoolDetails } from "@/lib/actions/school";

interface SchoolInfoCardProps {
  school: ISchool;
}

export function SchoolInfoCard({ school }: SchoolInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    address: school.address,
    phone: school.phone,
    email: school.email,
    closureDate: school.closureDate ? new Date(school.closureDate).toISOString().split('T')[0] : '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    const result = await updateSchoolDetails(
      typeof school._id === 'string' ? school._id : school._id.toString(),
      {
        ...formData,
        closureDate: formData.closureDate ? new Date(formData.closureDate) : undefined
      }
    );

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || "Erreur lors de la mise à jour");
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setFormData({
      address: school.address,
      phone: school.phone,
      email: school.email,
      closureDate: school.closureDate ? new Date(school.closureDate).toISOString().split('T')[0] : '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Informations de l&apos;établissement
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
            title="Modifier les informations"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code de connexion (Non modifiable)
            </label>
            <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 font-mono">
              {school.loginCode}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de clôture
            </label>
            <input
              type="date"
              value={formData.closureDate}
              onChange={(e) =>
                setFormData({ ...formData, closureDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Adresse</p>
            <p className="text-gray-900">{school.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Téléphone</p>
            <p className="text-gray-900">{school.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Code de connexion</p>
            <p className="text-gray-900 font-mono">{school.loginCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-gray-900">{school.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Date de clôture</p>
            <p className="text-gray-900">
              {school.closureDate
                ? new Date(school.closureDate).toLocaleDateString()
                : 'Non définie'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
