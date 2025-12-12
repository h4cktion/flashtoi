"use client";

import { useState } from "react";
import {
  SchoolWithStats,
  StudentWithDetails,
  OrderWithDetails,
  updateSchoolClosingDate,
  updateSchoolRibForAdmin,
  updateSchoolDetails,
} from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { IbanInput } from "@/components/ui/iban-input";
import { useToastStore } from "@/lib/store/toast-store";

interface SchoolDetailsClientProps {
  school: SchoolWithStats & {
    email: string;
    address: string;
    phone: string;
    closingDate?: string;
    rib?: string;
    password?: string;
    clearPassword?: string;
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
  
  // Consolidated form state
  const [formData, setFormData] = useState({
    name: school.name,
    email: school.email,
    phone: school.phone,
    address: school.address,
    closingDate: school.closingDate
      ? new Date(school.closingDate).toISOString().split("T")[0]
      : "",
    rib: school.rib || "",
  });

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if there are changes
  const hasChanges = () => {
    const initialClosingDate = school.closingDate
      ? new Date(school.closingDate).toISOString().split("T")[0]
      : "";
    
    return (
      formData.name !== school.name ||
      formData.email !== school.email ||
      formData.phone !== school.phone ||
      formData.address !== school.address ||
      formData.closingDate !== initialClosingDate ||
      formData.rib !== (school.rib || "")
    );
  };

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

  const { addToast } = useToastStore();

  // Handle global save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const closingDate = formData.closingDate ? new Date(formData.closingDate) : null;
      
      const result = await updateSchoolDetails(school._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        closingDate,
        rib: formData.rib,
      });

      if (result.success) {
        router.refresh();
        setIsEditingDetails(false);
        addToast("Modifications enregistrées avec succès", "success");
      } else {
        addToast("Erreur: " + result.error, "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Une erreur est survenue", "error");
    } finally {
      setIsSaving(false);
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails de l&apos;école
                </h3>
                <button
                  onClick={() => {
                    if (isEditingDetails) {
                      // Reset form data on cancel (optional, keeping changes for now)
                    }
                    setIsEditingDetails(!isEditingDetails);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {isEditingDetails ? (
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
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
                  )}
                </button>
              </div>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isEditingDetails ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      />
                    ) : (
                      school.name
                    )}
                  </dd>
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
                  <dt className="text-sm font-medium text-gray-500">
                    Mot de passe
                  </dt>
                  <dd className="mt-1 text-sm font-mono text-gray-900">
                    {school.clearPassword || "-"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isEditingDetails ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      />
                    ) : (
                      school.email
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Téléphone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isEditingDetails ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      />
                    ) : (
                      school.phone
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isEditingDetails ? (
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                      />
                    ) : (
                      school.address
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configuration
              </h3>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="closingDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date de clôture des commandes
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="closingDate"
                      id="closingDate"
                      className="block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border text-gray-900"
                      value={formData.closingDate}
                      onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Après cette date, les parents ne pourront plus passer de
                    commande.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="rib"
                    className="block text-sm font-medium text-gray-700"
                  >
                    RIB / IBAN
                  </label>
                  <div className="mt-1">
                    <IbanInput
                      id="rib"
                      className="block w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base border text-gray-900"
                      placeholder="FR76..."
                      value={formData.rib}
                      onChange={(value) => setFormData({ ...formData, rib: value })}
                    />
                  </div>
                </div>

                {hasChanges() && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">
                Statistiques
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Chiffre d&apos;affaires
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mot de passe
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">
                          {student.clearPassword || "-"}
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
                        colSpan={6}
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

