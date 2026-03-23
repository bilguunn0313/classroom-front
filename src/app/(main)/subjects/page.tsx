"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-page-bg flex flex-col">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-grow">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/course')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Сургалтууд</span>
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
              Бүх сэдвүүд
            </h1>
            <p className="text-sm text-muted-foreground">
              Сонирхолтой сэдвээ сонгож сургалтуудыг үзээрэй
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-brand-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Одоогоор сэдэв байхгүй байна
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-card rounded-xl border border-border shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/subjects/${subject.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-brand-50 rounded-lg">
                      <BookOpen className="h-8 w-8 text-brand-600" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-brand-600 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {subject.title}
                  </h3>

                  {subject.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {subject.description}
                    </p>
                  )}

                  {subject.course_count !== undefined && (
                    <div className="text-sm text-brand-600 font-medium">
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
