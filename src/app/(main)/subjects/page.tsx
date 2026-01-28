"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { subjectAPI } from "@/lib/subject";

interface Subject {
  id: number;
  title: string;
  description: string | null;
  course_count?: number;
}

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const result = await subjectAPI.getAll();
        setSubjects(result.data || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Сэдвүүд ачааллахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Бүх сэдвүүд
            </h1>
            <p className="text-gray-600">
              Сонирхолтой сэдвээ сонгож сургалтуудыг үзээрэй
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Одоогоор сэдэв байхгүй байна
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/subjects/${subject.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {subject.title}
                  </h3>

                  {subject.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {subject.description}
                    </p>
                  )}

                  {subject.course_count !== undefined && (
                    <div className="text-sm text-blue-600 font-medium">
                      {subject.course_count} сургалт
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
