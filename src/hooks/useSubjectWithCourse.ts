import { courseAPI } from "@/lib/course";
import { subjectAPI } from "@/lib/subject";
import { Course, Subject } from "@/types/schema.types";
import { useEffect, useState } from "react";

interface SubjectWithCourse {
  subject: Subject;
  course: Course[];
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

      const subjectResponse = await subjectAPI.getAll();

      if (!subjectResponse.success) {
        throw new Error("failed to fetch subjects");
      }

      const data = await Promise.all(
        subjectResponse.data.map(async (subject: Subject) => {
          try {
            const courseResponse = await courseAPI.getBySubject(subject.id);
            return {
              subject,
              course: courseResponse.success ? courseResponse.data : [],
            };
          } catch (error) {
            console.error(
              `Error fetching courses for subject ${subject.id}:`,
              error
            );
            return {
              subject,
              course: [],
            };
          }
        })
      );

      const filtered = data.filter((item) => item.courses?.length > 0);

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
