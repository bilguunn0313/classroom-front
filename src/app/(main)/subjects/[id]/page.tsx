"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, User, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { subjectAPI } from "@/lib/subject";
import { courseAPI } from "@/lib/course";

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  user_name: string;
  published: boolean;
}

interface Subject {
  id: number;
  title: string;
  description: string | null;
}

export default function SubjectCoursesPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = parseInt(params.id as string);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get full URL (handles both relative and absolute URLs)
  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${backendUrl}${url}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subject details and courses
        const [subjectResult, coursesResult] = await Promise.all([
          subjectAPI.getById(subjectId),
          courseAPI.getBySubject(subjectId),
        ]);

        setSubject(subjectResult.data || subjectResult);

        // Filter only published courses for students
        const allCourses = coursesResult.data || coursesResult;
        const publishedCourses = (
          Array.isArray(allCourses) ? allCourses : []
        ).filter((course: Course) => course.published);
        setCourses(publishedCourses);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Мэдээлэл ачааллахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchData();
    }
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-page-bg flex flex-col">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-grow">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/subjects")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Бүх сэдвүүд</span>
          </button>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                  {subject?.title || "Сэдэв"}
                </h1>
                {subject?.description && (
                  <p className="text-sm text-muted-foreground">{subject.description}</p>
                )}
              </div>

              {courses.length === 0 ? (
                <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-brand-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Одоогоор сургалт байхгүй байна
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Энэ сэдэвт сургалт нэмэгдэх болно
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                        {course.thumbnail_url ? (
                          <img
                            src={getFullUrl(course.thumbnail_url)}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-white opacity-50" />
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                          {course.title}
                        </h3>

                        {course.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {course.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span className="truncate">{course.user_name}</span>
                          </div>
                          <ArrowRight size={16} className="text-brand-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
