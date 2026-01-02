import { useState, useEffect } from "react";
import { Course, Lesson } from "@/types/schema.types";
import { courseAPI } from "@/lib/course";
import { lessonAPI } from "@/lib/lesson";

interface UseCourseDetailReturn {
  course: Course | null;
  lessons: Lesson[];
  selectedLesson: Lesson | null;
  loading: boolean;
  error: string | null;
  selectLesson: (lesson: Lesson) => void;
  refetch: () => Promise<void>;
}

export function useCourseDetail(courseId: number): UseCourseDetailReturn {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseResponse, lessonsResponse] = await Promise.all([
        courseAPI.getById(courseId),
        lessonAPI.getByCourse(courseId),
      ]);

      if (!courseResponse.success) {
        throw new Error("Failed to fetch course");
      }

      setCourse(courseResponse.data);

      if (lessonsResponse.success) {
        const sortedLessons = lessonsResponse.data.sort(
          (a: Lesson, b: Lesson) => a.lesson_order - b.lesson_order
        );
        setLessons(sortedLessons);

        // Auto-select first lesson
        if (sortedLessons.length > 0 && !selectedLesson) {
          setSelectedLesson(sortedLessons[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching course data:", err);
      setError(err instanceof Error ? err.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseAndLessons();
    }
  }, [courseId]);

  const selectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  return {
    course,
    lessons,
    selectedLesson,
    loading,
    error,
    selectLesson,
    refetch: fetchCourseAndLessons,
  };
}
