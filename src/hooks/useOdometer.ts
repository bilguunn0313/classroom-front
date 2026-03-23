import { useState, useEffect } from "react";
import { OdometerReading } from "@/types/schema.types";
import { odometerAPI } from "@/lib/odometer";

interface UseOdometerRecordsReturn {
  records: OdometerReading[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOdometerRecords(
  carId: number | null,
  year: number,
  month: number
): UseOdometerRecordsReturn {
  const [records, setRecords] = useState<OdometerReading[]>([]);
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
      const response = await odometerAPI.getMonthly(carId, year, month);
      if (response.success) {
        setRecords(response.data);
      } else {
        throw new Error("Failed to fetch odometer records");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load odometer records"
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

interface UseLatestOdometerReturn {
  records: OdometerReading[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLatestOdometer(): UseLatestOdometerReturn {
  const [records, setRecords] = useState<OdometerReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await odometerAPI.getLatest();
      if (response.success) {
        setRecords(response.data);
      } else {
        throw new Error("Failed to fetch latest odometer readings");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load latest odometer readings"
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
