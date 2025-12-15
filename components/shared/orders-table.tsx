"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateOrderPaymentStatus } from "@/lib/actions/school";
import { OrderItem, OrderPackItem } from "@/types/index";

// Define a unified Order type that covers both backoffice and school needs
export interface UnifiedOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  studentNames: string[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  
  // Backoffice specific fields (optional)
  schoolName?: string;
  paidAt?: string;
  itemsCount?: number;
  packsCount?: number;
  itemTypes?: string[];

  // School specific fields (optional)
    // Add any if needed, currently covered by base fields
    // items and packs details are needed for the modal
  items?: OrderItem[];
  packs?: OrderPackItem[];
  studentPhotos?: (string | null)[];
}

interface OrdersTableProps {
  orders: UnifiedOrder[];
  schoolId?: string; // Required if showActions is true
  showSchoolColumn?: boolean;
  showActions?: boolean;
  showItemTypeFilter?: boolean;
}

const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-orange-100 text-orange-800" },
  paid: { label: "Payée", color: "bg-blue-100 text-blue-800" },
  validated: { label: "Validée", color: "bg-purple-100 text-purple-800" },
  processing: { label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  shipped: { label: "Expédiée", color: "bg-indigo-100 text-indigo-800" },
  print: { label: "Impression", color: "bg-pink-100 text-pink-800" },
  completed: { label: "Terminée", color: "bg-green-100 text-green-800" },
};

const PAYMENT_LABELS: Record<string, string> = {
  check: "Chèque",
  cash: "Espèces",
  online: "En ligne",
  pending: "En attente",
};

export function SharedOrdersTable({
  orders,
  schoolId,
  showSchoolColumn = false,
  showActions = false,
  showItemTypeFilter = false,
}: OrdersTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);

  // Get unique item types for filter dropdown if needed
  const allItemTypes = showItemTypeFilter
    ? Array.from(new Set(orders.flatMap((order) => order.itemTypes || []))).sort()
    : [];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesOrderNumber = order.orderNumber.toLowerCase().includes(search);
      const matchesStudentName = order.studentNames.some((name) =>
        name.toLowerCase().includes(search)
      );
      const matchesSchoolName = showSchoolColumn && order.schoolName?.toLowerCase().includes(search);
      
      if (!matchesOrderNumber && !matchesStudentName && !matchesSchoolName) return false;
    }

    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) return false;

    // Payment filter
    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter) return false;

    // Item type filter
    if (showItemTypeFilter && itemTypeFilter !== "all" && !order.itemTypes?.includes(itemTypeFilter)) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const resetFilters = () => {
      setSearchTerm("");
      setStatusFilter("all");
      setPaymentFilter("all");
      setItemTypeFilter("all");
      setCurrentPage(1);
  }

  const handleUpdateStatus = async (orderId: string, newStatus: "paid" | "pending") => {
    if (!schoolId) return;
    
    const action = newStatus === "paid" ? "marquer comme payée" : "marquer comme non payée";
    if (!confirm(`Confirmer vouloir ${action} cette commande ?`)) {
      return;
    }

    setProcessingOrderId(orderId);

    try {
      const result = await updateOrderPaymentStatus(orderId, schoolId, newStatus);

      if (result.success) {
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

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={`Rechercher par n°, étudiant${showSchoolColumn ? ", école" : ""}...`}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500"
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
              onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ color: '#374151' }} 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option style={{ color: '#374151' }} value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} style={{ color: '#374151' }} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            style={{ color: '#374151' }} 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option style={{ color: '#374151' }} value="all">Tous les paiements</option>
            {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                 <option key={key} style={{ color: '#374151' }} value={key}>{label}</option>
            ))}
          </select>

          {showItemTypeFilter && (
            <select
              value={itemTypeFilter}
              onChange={(e) => { setItemTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{ color: '#374151' }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option style={{ color: '#374151' }} value="all">Tous les articles</option>
              {allItemTypes.map((type) => (
                <option key={type} value={type} style={{ color: '#374151' }}>
                  {type}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
       <div className="text-sm text-gray-600 mb-2">
            Affichage de {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""}
            {(searchTerm || statusFilter !== "all" || paymentFilter !== "all" || itemTypeFilter !== "all") && (
                 <button onClick={resetFilters} className="ml-2 text-blue-600 hover:text-blue-800 underline">Réinitialiser les filtres</button>
            )}
      </div>

      {/* Table */}
       {currentOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Commande
                </th>
                {showSchoolColumn && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    École
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant(s)
                </th>
                {/* Backoffice shows item summary in table, School might show items count or not, relying on props or UnifiedOrder structure. Backoffice code showed itemsCount and packsCount. School code showed itemsCount too. Let's show Items summary if available. */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => {
                 const isCashOrCheck = order.paymentMethod === "cash" || order.paymentMethod === "check";
                 const canMarkAsPaid = order.status === "pending" && isCashOrCheck;
                 const canMarkAsPending = order.status === "paid" && isCashOrCheck;
                 const isProcessing = processingOrderId === order._id;

                return (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedOrder(order)} // We can enhance this later to show modal
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-mono">
                      {order.orderNumber}
                    </div>
                  </td>
                  {showSchoolColumn && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.schoolName}</div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.studentNames.length === 1 ? (
                        order.studentNames[0]
                      ) : (
                        <div>
                          {order.studentNames[0]}
                          <div className="text-xs text-gray-500">
                            + {order.studentNames.length - 1} autre(s)
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(order.itemsCount !== undefined && order.itemsCount > 0) && (
                          <div>{order.itemsCount} photo(s)</div>
                        )}
                        {(order.packsCount !== undefined && order.packsCount > 0) && (
                          <div>{order.packsCount} pack(s)</div>
                        )}
                         {/* Fallback if counts are not explicitly passed but calculated elsewhere? Assuming they are passed or 0 */}
                         {(!order.itemsCount && !order.packsCount) && <span className="text-gray-500">-</span>}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {canMarkAsPaid && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "paid")}
                            disabled={isProcessing}
                            className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessing ? "..." : "Marquer payé"}
                          </button>
                        )}
                        {canMarkAsPending && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, "pending")}
                            disabled={isProcessing}
                            className="px-3 py-1 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessing ? "..." : "Marquer non payé"}
                          </button>
                        )}
                    </td>
                  )}
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
       {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
      )}

      {/* Modal - Includes logic from both modals essentially */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({
  order,
  onClose,
}: {
  order: UnifiedOrder;
  onClose: () => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Commande {order.orderNumber}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              {order.schoolName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">École</p>
                    <p className="text-base font-medium text-gray-900">{order.schoolName}</p>
                  </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Étudiant(s)</p>
                <div className="flex flex-col gap-2 mt-1">
                  {order.studentNames.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                       {/* Try to display photo if available */}
                       {order.studentPhotos && order.studentPhotos[idx] ? (
                           <Image 
                             src={order.studentPhotos[idx]!} 
                             alt={name} 
                             width={32}
                             height={32}
                             className="rounded-full object-cover border border-gray-200"
                             unoptimized
                           />
                       ) : (
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                             {name.charAt(0)}
                           </div>
                       )}
                      <span className="text-base font-medium text-gray-900">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
               <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block mt-1 ${
                    STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800"
                }`}>
                  {STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.label || order.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paiement</p>
                <p className="text-base font-medium text-gray-900">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Articles Details - assuming order.items and order.packs are available */}
            {(order.items || order.packs) && (
                <div>
                <h4 className="font-semibold text-gray-900 mb-3">Articles</h4>
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qté</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                         {order.items?.map((item, idx) => (
                        <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.plancheName} - {item.format}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                        </tr>
                        ))}
                        {order.packs?.map((pack, idx) => (
                        <tr key={`pack-${idx}`}>
                            <td className="px-4 py-2 text-sm text-gray-900">Pack {pack.packName} ({pack.photosCount} photos)</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{pack.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(pack.packPrice)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(pack.subtotal)}</td>
                        </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                        <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                        </tr>
                    </tfoot>
                    </table>
                </div>
                </div>
            )}
            
             {order.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
