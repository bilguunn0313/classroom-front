"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";
import { courseAPI } from "@/lib/course";
import { lessonAPI } from "@/lib/lesson";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Video } from "lucide-react";
import { toast } from "sonner";
import { DraggableLessonList } from "@/components/lesson/DraggableLessonList";
import { CreateEditLessonDialog } from "@/components/lesson/CreateEditLessonDialog";
import { Lesson } from "@/types/schema.types";

interface Course {
  id: number;
  title: string;
  user_id: number;
}

export default function ManageLessonsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const { user } = useUserContext();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, lessonsData] = await Promise.all([
          courseAPI.getById(courseId),
          lessonAPI.getByCourse(courseId),
        ]);

        if (courseData.user_id !== user?.id && user?.role !== "admin") {
          toast.error("You don't have permission to manage this course");
          router.push("/my-courses");
          return;
        }

        setCourse(courseData);
        setLessons(
          lessonsData.sort(
            (a: Lesson, b: Lesson) => a.lesson_order - b.lesson_order,
          ),
        );
      } catch (error) {
        toast.error("Failed to load course data");
        router.push("/my-courses");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && user) {
      fetchData();
    }
  }, [courseId, user, router]);

  const handleLessonsReorder = (reorderedLessons: Lesson[]) => {
    setLessons(reorderedLessons);
  };

  const handleLessonUpdate = async () => {
    try {
      const lessonsData = await lessonAPI.getByCourse(courseId);
      setLessons(
        lessonsData.sort(
          (a: Lesson, b: Lesson) => a.lesson_order - b.lesson_order,
        ),
      );
    } catch (error) {
      toast.error("Failed to refresh lessons");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await lessonAPI.delete(lessonId);
      setLessons(lessons.filter((l) => l.id !== lessonId));
      toast.success("Lesson deleted successfully");
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      if (lesson.published) {
        toast.error("Cannot unpublish lessons yet");
        return;
      }
      await lessonAPI.publish(lesson.id);
      setLessons(
        lessons.map((l) =>
          l.id === lesson.id ? { ...l, published: true } : l,
        ),
      );
      toast.success("Lesson published successfully");
    } catch (error) {
      toast.error("Failed to publish lesson");
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
          <Header />
          <div className="container mx-auto px-4 py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/my-courses")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Буцах
            </Button>

            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Хичээлүүд
                  </h1>
                  <p className="text-gray-600 mt-1">{course?.title}</p>
                </div>
                <CreateEditLessonDialog
                  courseId={courseId}
                  onSuccess={handleLessonUpdate}
                  trigger={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Хичээл нэмэх
                    </Button>
                  }
                />
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Одоогоор хичээл байхгүй байна
                  </p>
                  <CreateEditLessonDialog
                    courseId={courseId}
                    onSuccess={handleLessonUpdate}
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Анхны хичээлээ нэмэх
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Зөвлөгөө:</strong> Хичээлүүдийг чирж дарааллыг
                      өөрчлөх боломжтой
                    </p>
                  </div>

                  <DraggableLessonList
                    lessons={lessons}
                    courseId={courseId}
                    onLessonsReorder={handleLessonsReorder}
                    onEditLesson={(lessonId) =>
                      router.push(
                        `/course/${courseId}/lessons/${lessonId}/edit`,
                      )
                    }
                    onDeleteLesson={handleDeleteLesson}
                    onTogglePublish={handleTogglePublish}
                    formatDuration={formatDuration}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
