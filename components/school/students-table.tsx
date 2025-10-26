"use client";

import { IStudent } from "@/types";
import Image from "next/image";
import { useState } from "react";

interface StudentsTableProps {
  students: IStudent[];
}

const STUDENTS_PER_PAGE = 10;

export function StudentsTable({ students }: StudentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les étudiants selon le terme de recherche
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(search) ||
      student.lastName.toLowerCase().includes(search) ||
      student.classId.toLowerCase().includes(search) ||
      student.loginCode.toLowerCase().includes(search)
    );
  });

  // Calculer la pagination sur les résultats filtrés
  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Fonctions de navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Réinitialiser la page lors d'une nouvelle recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Liste des étudiants
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredStudents.length}{" "}
            {searchTerm
              ? "résultat(s)"
              : `étudiant${students.length > 1 ? "s" : ""}`}{" "}
            {searchTerm && `sur ${students.length}`})
          </span>
        </h3>

        {totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom, classe ou code login..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Message si aucun résultat */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-gray-500">
            Aucun étudiant trouvé pour "{searchTerm}"
          </p>
          <button
            onClick={() => handleSearch("")}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Réinitialiser la recherche
          </button>
        </div>
      ) : (
        <>
          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Photo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prénom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Classe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Photos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => {
                  // Trouver la planche1 pour afficher la photo individuelle
                  const planche1 = student.photos?.find(
                    (photo) => photo.planche === "planche1"
                  );

                  return (
                    <tr key={student._id.toString()} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        {planche1 ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={planche1.cloudFrontUrl}
                              alt={`${student.firstName} ${student.lastName}`}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.lastName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.firstName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {student.classId}
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-gray-600">
                      {student.loginCode}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {student.photos?.length || 0}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="text-sm text-gray-700">
                Affichage de {startIndex + 1} à{" "}
                {Math.min(endIndex, filteredStudents.length)} sur{" "}
                {filteredStudents.length} étudiant
                {filteredStudents.length > 1 ? "s" : ""}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Afficher uniquement les pages pertinentes (first, last, current, current-1, current+1)
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1;

                      if (!showPage) {
                        // Afficher "..." entre les groupes de pages
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 border rounded-md text-sm font-medium ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
