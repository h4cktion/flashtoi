"use client";

import { useState } from "react";
import { markOrderAsPaid } from "@/lib/actions/school";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  studentNames: string[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  notes?: string;
}

interface OrdersTableProps {
  orders: Order[];
  schoolId: string;
}

const ORDERS_PER_PAGE = 10;

// Mappage des statuts vers des couleurs
const STATUS_COLORS = {
  pending: "bg-orange-100 text-orange-800",
  paid: "bg-blue-100 text-blue-800",
  validated: "bg-purple-100 text-purple-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
};

const STATUS_LABELS = {
  pending: "En attente",
  paid: "Payé",
  validated: "Validé",
  processing: "En traitement",
  shipped: "Expédié",
  completed: "Terminé",
};

const PAYMENT_LABELS = {
  check: "Chèque",
  cash: "Espèces",
  online: "En ligne",
  pending: "En attente",
};

export function OrdersTable({ orders, schoolId }: OrdersTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );

  // Filtrer les commandes
  const filteredOrders = orders.filter((order) => {
    // Filtre de recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesOrderNumber = order.orderNumber
        .toLowerCase()
        .includes(search);
      const matchesStudentName = order.studentNames.some((name) =>
        name.toLowerCase().includes(search)
      );
      if (!matchesOrderNumber && !matchesStudentName) return false;
    }

    // Filtre de statut
    if (statusFilter !== "all" && order.status !== statusFilter) return false;

    // Filtre de mode de paiement
    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter)
      return false;

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaymentFilter = (value: string) => {
    setPaymentFilter(value);
    setCurrentPage(1);
  };

  const handleMarkAsPaid = async (orderId: string) => {
    if (!confirm("Confirmer que cette commande a été payée ?")) {
      return;
    }

    setProcessingOrderId(orderId);

    try {
      const result = await markOrderAsPaid(orderId, schoolId);

      if (result.success) {
        // Recharger la page pour afficher les données mises à jour
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la mise à jour");
      }
    } catch {
      alert("Une erreur est survenue");
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div>
      {/* En-tête et compteur */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Liste des commandes
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredOrders.length}{" "}
            {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
              ? "résultat(s)"
              : `commande${orders.length > 1 ? "s" : ""}`}{" "}
            {(searchTerm ||
              statusFilter !== "all" ||
              paymentFilter !== "all") &&
              `sur ${orders.length}`}
            )
          </span>
        </h3>

        {totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche */}
        <div className="relative md:col-span-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher par n° ou étudiant..."
            className="w-full px-4 py-2 pl-10 border border-gray-300  text-slate-500 rounded-lg text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Filtre statut */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="paid">Payé</option>
            <option value="validated">Validé</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédié</option>
            <option value="completed">Terminé</option>
          </select>
        </div>

        {/* Filtre mode de paiement */}
        <div>
          <select
            value={paymentFilter}
            onChange={(e) => handlePaymentFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les modes de paiement</option>
            <option value="check">Chèque</option>
            <option value="cash">Espèces</option>
            <option value="online">En ligne</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>

      {/* Message si aucun résultat */}
      {filteredOrders.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500">Aucune commande trouvée</p>
          {(searchTerm ||
            statusFilter !== "all" ||
            paymentFilter !== "all") && (
            <button
              onClick={() => {
                handleSearch("");
                handleStatusFilter("all");
                handlePaymentFilter("all");
              }}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    N° Commande
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Étudiant(s)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Paiement
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => {
                  const canMarkAsPaid =
                    order.status === "pending" &&
                    (order.paymentMethod === "cash" ||
                      order.paymentMethod === "check");
                  const isProcessing = processingOrderId === order._id;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-mono text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {order.studentNames.join(", ")}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {order.totalAmount.toFixed(2)} €
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {PAYMENT_LABELS[
                          order.paymentMethod as keyof typeof PAYMENT_LABELS
                        ] || order.paymentMethod}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            STATUS_COLORS[
                              order.status as keyof typeof STATUS_COLORS
                            ] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {STATUS_LABELS[
                            order.status as keyof typeof STATUS_LABELS
                          ] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {canMarkAsPaid && (
                          <button
                            onClick={() => handleMarkAsPaid(order._id)}
                            disabled={isProcessing}
                            className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessing ? "En cours..." : "Marquer payé"}
                          </button>
                        )}
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
                {Math.min(endIndex, filteredOrders.length)} sur{" "}
                {filteredOrders.length} commande
                {filteredOrders.length > 1 ? "s" : ""}
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
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1;

                      if (!showPage) {
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
