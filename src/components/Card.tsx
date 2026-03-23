import { useUserContext } from "@/lib/userProvider";
import { Course } from "@/types/schema.types";
import { BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const { user } = useUserContext();

  // Helper to get full URL (handles both relative and absolute URLs)
  const getFullUrl = (url: string) => {
    if (!url) return "";
    // If already a full URL, return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // If relative path, prepend backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${backendUrl}${url}`;
  };

  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-xl overflow-hidden border border-border border-t-2 border-t-primary/20 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative">
        <div className="w-full aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={getFullUrl(course.thumbnail_url)}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen size={48} className="text-white opacity-50" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="font-bold text-base mb-1 line-clamp-2 leading-snug text-foreground">
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
            <div className="border-b border-border mb-2"></div>
          </div>
        )}

        {/* Instructor */}
        <p className="text-xs text-foreground mb-2">{user?.name || "Багш"}</p>

        {/* Subject Tag */}
        {course.subject_name && (
          <div className="flex items-center gap-2">
            <span className="inline-block bg-brand-50 text-brand-600 px-2 py-1 rounded text-xs">
              {course.subject_name}
            </span>
            {course.published && (
              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                Active
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default CourseCard;
