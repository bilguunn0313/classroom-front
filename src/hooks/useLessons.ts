import { lessonAPI } from "@/lib/lesson";
import { Lesson } from "@/types/schema.types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface useLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectedLesson: Lesson | null;
  selectLesson: (lesson: Lesson) => void;
  createLesson: (data: {
    courseId: number;
    title: string;
    description?: string | null;
    lessonOrder: number;
  }) => Promise<Lesson | null>;
  updateLesson: (
    id: number,
    data: { title: string; description?: string | null; lessonOrder: number }
  ) => Promise<Lesson | null>;
  deleteLesson: (id: number) => Promise<void>;
  publishLesson: (id: number) => Promise<void>;
}

export function useLessons(courseId: number): useLessonsReturn {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await lessonAPI.getByCourse(courseId);

      const sorted = res.data.sort(
        (a: Lesson, b: Lesson) => a.lesson_order - b.lesson_order
      );
      setLessons(sorted);

      if (!selectedLesson && sorted.length > 0) {
        setSelectedLesson(sorted[0]);
      }
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      setError(error.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedLesson]);

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const selectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
  }, []);

  const createLesson = useCallback(async (data: any) => {
    try {
      const res = await lessonAPI.create(data);
      setLessons((prev) => [...prev, res]);
      toast.success("Хичээл амжилттай нэмэгдлээ");
      return res;
    } catch (error: any) {
      toast.error("Хичээл нэмэхэд алдаа гарлаа");
      throw error;
    }
  }, []);

  const updateLesson = useCallback(
    async (id: number, data: any) => {
      try {
        const updated = await lessonAPI.update(id, data);
        setLessons((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...updated } : l))
        );
        if (selectedLesson?.id === id) {
          setSelectedLesson({ ...selectedLesson, ...updated });
        }
        toast.success("Хичээл амжилттай шинэчлэгдлээ");
        return updated;
      } catch (err: any) {
        toast.error(err.message || "Хичээл шинэчлэхэд алдаа гарлаа");
        throw err;
      }
    },
    [selectedLesson]
  );

  const deleteLesson = useCallback(async (id: number) => {
    const res = await lessonAPI.delete(id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
    toast.success("Хичээл амжилттай устгагдлаа");
  }, []);

  const publishLesson = useCallback(async (id: number) => {
    try {
      await lessonAPI.publish(id);
      setLessons((prev) =>
        prev.map((l) => (l.id === id ? { ...l, published: true } : l))
      );
      toast.success("Хичээл амжилттай нийтлэгдлээ");
    } catch (err: any) {
      toast.error(err.message || "Хичээл нийтлэхэд алдаа гарлаа");
      throw err;
    }
  }, []);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
    selectedLesson,
    selectLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    publishLesson,
  };
}
