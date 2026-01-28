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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
        <Header />

        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Миний суралцаж буй сургалтууд
              </h1>
              <p className="text-gray-600">
                Таны элссэн бүх сургалтууд энд харагдана
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Одоогоор элссэн сургалт байхгүй байна
                </h3>
                <p className="text-gray-600 mb-6">
                  "Бүх сургалтууд" хэсгээс сонирхолтой сургалтаа олж элсээрэй
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сургалт хайх
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/course/${course.id}`)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
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
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {course.subject_name}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span className="truncate">{course.user_name}</span>
                        </div>
                        <ArrowRight size={16} className="text-blue-600" />
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
