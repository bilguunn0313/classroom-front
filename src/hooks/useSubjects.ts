import { useState, useEffect } from "react";

import { Subject } from "@/types/schema.types";
import { subjectAPI } from "@/lib/subject";

interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubjects(): UseSubjectsReturn {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subjectAPI.getAll();

      if (response.success) {
        setSubjects(response.data);
      } else {
        throw new Error("Failed to fetch subjects");
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError(err instanceof Error ? err.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
  };
}
