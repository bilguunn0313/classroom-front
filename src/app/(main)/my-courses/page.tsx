"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/Card";
import { CreateCourseDialog } from "@/components/CreateCourseDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";
import { courseAPI } from "@/lib/course";
import { Course } from "@/types/schema.types";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchMyCourses = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await courseAPI.getByUser(user.id);
      console.log("API RESPONSE:", data);
      setCourses(data.data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      // Don't show error if it's just empty courses
      if (error.response?.status !== 404) {
        toast.error("Failed to load courses");
      } else {
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyCourses();
    }
  }, [user?.id]);

  const handleDelete = async (id: number) => {
    try {
      await courseAPI.delete(id);
      toast.success("Course deleted successfully");
      fetchMyCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    } finally {
      setDeleteId(null);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await courseAPI.publish(id);
      toast.success("Course published successfully");
      fetchMyCourses();
    } catch (error) {
      toast.error("Failed to publish course");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Миний сургалтууд
              </h1>
              <p className="text-gray-600 mt-2">
                Таны бүтээсэн сургалтуудыг удирдах
              </p>
            </div>
            <CreateCourseDialog onSuccess={fetchMyCourses} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Сургалт олдсонгүй
                </h3>
                <p className="text-gray-600 mb-6">
                  Та одоогоор сургалт үүсгээгүй байна. Эхний сургалтаа үүсгэж
                  эхлээрэй!
                </p>
                <CreateCourseDialog onSuccess={fetchMyCourses} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="relative group">
                  <CourseCard
                    course={course}
                    onClick={() => router.push(`/course/${course.id}`)}
                  />

                  {/* Action buttons overlay */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/course/${course.id}/edit`);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(course.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    {course.published ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Сургалт устгах уу?</AlertDialogTitle>
              <AlertDialogDescription>
                Энэ үйлдлийг буцаах боломжгүй. Сургалт болон түүнтэй холбоотой
                бүх өгөгдөл устах болно.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Цуцлах</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Устгах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
