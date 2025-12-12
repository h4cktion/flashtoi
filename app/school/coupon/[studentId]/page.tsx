import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { PrintButton } from "@/components/school/print-button";
import Image from "next/image";

export default async function CouponPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await auth();

  if (!session || (session.user.role !== "school" && session.user.role !== "admin")) {
    redirect("/login");
  }

  await connectDB();

  const student = await Student.findById(studentId).lean();

  if (!student) {
    return <div>Étudiant non trouvé</div>;
  }

  // Security check: ensure student belongs to the logged-in school (if role is school)
  if (session.user.role === "school" && student.schoolId.toString() !== session.user.schoolId) {
    return <div>Accès refusé</div>;
  }

  // Generate QR Code data URL with full Login Link
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  // Format: BASE_URL/login?code=QRCODE&autologin=true
  const qrCodeLink = `${baseUrl}/login?code=${student.qrCode}&autologin=true`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeLink, {
    width: 300,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  // Photo URL (fallback logic similar to table)
  // Utiliser la miniature si disponible, sinon planche1, sinon première photo
  const displayPhotoUrl = 
    student.thumbnail?.cloudFrontUrl || 
    student.photos?.find((p) => p.planche === "18x24")?.cloudFrontUrl || 
    student.photos?.[0]?.cloudFrontUrl;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      
      {/* Client Component for Print Button & Logic */}
      <PrintButton />

      {/* Coupon Card (A6 size ratio approx) */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto print:shadow-none print:w-full print:max-w-none print:p-0 border-4 border-gray-200 print:border-2">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">
            Connexion Photos
          </h1>
          <p className="text-gray-500 text-lg">
            Retrouvez les photos de votre enfant en ligne
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start print:flex-row print:gap-8 print:items-start">
          
          {/* Left: Photo & Info */}
          <div className="flex-1 space-y-6 w-full">
            
            {/* Student Info Card */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 print:bg-gray-50 print:border-gray-200">
               <div className="flex items-center gap-4 mb-4">
                  {displayPhotoUrl ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-sm print:shadow-none">
                      <Image 
                        src={displayPhotoUrl} 
                        alt="Photo" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-gray-600 text-lg">Classe : {student.classId}</p>
                  </div>
               </div>
            </div>

            {/* Login Credentials */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 print:border-gray-300">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Identifiant</p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider select-all">
                  {student.loginCode}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 print:border-gray-300">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Mot de passe</p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider select-all">
                  {student.clearPassword || "Non défini"}
                </p>
              </div>
            </div>

          </div>

          {/* Right: QR Code */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-lg">
             <div className="relative w-64 h-64">
                {/* QR Code display */}
                {/* We use standard img tag/Image for data URL */}
                <img src={qrCodeDataUrl} alt="QR Code de connexion" className="w-full h-full object-contain" />
             </div>
             <p className="mt-4 text-center text-sm text-gray-500 font-medium px-4">
               Scannez ce QR code avec votre téléphone pour accéder directement aux photos
             </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
           <p className="text-xl font-semibold text-blue-600 print:text-black">
             {baseUrl.replace(/^https?:\/\//, '')}
           </p>
           <p className="text-gray-500 text-sm mt-1">
             Connectez-vous pour commander vos photos
           </p>
        </div>

      </div>
    </div>
  );
}
