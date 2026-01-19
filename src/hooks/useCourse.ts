import { useState, useEffect, useCallback } from "react";
import { courseAPI } from "@/lib/course";

interface Course {
  id: number;
  title: string;
  description: string | null;
  subject_id: number;
  subject_name: string;
  user_id: number;
  user_name: string;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface UseCourseReturn {
  course: Course | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCourse(courseId: number): UseCourseReturn {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getById(courseId);

      // Handle different response structures from backend
      // Backend might return { success, data } or just the course object
      const courseData = response?.data || response;

      console.log("Course data loaded:", courseData); // Debug log

      if (!courseData || !courseData.id) {
        throw new Error("Invalid course data received");
      }

      setCourse(courseData);
    } catch (err: any) {
      console.error("Failed to fetch course:", err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [courseId]); // Only depend on courseId

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
  };
}
