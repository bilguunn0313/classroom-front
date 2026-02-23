import { courseAPI } from "@/lib/course";
import { subjectAPI } from "@/lib/subject";
import { Course, Subject } from "@/types/schema.types";
import { useEffect, useState } from "react";

interface SubjectWithCourse {
  subject: Subject;
  course: Course[];
  publishedCourses: Course[];
}

export function useSubjectWithCourse() {
  const [data, setData] = useState<SubjectWithCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 2 parallel calls instead of 1+N
      const [subjectResponse, coursesResponse] = await Promise.all([
        subjectAPI.getAll(),
        courseAPI.getAllPublished(),
      ]);

      if (!subjectResponse.success) {
        throw new Error("failed to fetch subjects");
      }

      const subjects: Subject[] = subjectResponse.data;
      const allCourses: Course[] = coursesResponse.data || [];

      // Group courses by subject_id on the frontend
      const subjectsWithCourses: SubjectWithCourse[] = subjects.map(
        (subject) => {
          const courses = allCourses.filter(
            (c) => c.subject_id === subject.id
          );
          const publishedCourses = courses.filter((c) => c.published);
          return { subject, course: courses, publishedCourses };
        }
      );

      const filtered = subjectsWithCourses.filter(
        (item) => item.course.length > 0
      );

      setData(filtered);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}
