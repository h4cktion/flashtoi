import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getSchoolDetailsForAdmin } from "@/lib/actions/admin";
import Link from "next/link";
import { SchoolDetailsClient } from "@/components/backoffice/school-details-client";
import { ExportPDFButton } from "@/components/backoffice/export-pdf-button";

export default async function SchoolDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Vérifier l'authentification
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/backoffice/login");
  }

  // Récupérer les détails de l'école
  const result = await getSchoolDetailsForAdmin(id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              Erreur lors du chargement de l&apos;école: {result.error}
            </p>
            <Link
              href="/backoffice/schools"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
            >
              &larr; Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { school, students, orders } = result.data;


  // Récupérer les templates disponibles pour les pochettes
  const { getTemplates } = await import("@/lib/actions/template");
  const templatesResult = await getTemplates();
  const templates = templatesResult.success && templatesResult.data ? templatesResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link href="/backoffice/schools" className="hover:text-gray-900">
                  Écoles
                </Link>
                <span>/</span>
                <span>Détails</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
            </div>
            <div className="flex gap-3">
              <ExportPDFButton
                schoolName={school.name}
                schoolId={school._id}
                orders={orders}
                totalRevenue={school.totalRevenue}
                paidRevenue={school.paidRevenue}
                schoolPayment={school.schoolPayment}
                paidOrders={school.paidOrders}
                pendingOrders={school.pendingOrders}
              />
              <Link
                href="/backoffice/schools"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Retour
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SchoolDetailsClient
          school={school}
          students={students}
          orders={orders}
          templates={templates}
        />
      </main>
    </div>
  );
}
