import { useQuery } from "@tanstack/react-query";
import { courseAPI } from "@/lib/course";
import { subjectAPI } from "@/lib/subject";
import { Course, Subject } from "@/types/schema.types";

interface SubjectWithCourse {
  subject: Subject;
  course: Course[];
  publishedCourses: Course[];
}

export function useSubjectWithCourse() {
  const query = useQuery({
    queryKey: ["subjects-with-courses"],
    queryFn: async () => {
      const [subjectResponse, coursesResponse] = await Promise.all([
        subjectAPI.getAll(),
        courseAPI.getAllPublished(),
      ]);

      if (!subjectResponse.success) throw new Error("Failed to fetch subjects");

      const subjects: Subject[] = subjectResponse.data;
      const allCourses: Course[] = coursesResponse.data || [];

      const subjectsWithCourses: SubjectWithCourse[] = subjects.map(
        (subject) => {
          const courses = allCourses.filter(
            (c) => c.subject_id === subject.id
          );
          const publishedCourses = courses.filter((c) => c.published);
          return { subject, course: courses, publishedCourses };
        }
      );

      return subjectsWithCourses.filter((item) => item.course.length > 0);
    },
  });

  return {
    data: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
