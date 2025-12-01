import { IStudent, ITemplate } from "@/types";
import { CssPhotoCard } from "@/components/gallery/css-photo-card";

interface IndividualPhotosSectionProps {
  templates: ITemplate[];
  student: IStudent;
}

export function IndividualPhotosSection({
  templates,
  student,
}: IndividualPhotosSectionProps) {
  // Filter out 'pochette' and 'coupon' types (checking both planche and format)
  const filteredTemplates = templates.filter(
    (t) =>
      t.planche !== "pochette" &&
      t.planche !== "coupon" &&
      t.format !== "pochette" &&
      t.format !== "coupon"
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">
        Photos individuelles ({filteredTemplates.length})
      </h2>

      {filteredTemplates.length > 0 && student.thumbnail?.cloudFrontUrl ? (
        <div className="flex flex-col gap-3">
          {filteredTemplates.map((template) => (
            <CssPhotoCard
              key={template._id.toString()}
              template={template}
              studentId={student._id.toString()}
              studentName={`${student.firstName} ${student.lastName}`}
              student_id={student.student_id || ""}
              classId={student.classId}
              thumbnailUrl={student.thumbnail?.cloudFrontUrl || ""}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">
          Aucun template disponible pour le moment
        </p>
      )}
    </div>
  );
}
