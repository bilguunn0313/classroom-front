import { useQuery } from "@tanstack/react-query";
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

export function useCourse(courseId: number) {
  const query = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseAPI.getById(courseId);
      const courseData = response?.data || response;
      if (!courseData?.id) throw new Error("Invalid course data received");
      return courseData as Course;
    },
    enabled: !!courseId,
  });

  return {
    course: query.data ?? null,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
