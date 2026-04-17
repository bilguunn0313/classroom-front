import { useQuery } from "@tanstack/react-query";
import { Subject } from "@/types/schema.types";
import { subjectAPI } from "@/lib/subject";

export function useSubjects() {
  const query = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await subjectAPI.getAll();
      if (!response.success) throw new Error("Failed to fetch subjects");
      return response.data as Subject[];
    },
  });

  return {
    subjects: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
