import Image from "next/image";
import { IStudent } from "@/types";

interface StudentHeaderProps {
  student: IStudent;
}

export function StudentHeader({ student }: StudentHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center gap-6">
        {/* Miniature de l'élève */}
        {student.thumbnail?.cloudFrontUrl && (
          <div className="relative w-24 h-32 flex-shrink-0">
            <Image
              src={student.thumbnail.cloudFrontUrl}
              alt={`${student.firstName} ${student.lastName}`}
              fill
              className="object-cover rounded-lg shadow-md"
              sizes="96px"
            />
          </div>
        )}

        {/* Informations de l'élève */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-600 mt-2">Classe: {student.classId}</p>
        </div>
      </div>
    </div>
  );
}
