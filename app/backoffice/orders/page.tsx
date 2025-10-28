import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getAllOrdersForAdmin } from "@/lib/actions/admin";
import { OrdersTable } from "@/components/backoffice/orders-table";
import Link from "next/link";

export default async function BackofficeOrdersPage() {
  // Vérifier l'authentification
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/backoffice/login");
  }

  // Récupérer les commandes
  const result = await getAllOrdersForAdmin();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              Erreur lors du chargement des commandes: {result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { orders } = result.data;

  // Calculer les statistiques
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Par statut
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const paidOrders = orders.filter((o) => o.status === "paid");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const pendingRevenue = pendingOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );
  const paidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Par méthode de paiement
  const onlineOrders = orders.filter((o) => o.paymentMethod === "online");
  const cashOrders = orders.filter((o) => o.paymentMethod === "cash");
  const checkOrders = orders.filter((o) => o.paymentMethod === "check");

  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const cashRevenue = cashOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const checkRevenue = checkOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Panier moyen
  const averageOrderAmount = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des commandes
              </h1>
              <p className="text-gray-600 mt-1">
                Vue d&apos;ensemble de toutes les commandes
              </p>
            </div>
            <Link
              href="/backoffice/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Statistics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Vue d&apos;ensemble
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-gray-600">
                Total commandes
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {totalOrders}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-gray-600">
                Chiffre d&apos;affaires
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(totalRevenue)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-gray-600">
                Panier moyen
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(averageOrderAmount)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-gray-600">Terminées</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {completedOrders.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {totalOrders > 0
                  ? `${Math.round(
                      (completedOrders.length / totalOrders) * 100
                    )}%`
                  : "0%"}
              </div>
            </div>
          </div>
        </div>

        {/* Status Statistics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Par statut
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">
                  En attente
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {pendingOrders.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(pendingRevenue)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Payées</div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Paid
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {paidOrders.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(paidRevenue)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">
                  Taux de conversion
                </div>
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalOrders > 0
                  ? `${Math.round(
                      ((paidOrders.length + completedOrders.length) /
                        totalOrders) *
                        100
                    )}%`
                  : "0%"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Commandes payées ou terminées
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Statistics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Par mode de paiement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">
                  En ligne
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Online
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {onlineOrders.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(onlineRevenue)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Espèces</div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Cash
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {cashOrders.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(cashRevenue)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600">Chèque</div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  Check
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {checkOrders.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(checkRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Toutes les commandes
          </h2>
          <OrdersTable orders={orders} />
        </div>
      </main>
    </div>
  );
}
