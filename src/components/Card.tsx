import { Course } from "@/types/schema.types";
import { Play } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative">
        <div className="w-full h-30 sm:h-40 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Play size={38} className="text-white opacity-80" />
          )}
        </div>
      </div>

      <div className="p-3 sm:p-3">
        <h3 className="font-bold text-base sm:text-lg mb-3 h-12 sm:h-8 overflow-hidden leading-tight">
          {course.title}
        </h3>

        <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <span>{course.description}</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="font-bold">{course?.user_name}</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <Eye size={14} className="flex-shrink-0" />
            <span>{course.views.toLocaleString()} харсан</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="flex-shrink-0" />
            <span>{course.students} сурагчид</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};
export default CourseCard;
