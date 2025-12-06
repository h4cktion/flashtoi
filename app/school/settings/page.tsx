import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getSchoolDashboard } from "@/lib/actions/school";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { RibForm } from "@/components/school/rib-form";
import Link from "next/link";

export default async function SchoolSettingsPage() {
  const session = await auth();

  if (!session || session.user.role !== "school") {
    redirect("/school/login");
  }

  const result = await getSchoolDashboard(session.user.schoolId!);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600">{result.error || "Une erreur est survenue"}</p>
        </div>
      </div>
    );
  }

  const { school } = result.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600 mt-1">{school.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/school/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                ← Dashboard
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Coordonnées bancaires
          </h2>
          <RibForm schoolId={school._id.toString()} initialRib={school.rib} />
        </div>
      </main>
    </div>
  );
}
