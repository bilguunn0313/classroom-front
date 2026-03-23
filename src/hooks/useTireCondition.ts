import { useState, useEffect } from "react";
import { TireCondition } from "@/types/schema.types";
import { tireConditionAPI } from "@/lib/tire-condition";

interface UseTireConditionRecordsReturn {
  records: TireCondition[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTireConditionRecords(
  carId: number | null,
  year: number,
  month: number
): UseTireConditionRecordsReturn {
  const [records, setRecords] = useState<TireCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    if (!carId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await tireConditionAPI.getMonthly(carId, year, month);
      if (response.success) {
        setRecords(response.data);
      } else {
        throw new Error("Failed to fetch tire condition records");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load tire condition records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [carId, year, month]);

  return { records, loading, error, refetch: fetchRecords };
}

interface UseLatestTireConditionsReturn {
  records: TireCondition[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLatestTireConditions(): UseLatestTireConditionsReturn {
  const [records, setRecords] = useState<TireCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tireConditionAPI.getLatest();
      if (response.success) {
        setRecords(response.data);
      } else {
        throw new Error("Failed to fetch latest tire conditions");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load latest tire conditions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return { records, loading, error, refetch: fetchRecords };
}
