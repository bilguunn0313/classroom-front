import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonAPI } from "@/lib/lesson";
import { Lesson } from "@/types/schema.types";
import { toast } from "sonner";

export function useLessons(courseId: number) {
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const query = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      try {
        const response = await lessonAPI.getByCourse(courseId);
        const lessonsData = response?.data || response || [];
        return (Array.isArray(lessonsData) ? lessonsData : []).sort(
          (a: Lesson, b: Lesson) => a.lesson_order - b.lesson_order
        );
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: !!courseId,
  });

  const lessons = query.data ?? [];

  // Auto-select first lesson when data loads
  useEffect(() => {
    if (lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessons, selectedLesson]);

  const createMutation = useMutation({
    mutationFn: (data: {
      courseId: number;
      title: string;
      description?: string | null;
      lessonOrder: number;
    }) => lessonAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      toast.success("Хичээл амжилттай нэмэгдлээ");
    },
    onError: () => {
      toast.error("Хичээл нэмэхэд алдаа гарлаа");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title: string; description?: string | null; lessonOrder: number };
    }) => lessonAPI.update(id, data),
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      if (selectedLesson?.id === id) {
        setSelectedLesson((prev) => (prev ? { ...prev, ...updated } : prev));
      }
      toast.success("Хичээл амжилттай шинэчлэгдлээ");
    },
    onError: (err: any) => {
      toast.error(err.message || "Хичээл шинэчлэхэд алдаа гарлаа");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lessonAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      toast.success("Хичээл амжилттай устгагдлаа");
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => lessonAPI.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      toast.success("Хичээл амжилттай нийтлэгдлээ");
    },
    onError: (err: any) => {
      toast.error(err.message || "Хичээл нийтлэхэд алдаа гарлаа");
    },
  });

  return {
    lessons,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
    selectedLesson,
    selectLesson: (lesson: Lesson) => setSelectedLesson(lesson),
    createLesson: async (data: {
      courseId: number;
      title: string;
      description?: string | null;
      lessonOrder: number;
    }) => {
      const result = await createMutation.mutateAsync(data);
      return result as Lesson;
    },
    updateLesson: async (
      id: number,
      data: { title: string; description?: string | null; lessonOrder: number }
    ) => {
      const result = await updateMutation.mutateAsync({ id, data });
      return result as Lesson;
    },
    deleteLesson: async (id: number) => {
      await deleteMutation.mutateAsync(id);
    },
    publishLesson: async (id: number) => {
      await publishMutation.mutateAsync(id);
    },
  };
}
