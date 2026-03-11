import { useState, useEffect } from "react";
import { TemperatureRecord } from "@/types/schema.types";
import { temperatureAPI } from "@/lib/temperature";

interface UseTemperatureRecordsReturn {
  records: TemperatureRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTemperatureRecords(
  year: number,
  month: number
): UseTemperatureRecordsReturn {
  const [records, setRecords] = useState<TemperatureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await temperatureAPI.getMonthly(year, month);
      if (response.success) {
        setRecords(response.data);
      } else {
        throw new Error("Failed to fetch temperature records");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load temperature records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [year, month]);

  return { records, loading, error, refetch: fetchRecords };
}

interface UseTodayTemperatureReturn {
  record: TemperatureRecord | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTodayTemperature(): UseTodayTemperatureReturn {
  const [record, setRecord] = useState<TemperatureRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await temperatureAPI.getToday();
      if (response.success) {
        setRecord(response.data);
      } else {
        throw new Error("Failed to fetch today's temperature");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load temperature"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, []);

  return { record, loading, error, refetch: fetchRecord };
}
