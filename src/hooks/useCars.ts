import { useQuery } from "@tanstack/react-query";
import { Car } from "@/types/schema.types";
import { carAPI } from "@/lib/car";

export function useCars() {
  const query = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const response = await carAPI.getAll();
      if (!response.success) throw new Error("Failed to fetch cars");
      return response.data as Car[];
    },
  });

  return {
    cars: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
