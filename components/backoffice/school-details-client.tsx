"use client";

import { useState } from "react";
import {
  SchoolWithStats,
  StudentWithDetails,
  OrderWithDetails,
  updateSchoolClosingDate,
} from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface SchoolDetailsClientProps {
  school: SchoolWithStats & {
    email: string;
    address: string;
    phone: string;
    closingDate?: string;
  };
  students: StudentWithDetails[];
  orders: OrderWithDetails[];
}

export function SchoolDetailsClient({
  school,
  students,
  orders,
}: SchoolDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "students" | "orders">(
    "info"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [closingDate, setClosingDate] = useState(
    school.closingDate ? new Date(school.closingDate).toISOString().split("T")[0] : ""
  );
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);

  // Filter students
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(search) ||
      student.lastName.toLowerCase().includes(search) ||
      student.loginCode.toLowerCase().includes(search) ||
      student.classId.toLowerCase().includes(search)
    );
  });

  // Handle closing date update
  const handleUpdateClosingDate = async () => {
    setIsUpdatingDate(true);
    try {
      const date = closingDate ? new Date(closingDate) : null;
      const result = await updateSchoolClosingDate(school._id, date);
      if (result.success) {
        router.refresh();
        alert("Date de clôture mise à jour avec succès");
      } else {
        alert("Erreur: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue");
    } finally {
      setIsUpdatingDate(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "students"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Élèves ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Commandes ({orders.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Détails de l'école
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{school.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Code de connexion
                  </dt>
                  <dd className="mt-1 text-sm font-mono text-gray-900">
                    {school.loginCode}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{school.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Téléphone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{school.phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {school.address}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="closingDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date de clôture des commandes
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="date"
                      name="closingDate"
                      id="closingDate"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border"
                      value={closingDate}
                      onChange={(e) => setClosingDate(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleUpdateClosingDate}
                      disabled={isUpdatingDate}
                      className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                    >
                      {isUpdatingDate ? "..." : "Enregistrer"}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Après cette date, les parents ne pourront plus passer de
                    commande.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">
                Statistiques
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Chiffre d'affaires
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(school.totalRevenue)}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Commandes
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="font-semibold">{school.ordersCount}</span>{" "}
                    total
                    <br />
                    <span className="text-green-600">
                      {school.paidOrders} payées
                    </span>
                    <br />
                    <span className="text-yellow-600">
                      {school.pendingOrders} en attente
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Codes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {student.photoUrl ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={student.photoUrl}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {student.firstName[0]}
                                {student.lastName[0]}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.classId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          Login: <span className="font-mono">{student.loginCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {student.hasOrder ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.orderStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {student.orderStatus === "paid" ? "Payée" : "En attente"}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {student.orderAmount
                          ? formatCurrency(student.orderAmount)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Aucun élève trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Élèves
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod === "online"
                          ? "Carte bancaire"
                          : order.paymentMethod === "check"
                          ? "Chèque"
                          : "Espèces"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.studentNames.join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "paid"
                          ? "Payée"
                          : order.status === "pending"
                          ? "En attente"
                          : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Aucune commande trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
