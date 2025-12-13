import { IStudent, ITemplate } from "@/types";
import { CssPhotoCard } from "@/components/gallery/css-photo-card";
import { GroupPhotoCard } from "@/components/gallery/group-photo-card";

interface IndividualPhotosSectionProps {
  templates: ITemplate[];
  student: IStudent;
}

export function IndividualPhotosSection({
  templates,
  student,
}: IndividualPhotosSectionProps) {
  // Find 'groupe' template configuration
  const groupTemplate = templates.find((t) => t.planche === "groupe");

  // Filter out 'pochette', 'coupon', AND 'groupe' (as it's handled separately) types
  const filteredTemplates = templates.filter(
    (t) =>
      t.planche !== "pochette" &&
      t.planche !== "coupon" &&
      t.planche !== "groupe" &&
      t.format !== "pochette" &&
      t.format !== "coupon"
  );

  // Filter group photos from student photos
  const groupPhotos = student.photos?.filter((p) => p.planche === "groupe") || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">
        Photos individuelles ({filteredTemplates.length + groupPhotos.length})
      </h2>

      {(filteredTemplates.length > 0 || groupPhotos.length > 0) &&
      student.thumbnail?.cloudFrontUrl ? (
        <div className="flex flex-col gap-3">
          {/* Display Group Photos first */}
          {groupPhotos.map((photo, index) => (
            <GroupPhotoCard
              key={`group-${index}`}
              photo={photo}
              template={groupTemplate}
              studentId={student._id.toString()}
              studentName={`${student.firstName} ${student.lastName}`}
              student_id={student.student_id || ""}
              classId={student.classId}
            />
          ))}

          {/* Display Individual Templates */}
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
