import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course, Lesson } from "@/types/schema.types";
import { courseAPI } from "@/lib/course";
import { lessonAPI } from "@/lib/lesson";

export function useCourseDetail(courseId: number) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const courseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseAPI.getById(courseId);
      if (!response.success) throw new Error("Failed to fetch course");
      return response.data as Course;
    },
    enabled: !!courseId,
  });

  const lessonsQuery = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const response = await lessonAPI.getByCourse(courseId);
      if (!response.success) throw new Error("Failed to fetch lessons");
      return (response.data as Lesson[]).sort(
        (a, b) => a.lesson_order - b.lesson_order
      );
    },
    enabled: !!courseId,
  });

  // Auto-select first lesson when data loads
  useEffect(() => {
    if (lessonsQuery.data?.length && !selectedLesson) {
      setSelectedLesson(lessonsQuery.data[0]);
    }
  }, [lessonsQuery.data, selectedLesson]);

  return {
    course: courseQuery.data ?? null,
    lessons: lessonsQuery.data ?? [],
    selectedLesson,
    loading: courseQuery.isPending || lessonsQuery.isPending,
    error:
      courseQuery.error?.message || lessonsQuery.error?.message || null,
    selectLesson: (lesson: Lesson) => setSelectedLesson(lesson),
    refetch: async () => {
      await Promise.all([courseQuery.refetch(), lessonsQuery.refetch()]);
    },
  };
}
