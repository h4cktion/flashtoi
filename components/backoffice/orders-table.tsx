"use client";

import { useState } from "react";
import { OrderWithDetails, refundOrder } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface OrdersTableProps {
  orders: OrderWithDetails[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(
    null
  );
  const itemsPerPage = 20;

  // Get unique item types for filter dropdown
  const allItemTypes = Array.from(
    new Set(orders.flatMap((order) => order.itemTypes || []))
  ).sort();

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search) ||
        order.schoolName.toLowerCase().includes(search) ||
        order.studentNames.some((name) => name.toLowerCase().includes(search));

      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) return false;

    // Payment filter
    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter)
      return false;

    // Item type filter
    if (
      itemTypeFilter !== "all" &&
      !order.itemTypes?.includes(itemTypeFilter)
    ) {
      return false;
    }

    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
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

  const handleItemTypeFilter = (value: string) => {
    setItemTypeFilter(value);
    setCurrentPage(1);
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Payée", color: "bg-green-100 text-green-800" },
      validated: { label: "Validée", color: "bg-blue-100 text-blue-800" },
      processing: { label: "En cours", color: "bg-purple-100 text-purple-800" },
      shipped: { label: "Expédiée", color: "bg-indigo-100 text-indigo-800" },
      print: { label: "Impression", color: "bg-pink-100 text-pink-800" },
      completed: { label: "Terminée", color: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Get payment method badge
  const getPaymentBadge = (method: string) => {
    const methodConfig = {
      online: { label: "En ligne", color: "bg-blue-100 text-blue-800" },
      cash: { label: "Espèces", color: "bg-green-100 text-green-800" },
      check: { label: "Chèque", color: "bg-purple-100 text-purple-800" },
      pending: { label: "En attente", color: "bg-gray-100 text-gray-800" },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || {
      label: method,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par numéro, école ou nom d'étudiant..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={{ color: '#111827' }}
            className="px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option style={{ color: 'black' }} value="all">Tous les statuts</option>
            <option style={{ color: 'black' }} value="pending">En attente</option>
            <option style={{ color: 'black' }} value="paid">Payées</option>
            <option style={{ color: 'black' }} value="validated">Validées</option>
            <option style={{ color: 'black' }} value="processing">En cours</option>
            <option style={{ color: 'black' }} value="print">Impression</option>
            <option style={{ color: 'black' }} value="shipped">Expédiées</option>
            <option style={{ color: 'black' }} value="completed">Terminées</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => handlePaymentFilter(e.target.value)}
            style={{ color: '#111827' }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option style={{ color: 'black' }} value="all">Tous les paiements</option>
            <option style={{ color: 'black' }} value="online">En ligne</option>
            <option style={{ color: 'black' }} value="cash">Espèces</option>
            <option style={{ color: 'black' }} value="check">Chèque</option>
            <option style={{ color: 'black' }} value="pending">En attente</option>
          </select>

          <select
            value={itemTypeFilter}
            onChange={(e) => handleItemTypeFilter(e.target.value)}
            style={{ color: '#111827' }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option style={{ color: 'black' }} value="all">Tous les articles</option>
            {allItemTypes.map((type) => (
              <option key={type} value={type} style={{ color: 'black' }}>
                {type}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center px-3">
            {filteredOrders.length} commande(s)
          </div>
        </div>
      </div>

      {/* Table */}
      {currentOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Aucune commande trouvée</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    École
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant(s)
                  </th>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {order.orderNumber}
                      </div>
                      {order.paidAt && (
                        <div className="text-xs text-gray-500">
                          Payée le {formatDate(order.paidAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.schoolName}
                      </div>
                    </td>
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
                        {order.itemsCount > 0 && (
                          <div>{order.itemsCount} photo(s)</div>
                        )}
                        {order.packsCount > 0 && (
                          <div>{order.packsCount} pack(s)</div>
                        )}
                        {order.itemsCount === 0 && order.packsCount === 0 && (
                          <span className="text-gray-500">Vide</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(order.paymentMethod)}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}


// ... (imports)


export function OrderDetailsModal({
  order,
  onClose,
}: {
  order: OrderWithDetails;
  onClose: () => void;
}) {
  const [isRefunding, setIsRefunding] = useState(false);
  const router = useRouter(); // Need to access router for refresh

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const handleRefund = async () => {
    if (!confirm("Êtes-vous sûr de vouloir rembourser cette commande ? Cette action est irréversible.")) {
      return;
    }

    setIsRefunding(true);
    try {
      const result = await refundOrder(order._id);
      if (result.success) {
        alert("Commande remboursée avec succès");
        router.refresh(); // Refresh data
        onClose();
      } else {
        alert(result.error || "Erreur lors du remboursement");
      }
    } catch (error) {
      console.error("Refund error:", error);
      alert("Une erreur est survenue lors du remboursement");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            {/* ... title ... */}
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
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Informations */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              {/* ... existing fields ... */}
              <div>
                <p className="text-sm font-medium text-gray-500">École</p>
                <p className="text-base font-medium text-gray-900">
                  {order.schoolName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Étudiant(s)</p>
                <div className="flex flex-col gap-2 mt-1">
                  {order.studentNames.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {order.studentPhotos?.[idx] ? (
                        <img
                          src={order.studentPhotos[idx]!}
                          alt={name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                          {name.charAt(0)}
                        </div>
                      )}
                      <span className="text-base font-medium text-gray-900">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <p className="text-base font-medium text-gray-900 capitalize">
                  {order.status === "pending"
                    ? "En attente"
                    : order.status === "paid"
                    ? "Payée"
                    : order.status === "refunded"
                    ? "Remboursée"
                    : order.status}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paiement</p>
                <p className="text-base font-medium text-gray-900 capitalize">
                  {order.paymentMethod === "online"
                    ? "En ligne"
                    : order.paymentMethod === "check"
                    ? "Chèque"
                    : order.paymentMethod === "cash"
                    ? "Espèces"
                    : order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Articles */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Articles</h4>
              {/* ... existing table ... */}
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Qté
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Prix
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items?.map((item, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.plancheName} - {item.format}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                    {order.packs?.map((pack, idx: number) => (
                      <tr key={`pack-${idx}`}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          Pack {pack.packName} ({pack.photosCount} photos)
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {pack.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {formatCurrency(pack.packPrice)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(pack.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-right text-sm font-bold text-gray-900"
                      >
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {order.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {order.notes}
                </p>
              </div>
            )}
            
            {/* Stripe Refund Section */}
            {order.paymentMethod === "online" && order.status !== "refunded" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Remboursement Stripe</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Cette commande a été payée en ligne via Stripe.
                        {!order.stripePaymentIntentId && (
                           <span className="block mt-1 text-orange-700 font-medium">
                             ⚠️ Remboursement indisponible : Identifiant Stripe manquant (commande ancienne).
                           </span>
                        )}
                        {order.stripePaymentIntentId && (
                           <span> Vous pouvez effectuer un remboursement.</span>
                        )}
                      </p>
                    </div>
                     {order.stripePaymentIntentId ? (
                        <button
                          onClick={handleRefund}
                          disabled={isRefunding}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {isRefunding ? "Remboursement..." : "Rembourser la commande"}
                        </button>
                     ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
                        >
                          Indisponible
                        </button>
                     )}
                  </div>
                </div>
            )}
            
            {order.status === "refunded" && (
                 <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium text-center">
                        Cette commande a été remboursée.
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
