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
        const [courseResponse, lessonsResponse] = await Promise.all([
          courseAPI.getById(courseId),
          lessonAPI.getByCourse(courseId),
        ]);

        const courseData = courseResponse?.data || courseResponse;
        const lessonsArray = lessonsResponse?.data || lessonsResponse;

        if (courseData.user_id !== user?.id && user?.role !== "admin") {
          toast.error("Та энэ сургалтыг удирдах эрхгүй байна");
          router.push("/my-courses");
          return;
        }

        setCourse(courseData);
        setLessons(
          lessonsArray.sort(
            (a: Lesson, b: Lesson) => a.lesson_order - b.lesson_order,
          ),
        );
      } catch (error) {
        toast.error("Сургалтын мэдээлэл ачаалахад алдаа гарлаа");
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
      toast.error("Хичээл шинэчлэхэд алдаа гарлаа");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await lessonAPI.delete(lessonId);
      setLessons(lessons.filter((l) => l.id !== lessonId));
      toast.success("Хичээл амжилттай устгагдлаа");
    } catch (error) {
      toast.error("Хичээл устгахад алдаа гарлаа");
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      if (lesson.published) {
        toast.error("Нийтлэгдсэн хичээлийг буцааж хаах боломжгүй");
        return;
      }
      await lessonAPI.publish(lesson.id);
      setLessons(
        lessons.map((l) =>
          l.id === lesson.id ? { ...l, published: true } : l,
        ),
      );
      toast.success("Хичээл амжилттай нийтлэгдлээ");
    } catch (error) {
      toast.error("Хичээл нийтлэхэд алдаа гарлаа");
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
        <div className="min-h-screen bg-page-bg flex flex-col">
          <Header />
          <div className="container mx-auto px-4 py-12 flex justify-center flex-grow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-page-bg flex flex-col">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow">
          <div className="max-w-5xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/my-courses")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Буцах
            </Button>

            <div className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Хичээлүүд
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">{course?.title}</p>
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
                  <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-brand-800">
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
