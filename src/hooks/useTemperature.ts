import { useQuery } from "@tanstack/react-query";
import { TemperatureRecord } from "@/types/schema.types";
import { temperatureAPI } from "@/lib/temperature";

export function useTemperatureRecords(year: number, month: number) {
  const query = useQuery({
    queryKey: ["temperature-records", year, month],
    queryFn: async () => {
      const response = await temperatureAPI.getMonthly(year, month);
      if (!response.success)
        throw new Error("Failed to fetch temperature records");
      return response.data as TemperatureRecord[];
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

export function useTodayTemperature() {
  const query = useQuery({
    queryKey: ["today-temperature"],
    queryFn: async () => {
      const response = await temperatureAPI.getToday();
      if (!response.success)
        throw new Error("Failed to fetch today's temperature");
      return response.data as TemperatureRecord;
    },
  });

  return {
    record: query.data ?? null,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
