"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CreateCourseDialog } from "@/components/CreateCourseDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserContext } from "@/lib/userProvider";
import { courseAPI } from "@/lib/course";
import { Course } from "@/types/schema.types";
import { Pencil, Trash2, Eye, Users, BookOpen, Plus, ArrowLeft } from "lucide-react";
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
import DataTable, { Column } from "@/components/admin/DataTable";
import { format } from "date-fns";

interface CourseWithEnrollment extends Course {
  enrollment_count?: number;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<
    CourseWithEnrollment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states

  const fetchMyCourses = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await courseAPI.getByUser(user.id);
      const coursesData: CourseWithEnrollment[] = data.data || [];

      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      if (error.response?.status !== 404) {
        toast.error("Сургалтуудыг ачаалахад алдаа гарлаа");
      } else {
        setCourses([]);
        setFilteredCourses([]);
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
      setIsDeleting(true);
      await courseAPI.delete(id);
      toast.success("Сургалт амжилттай устгагдлаа");
      fetchMyCourses();
    } catch (error) {
      toast.error("Сургалт устгахад алдаа гарлаа");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await courseAPI.publish(id);
      toast.success("Сургалт амжилттай нийтлэгдлээ");
      fetchMyCourses();
    } catch (error) {
      toast.error("Сургалт нийтлэхэд алдаа гарлаа");
    }
  };

  const columns: Column<CourseWithEnrollment>[] = [
    {
      key: "title",
      label: "Сургалт",
      render: (course) => (
        <div className="min-w-[200px]">
          <Button
            variant="link"
            onClick={() => router.push(`/course/${course.id}`)}
            className="cursor-pointer"
          >
            <p className="font-medium text-foreground">{course.title}</p>
          </Button>
          {course.description && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {course.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "published",
      label: "Төлөв",
      render: (course) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            course.published
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {course.published ? "Нийтлэгдсэн" : "Ноорог"}
        </span>
      ),
    },
    {
      key: "enrollment_count",
      label: "Суралцагчид",
      render: (course) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{course.enrollment_count || 0}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Үүсгэсэн",
      render: (course) =>
        course.created_at
          ? format(new Date(course.created_at), "yyyy-MM-dd")
          : "-",
    },
    {
      key: "actions",
      label: "Үйлдэл",
      render: (course) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/my-courses/${course.id}/students`)}
            title="Суралцагчид харах"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/course/${course.id}/edit`)}
            title="Засах"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {!course.published && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePublish(course.id)}
              title="Нийтлэх"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(course.id)}
            title="Устгах"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const selectedCourse = courses.find((c) => c.id === deleteId);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-page-bg flex flex-col">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-grow">
          {/* Header */}
          <button
            onClick={() => router.push('/course')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Сургалтууд</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Миний сургалтууд
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Таны бүтээсэн сургалтуудыг удирдах
              </p>
            </div>
            <CreateCourseDialog onSuccess={fetchMyCourses} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Нийт сургалт</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.filter((c) => c.published).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Нийтлэгдсэн</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.reduce(
                      (sum, c) => sum + (c.enrollment_count || 0),
                      0,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Нийт суралцагчид</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            data={filteredCourses}
            columns={columns}
            loading={loading}
            emptyMessage="Сургалт олдсонгүй. Шинэ сургалт үүсгэж эхлээрэй!"
          />
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
                "{selectedCourse?.title}" сургалтыг устгахдаа итгэлтэй байна уу?
                Энэ үйлдлийг буцаах боломжгүй.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Цуцлах
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Устгаж байна..." : "Устгах"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
