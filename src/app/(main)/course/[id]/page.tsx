// app/course/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CheckCircle,
  Clock,
  BookOpen,
  User,
  ArrowLeft,
  PlayCircle,
  X,
  FileText,
  Download,
} from "lucide-react";

// Hooks
import { useCourse } from "@/hooks/useCourse";
import { useLessons } from "@/hooks/useLessons";
import { useProgress } from "@/hooks/useProgress";
import { useDuration } from "@/hooks/useDuration";
import { useVideoPlayer } from "@/hooks/ui/useVideoPlayer";
import { useUserContext } from "@/lib/userProvider";

// Components
import { ManageLessonsDialog } from "@/components/lesson/ManageLessonsDialog";
import { Lesson } from "@/types/schema.types";
import { pdfAPI } from "@/lib/pdf";
import { useSubjectWithCourse } from "@/hooks/useSubjectWithCourse";

interface PdfMaterial {
  id: number;
  lesson_id: number;
  title: string;
  file_url: string;
  file_size: number | null;
  uploaded_at: string;
}

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUserContext();
  const courseId = Number(params.id);

  const { data } = useSubjectWithCourse();

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
    refetch: refetchLessons,
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
      if (selectedLesson && videoRef.current) {
        const duration = videoRef.current.duration;
        if (duration) {
          const percent = Math.min(100, (position / duration) * 100);
          updateProgress(selectedLesson.id, position, duration);

          // Auto-complete at 90%
          if (percent >= 90 && !isCompleted(selectedLesson.id)) {
            markComplete(selectedLesson.id);
          }
        }
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
  const [pdfMaterials, setPdfMaterials] = useState<PdfMaterial[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);

  // Seek to last position when lesson changes
  useEffect(() => {
    if (videoRef.current && selectedLesson) {
      const lastPosition = getLastPosition(selectedLesson.id);
      if (lastPosition > 0) {
        videoRef.current.currentTime = lastPosition;
      }
    }
  }, [selectedLesson?.id, getLastPosition]);

  // Fetch PDF materials when lesson changes
  useEffect(() => {
    const fetchPdfMaterials = async () => {
      if (!selectedLesson) {
        setPdfMaterials([]);
        return;
      }

      setLoadingPdfs(true);
      try {
        const result = await pdfAPI.getByLesson(selectedLesson.id);
        setPdfMaterials(result.data || []);
      } catch (error) {
        console.error("Failed to load PDF materials:", error);
        setPdfMaterials([]);
      } finally {
        setLoadingPdfs(false);
      }
    };

    fetchPdfMaterials();
  }, [selectedLesson?.id]);

  const handleLessonSelect = (lesson: Lesson) => {
    selectLesson(lesson);
    setShowLessonList(false);
  };

  const loading = courseLoading || lessonsLoading;
  const isOwner = user?.id === course?.user_id || user?.role === "admin";

  // Filter lessons - owners see all, others see only published
  const visibleLessons = isOwner ? lessons : lessons.filter((l) => l.published);

  // Helper function to get full video URL
  const getFullVideoUrl = (videoUrl: string | null) => {
    if (!videoUrl) return null;

    // If URL is already absolute (starts with http/https), return as is
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
      return videoUrl;
    }

    // Otherwise, prepend the API base URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${apiUrl}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`;
  };

  // Helper function to get full PDF URL
  const getFullPdfUrl = (fileUrl: string) => {
    if (!fileUrl) return "";

    // If URL is already absolute (starts with http/https), return as is
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    // Otherwise, prepend the API base URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${apiUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  };

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Үл мэдэгдэх хэмжээ";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Сургалт ачааллаж байна...</p>
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
            <p className="font-semibold">Алдаа</p>
            <p>{courseError || "Сургалт олдсонгүй"}</p>
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
        {/* Back Button & Management */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm md:text-base">Буцах</span>
          </button>

          {/* Show Manage button if owner */}
          {isOwner && (
            <ManageLessonsDialog
              courseId={courseId}
              lessons={lessons}
              onLessonsUpdate={refetchLessons}
              formatDuration={formatDuration}
            />
          )}
        </div>

        {/* Mobile: Show Lessons Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowLessonList(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-between hover:bg-blue-700 transition-colors"
          >
            <span className="font-medium">
              Хичээлүүд ({visibleLessons.length} хичээл)
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
                  src={getFullVideoUrl(selectedLesson.video_url) || ""}
                  controls
                  className="w-full h-full"
                  controlsList="nodownload"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={(e) => {
                    console.error("Video error:", e);
                    console.error(
                      "Video URL:",
                      getFullVideoUrl(selectedLesson.video_url),
                    );
                  }}
                >
                  Таны браузер видео дэмжихгүй байна.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center px-4">
                    <PlayCircle
                      size={48}
                      className="mx-auto mb-4 opacity-50 md:w-16 md:h-16"
                    />
                    <p className="text-sm md:text-lg">
                      Хичээл сонгож суралцаж эхлээрэй
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Lesson Info */}
            {selectedLesson && (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    {selectedLesson.lesson_order}
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    Хичээл
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {selectedLesson.title}
                  </h2>
                  {isCompleted(selectedLesson.id) && (
                    <span className="flex items-center gap-1 text-green-600 text-sm whitespace-nowrap">
                      <CheckCircle size={18} />
                      Дууссан
                    </span>
                  )}
                </div>
                {selectedLesson.description && (
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    {selectedLesson.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatDuration(selectedLesson.video_duration)}</span>
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
                    <h3 className="text-lg font-semibold mb-3">
                      Хичээлийн тэмдэглэл
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {selectedLesson.text}
                    </div>
                  </div>
                )}

                {/* PDF Materials */}
                {(pdfMaterials.length > 0 || loadingPdfs) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      PDF Материалууд
                    </h3>
                    {loadingPdfs ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pdfMaterials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {material.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(material.file_size)} •{" "}
                                  {new Date(
                                    material.uploaded_at,
                                  ).toLocaleDateString("mn-MN")}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                window.open(
                                  getFullPdfUrl(material.file_url),
                                  "_blank",
                                )
                              }
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="h-4 w-4" />
                              <span>Татах</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Course Overview */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                Сургалтын тухай
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                {course.description || "Тайлбар байхгүй байна."}
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="mx-auto mb-2 text-blue-600" size={20} />
                  <div className="text-xl md:text-2xl font-bold text-gray-900">
                    {visibleLessons.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Хичээл</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                  <Clock className="mx-auto mb-2 text-green-600" size={20} />
                  <div className="text-xl md:text-2xl font-bold text-gray-900">
                    {totalFormatted}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Хугацаа
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg">
                  <User className="mx-auto mb-2 text-purple-600" size={20} />
                  <div className="text-xs md:text-sm font-medium text-gray-900 truncate px-1">
                    {user?.name || "Багш"}
                  </div>
                  <div className="text-xs text-gray-600">Багш</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
                  <BookOpen
                    className="mx-auto mb-2 text-orange-600"
                    size={20}
                  />
                  <div className="text-xs md:text-sm font-medium text-gray-900 truncate px-1">
                    {data[0]?.subject?.title}
                  </div>
                  <div className="text-xs text-gray-600">Сэдэв</div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Lessons List (Sidebar) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Хичээлүүд</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {visibleLessons.length} хичээл • {totalFormatted}
                </p>
              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {visibleLessons.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Одоогоор хичээл байхгүй байна</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {visibleLessons.map((lesson) => (
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
                <h3 className="text-lg font-bold text-gray-900">Хичээлүүд</h3>
                <p className="text-sm text-gray-600">
                  {visibleLessons.length} хичээл • {totalFormatted}
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
                {visibleLessons.map((lesson) => (
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
        {/* Lesson Number Badge */}
        <div
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center font-bold text-base ${
            isSelected
              ? "text-blue-600"
              : isCompleted
                ? "text-green-600"
                : "text-gray-600"
          }`}
        >
          {lesson.lesson_order}.
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
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
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
            {lesson.published && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={12} />
                Нийтлэгдсэн
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default CourseDetailPage;
