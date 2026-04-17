import { useQuery } from "@tanstack/react-query";
import { OdometerReading } from "@/types/schema.types";
import { odometerAPI } from "@/lib/odometer";

export function useOdometerRecords(
  carId: number | null,
  year: number,
  month: number
) {
  const query = useQuery({
    queryKey: ["odometer-records", carId, year, month],
    queryFn: async () => {
      const response = await odometerAPI.getMonthly(carId!, year, month);
      if (!response.success)
        throw new Error("Failed to fetch odometer records");
      return response.data as OdometerReading[];
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

export function useLatestOdometer() {
  const query = useQuery({
    queryKey: ["latest-odometer"],
    queryFn: async () => {
      const response = await odometerAPI.getLatest();
      if (!response.success)
        throw new Error("Failed to fetch latest odometer readings");
      return response.data as OdometerReading[];
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
