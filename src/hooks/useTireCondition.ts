import { useQuery } from "@tanstack/react-query";
import { TireCondition } from "@/types/schema.types";
import { tireConditionAPI } from "@/lib/tire-condition";

export function useTireConditionRecords(
  carId: number | null,
  year: number,
  month: number
) {
  const query = useQuery({
    queryKey: ["tire-condition-records", carId, year, month],
    queryFn: async () => {
      const response = await tireConditionAPI.getMonthly(carId!, year, month);
      if (!response.success)
        throw new Error("Failed to fetch tire condition records");
      return response.data as TireCondition[];
    },
    enabled: !!carId,
  });

  return {
    records: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useLatestTireConditions() {
  const query = useQuery({
    queryKey: ["latest-tire-conditions"],
    queryFn: async () => {
      const response = await tireConditionAPI.getLatest();
      if (!response.success)
        throw new Error("Failed to fetch latest tire conditions");
      return response.data as TireCondition[];
    },
  });

  return {
    records: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
