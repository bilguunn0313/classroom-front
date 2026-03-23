import { useState, useEffect } from "react";
import { Car } from "@/types/schema.types";
import { carAPI } from "@/lib/car";

interface UseCarsReturn {
  cars: Car[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCars(): UseCarsReturn {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await carAPI.getAll();
      if (response.success) {
        setCars(response.data);
      } else {
        throw new Error("Failed to fetch cars");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return { cars, loading, error, refetch: fetchCars };
}
