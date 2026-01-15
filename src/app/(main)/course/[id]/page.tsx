// // app/course/[id]/page.tsx (With Custom Hooks)
// "use client";

// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import {
//   Play,
//   Lock,
//   CheckCircle,
//   Clock,
//   BookOpen,
//   User,
//   ArrowLeft,
//   PlayCircle,
//   X,
// } from "lucide-react";

// // Custom Hooks
// import { useCourseDetail } from "@/hooks/useCourseDetail";
// import { useProgress } from "@/hooks/useProgress";
// import { useDuration } from "@/hooks/useDuration";
// import { useVideoPlayer } from "@/hooks/useVideoPlayer";
// import { Lesson } from "@/types/schema.types";

// const CourseDetailPage = () => {
//   const params = useParams();
//   const router = useRouter();
//   const courseId = Number(params.id);

//   // Custom Hooks
//   const { course, lessons, selectedLesson, loading, error, selectLesson } =
//     useCourseDetail(courseId);

//   const { isCompleted, updateProgress, getProgress } = useProgress(courseId);

//   const { totalFormatted, formatDuration } = useDuration(lessons);

//   const { videoRef, handleTimeUpdate, handleLoadedMetadata } = useVideoPlayer(
//     (progress) => {
//       if (selectedLesson) {
//         updateProgress(selectedLesson.id, progress);
//       }
//     }
//   );

//   // Local state
//   const [showLessonList, setShowLessonList] = useState(false);

//   const handleLessonSelect = (lesson: Lesson) => {
//     selectLesson(lesson);
//     setShowLessonList(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading course...</p>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error || !course) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="container mx-auto px-4 py-12">
//           <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
//             <p className="font-semibold">Error</p>
//             <p>{error || "Course not found"}</p>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <main className="container mx-auto px-4 py-4 md:py-6">
//         {/* Back Button */}
//         <button
//           onClick={() => router.back()}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
//         >
//           <ArrowLeft size={20} />
//           <span className="text-sm md:text-base">Back to courses</span>
//         </button>

//         {/* Mobile: Show Lessons Button */}
//         <div className="lg:hidden mb-4">
//           <button
//             onClick={() => setShowLessonList(true)}
//             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-between hover:bg-blue-700 transition-colors"
//           >
//             <span className="font-medium">
//               Course Content ({lessons.length} lessons)
//             </span>
//             <BookOpen size={20} />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
//           {/* Left: Video Player & Course Info */}
//           <div className="lg:col-span-2 space-y-4 md:space-y-6">
//             {/* Video Player */}
//             <div className="bg-black rounded-lg overflow-hidden aspect-video">
//               {selectedLesson?.video_url ? (
//                 <video
//                   ref={videoRef}
//                   src={selectedLesson.video_url}
//                   controls
//                   className="w-full h-full"
//                   controlsList="nodownload"
//                   onTimeUpdate={handleTimeUpdate}
//                   onLoadedMetadata={handleLoadedMetadata}
//                 >
//                   Your browser does not support the video tag.
//                 </video>
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-white">
//                   <div className="text-center px-4">
//                     <PlayCircle
//                       size={48}
//                       className="mx-auto mb-4 opacity-50 md:w-16 md:h-16"
//                     />
//                     <p className="text-sm md:text-lg">
//                       Select a lesson to start learning
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Current Lesson Info */}
//             {selectedLesson && (
//               <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
//                 <div className="flex items-start justify-between gap-4 mb-2">
//                   <h2 className="text-xl md:text-2xl font-bold text-gray-900">
//                     {selectedLesson.title}
//                   </h2>
//                   {isCompleted(selectedLesson.id) && (
//                     <span className="flex items-center gap-1 text-green-600 text-sm whitespace-nowrap">
//                       <CheckCircle size={18} />
//                       Completed
//                     </span>
//                   )}
//                 </div>
//                 {selectedLesson.description && (
//                   <p className="text-sm md:text-base text-gray-600 mb-4">
//                     {selectedLesson.description}
//                   </p>
//                 )}
//                 <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500">
//                   <div className="flex items-center gap-1">
//                     <Clock size={16} />
//                     <span>{formatDuration(selectedLesson.video_duration)}</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <BookOpen size={16} />
//                     <span>Lesson {selectedLesson.lesson_order}</span>
//                   </div>
//                   {getProgress(selectedLesson.id) > 0 && (
//                     <div className="flex items-center gap-2">
//                       <div className="w-20 bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-blue-600 h-2 rounded-full transition-all"
//                           style={{
//                             width: `${getProgress(selectedLesson.id)}%`,
//                           }}
//                         />
//                       </div>
//                       <span>{Math.round(getProgress(selectedLesson.id))}%</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Course Overview */}
//             <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
//               <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
//                 About this course
//               </h3>
//               <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
//                 {course.description || "No description available."}
//               </p>

//               <div className="grid grid-cols-2 gap-3 md:gap-4">
//                 <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
//                   <BookOpen className="mx-auto mb-2 text-blue-600" size={20} />
//                   <div className="text-xl md:text-2xl font-bold text-gray-900">
//                     {lessons.length}
//                   </div>
//                   <div className="text-xs md:text-sm text-gray-600">
//                     Lessons
//                   </div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
//                   <Clock className="mx-auto mb-2 text-green-600" size={20} />
//                   <div className="text-xl md:text-2xl font-bold text-gray-900">
//                     {totalFormatted}
//                   </div>
//                   <div className="text-xs md:text-sm text-gray-600">
//                     Duration
//                   </div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg">
//                   <User className="mx-auto mb-2 text-purple-600" size={20} />
//                   <div className="text-xs md:text-sm font-medium text-gray-900 truncate px-1">
//                     {course.user_name || "Instructor"}
//                   </div>
//                   <div className="text-xs text-gray-600">Teacher</div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
//                   <BookOpen
//                     className="mx-auto mb-2 text-orange-600"
//                     size={20}
//                   />
//                   <div className="text-xs md:text-sm font-medium text-gray-900 truncate px-1">
//                     {course.subject_name || "Subject"}
//                   </div>
//                   <div className="text-xs text-gray-600">Category</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop: Lessons List (Sidebar) */}
//           <div className="hidden lg:block lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-sm sticky top-6">
//               <div className="p-4 border-b border-gray-200">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Course Content
//                 </h3>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {lessons.length} lessons • {totalFormatted}
//                 </p>
//               </div>

//               <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
//                 {lessons.length === 0 ? (
//                   <div className="p-6 text-center text-gray-500">
//                     <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
//                     <p>No lessons available yet</p>
//                   </div>
//                 ) : (
//                   <div className="divide-y divide-gray-100">
//                     {lessons.map((lesson) => (
//                       <LessonItem
//                         key={lesson.id}
//                         lesson={lesson}
//                         isSelected={selectedLesson?.id === lesson.id}
//                         isCompleted={isCompleted(lesson.id)}
//                         progress={getProgress(lesson.id)}
//                         onClick={() => handleLessonSelect(lesson)}
//                         formatDuration={formatDuration}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Mobile: Lessons Modal */}
//       {showLessonList && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
//           <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b border-gray-200">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Course Content
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   {lessons.length} lessons • {totalFormatted}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowLessonList(false)}
//                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               <div className="divide-y divide-gray-100">
//                 {lessons.map((lesson) => (
//                   <LessonItem
//                     key={lesson.id}
//                     lesson={lesson}
//                     isSelected={selectedLesson?.id === lesson.id}
//                     isCompleted={isCompleted(lesson.id)}
//                     progress={getProgress(lesson.id)}
//                     onClick={() => handleLessonSelect(lesson)}
//                     formatDuration={formatDuration}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <Footer />
//     </div>
//   );
// };

// // Lesson Item Component
// interface LessonItemProps {
//   lesson: Lesson;
//   isSelected: boolean;
//   isCompleted: boolean;
//   progress: number;
//   onClick: () => void;
//   formatDuration: (seconds: number | null) => string;
// }

// const LessonItem = ({
//   lesson,
//   isSelected,
//   isCompleted,
//   progress,
//   onClick,
//   formatDuration,
// }: LessonItemProps) => {
//   return (
//     <button
//       onClick={onClick}
//       className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
//         isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""
//       }`}
//     >
//       <div className="flex items-start gap-3">
//         <div
//           className={`mt-1 flex-shrink-0 ${
//             isSelected
//               ? "text-blue-600"
//               : isCompleted
//               ? "text-green-600"
//               : "text-gray-400"
//           }`}
//         >
//           {isCompleted ? (
//             <CheckCircle size={20} className="fill-current" />
//           ) : lesson.video_url ? (
//             isSelected ? (
//               <PlayCircle size={20} className="fill-current" />
//             ) : (
//               <Play size={20} />
//             )
//           ) : (
//             <Lock size={20} />
//           )}
//         </div>

//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2 mb-1">
//             <h4
//               className={`font-medium text-sm line-clamp-2 ${
//                 isSelected ? "text-blue-600" : "text-gray-900"
//               }`}
//             >
//               {lesson.title}
//             </h4>
//             <span className="text-xs text-gray-500 whitespace-nowrap">
//               {formatDuration(lesson.video_duration)}
//             </span>
//           </div>

//           {lesson.description && (
//             <p className="text-xs text-gray-500 line-clamp-2 mb-2">
//               {lesson.description}
//             </p>
//           )}

//           {/* Progress Bar */}
//           {progress > 0 && progress < 100 && (
//             <div className="mb-2">
//               <div className="w-full bg-gray-200 rounded-full h-1.5">
//                 <div
//                   className="bg-blue-600 h-1.5 rounded-full transition-all"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           <div className="flex items-center gap-2 flex-wrap">
//             <span className="text-xs text-gray-400">
//               Lesson {lesson.lesson_order}
//             </span>
//             {lesson.published && (
//               <span className="text-xs text-green-600 flex items-center gap-1">
//                 <CheckCircle size={12} />
//                 Published
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </button>
//   );
// };

// export default CourseDetailPage;

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Play,
  Lock,
  CheckCircle,
  Clock,
  BookOpen,
  User,
  ArrowLeft,
  PlayCircle,
  X,
} from "lucide-react";

// Clean hooks
import { useCourse } from "@/hooks/useCourse";
import { useLessons } from "@/hooks/useLessons";
import { useProgress } from "@/hooks/useProgress";
import { useDuration } from "@/hooks/useDuration";
import { useVideoPlayer } from "@/hooks/ui/useVideoPlayer";
import { Lesson } from "@/types/schema.types";

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  // Data hooks
  const {
    course,
    loading: courseLoading,
    error: courseError,
  } = useCourse(courseId);
  const {
    lessons,
    loading: lessonsLoading,
    selectedLesson,
    selectLesson,
  } = useLessons(courseId);
  const {
    updateProgress,
    markComplete,
    isCompleted,
    getProgress,
    getLastPosition,
  } = useProgress(courseId);

  // Utility hooks
  const { totalFormatted, formatDuration } = useDuration(lessons);

  // Video player hook
  const { videoRef, handleTimeUpdate, handleLoadedMetadata } = useVideoPlayer({
    onProgressUpdate: (position) => {
      if (selectedLesson) {
        updateProgress(selectedLesson.id, position);
      }
    },
    onComplete: () => {
      if (selectedLesson) {
        markComplete(selectedLesson.id);
      }
    },
    initialPosition: selectedLesson ? getLastPosition(selectedLesson.id) : 0,
  });

  // UI state
  const [showLessonList, setShowLessonList] = useState(false);

  const handleLessonSelect = (lesson: Lesson) => {
    selectLesson(lesson);
    setShowLessonList(false);
  };

  const loading = courseLoading || lessonsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error</p>
            <p>{courseError || "Course not found"}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm md:text-base">Back to courses</span>
        </button>

        {/* Mobile: Show Lessons Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowLessonList(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-between hover:bg-blue-700 transition-colors"
          >
            <span className="font-medium">
              Course Content ({lessons.length} lessons)
            </span>
            <BookOpen size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left: Video Player & Course Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              {selectedLesson?.video_url ? (
                <video
                  ref={videoRef}
                  src={selectedLesson.video_url}
                  controls
                  className="w-full h-full"
                  controlsList="nodownload"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center px-4">
                    <PlayCircle
                      size={48}
                      className="mx-auto mb-4 opacity-50 md:w-16 md:h-16"
                    />
                    <p className="text-sm md:text-lg">
                      Select a lesson to start learning
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Lesson Info */}
            {selectedLesson && (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {selectedLesson.title}
                  </h2>
                  {isCompleted(selectedLesson.id) && (
                    <span className="flex items-center gap-1 text-green-600 text-sm whitespace-nowrap">
                      <CheckCircle size={18} />
                      Completed
                    </span>
                  )}
                </div>
                {selectedLesson.description && (
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    {selectedLesson.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatDuration(selectedLesson.video_duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    <span>Lesson {selectedLesson.lesson_order}</span>
                  </div>
                  {getProgress(selectedLesson.id) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${getProgress(selectedLesson.id)}%`,
                          }}
                        />
                      </div>
                      <span>{Math.round(getProgress(selectedLesson.id))}%</span>
                    </div>
                  )}
                </div>

                {/* Lesson Text Content */}
                {selectedLesson.text && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-3">Lesson Notes</h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {selectedLesson.text}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Course Overview */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                About this course
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                {course.description || "No description available."}
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="mx-auto mb-2 text-blue-600" size={20} />
                  <div className="text-xl md:text-2xl font-bold text-gray-900">
                    {lessons.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Lessons
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                  <Clock className="mx-auto mb-2 text-green-600" size={20} />
                  <div className="text-xl md:text-2xl font-bold text-gray-900">
                    {totalFormatted}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Duration
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg">
                  <User className="mx-auto mb-2 text-purple-600" size={20} />
                  <div className="text-xs md:text-sm font-medium text-gray-900 truncate px-1">
                    {course.user_name || "Instructor"}
                  </div>
                  <div className="text-xs text-gray-600">Teacher</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
                  <BookOpen
                    className="mx-auto mb-2 text-orange-600"
                    size={20}
                  />
                  <div className="text-xs md:text-sm font-medium text-gray-900 truncate px-1">
                    {course.subject_name || "Subject"}
                  </div>
                  <div className="text-xs text-gray-600">Category</div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Lessons List (Sidebar) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  Course Content
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {lessons.length} lessons • {totalFormatted}
                </p>
              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {lessons.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No lessons available yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {lessons.map((lesson) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isSelected={selectedLesson?.id === lesson.id}
                        isCompleted={isCompleted(lesson.id)}
                        progress={getProgress(lesson.id)}
                        onClick={() => handleLessonSelect(lesson)}
                        formatDuration={formatDuration}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile: Lessons Modal */}
      {showLessonList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Course Content
                </h3>
                <p className="text-sm text-gray-600">
                  {lessons.length} lessons • {totalFormatted}
                </p>
              </div>
              <button
                onClick={() => setShowLessonList(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={selectedLesson?.id === lesson.id}
                    isCompleted={isCompleted(lesson.id)}
                    progress={getProgress(lesson.id)}
                    onClick={() => handleLessonSelect(lesson)}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// Lesson Item Component
interface LessonItemProps {
  lesson: Lesson;
  isSelected: boolean;
  isCompleted: boolean;
  progress: number;
  onClick: () => void;
  formatDuration: (seconds: number | null) => string;
}

const LessonItem = ({
  lesson,
  isSelected,
  isCompleted,
  progress,
  onClick,
  formatDuration,
}: LessonItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
        isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 flex-shrink-0 ${
            isSelected
              ? "text-blue-600"
              : isCompleted
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {isCompleted ? (
            <CheckCircle size={20} className="fill-current" />
          ) : lesson.video_url ? (
            isSelected ? (
              <PlayCircle size={20} className="fill-current" />
            ) : (
              <Play size={20} />
            )
          ) : (
            <Lock size={20} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`font-medium text-sm line-clamp-2 ${
                isSelected ? "text-blue-600" : "text-gray-900"
              }`}
            >
              {lesson.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDuration(lesson.video_duration)}
            </span>
          </div>

          {lesson.description && (
            <p
              className="text-xs text-g
             ray-500 line-clamp-2 mb-2"
            >
              {lesson.description}
            </p>
          )}

          {/* Progress Bar */}
          {progress > 0 && progress < 100 && (
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">
              Lesson {lesson.lesson_order}
            </span>
            {lesson.published && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={12} />
                Published
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default CourseDetailPage;
