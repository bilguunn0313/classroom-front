"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/lib/userProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BookOpen, Clock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { enrollmentAPI } from "@/lib/enrollment";

interface EnrolledCourse {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  subject_name: string;
  user_name: string;
  enrolled_at: string;
}

export default function MyLearningPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
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
    const fetchEnrolledCourses = async () => {
      if (!user) return;

      try {
        const result = await enrollmentAPI.getMyCourses();
        setCourses(result.data || []);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        toast.error("Элссэн сургалтууд ачааллахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-page-bg flex flex-col">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-grow">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                Миний суралцаж буй сургалтууд
              </h1>
              <p className="text-sm text-muted-foreground">
                Таны элссэн бүх сургалтууд энд харагдана
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-brand-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Одоогоор элссэн сургалт байхгүй байна
                </h3>
                <p className="text-muted-foreground mb-6">
                  &quot;Бүх сургалтууд&quot; хэсгээс сонирхолтой сургалтаа олж элсээрэй
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Сургалт хайх
                </button>
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
                      <div className="mb-2">
                        <span className="inline-block bg-brand-50 text-brand-600 text-xs font-medium px-2.5 py-0.5 rounded">
                          {course.subject_name}
                        </span>
                      </div>

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
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
