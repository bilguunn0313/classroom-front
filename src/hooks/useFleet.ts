import { useState, useEffect } from "react";
import {
  FleetVehicle,
  OdooDepartment,
  FleetVehicleState,
  FleetVehicleModel,
} from "@/types/schema.types";
import { fleetAPI } from "@/lib/fleet";

interface UseFleetVehiclesReturn {
  vehicles: FleetVehicle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFleetVehicles(): UseFleetVehiclesReturn {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fleetAPI.getVehicles();
      if (response.success) {
        setVehicles(response.data);
      } else {
        throw new Error("Failed to fetch vehicles");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Тээврийн хэрэгсэл ачаалахад алдаа гарлаа"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return { vehicles, loading, error, refetch: fetchVehicles };
}

interface UseDepartmentsReturn {
  departments: OdooDepartment[];
  loading: boolean;
}

export function useDepartments(): UseDepartmentsReturn {
  const [departments, setDepartments] = useState<OdooDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fleetAPI.getDepartments();
        if (response.success) {
          setDepartments(response.data);
        }
      } catch {
        // Silently fail for dropdown data
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { departments, loading };
}

interface UseVehicleStatesReturn {
  states: FleetVehicleState[];
  loading: boolean;
}

export function useVehicleStates(): UseVehicleStatesReturn {
  const [states, setStates] = useState<FleetVehicleState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fleetAPI.getStates();
        if (response.success) {
          setStates(response.data);
        }
      } catch {
        // Silently fail for dropdown data
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { states, loading };
}

interface UseVehicleModelsReturn {
  models: FleetVehicleModel[];
  loading: boolean;
}

export function useVehicleModels(): UseVehicleModelsReturn {
  const [models, setModels] = useState<FleetVehicleModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await fleetAPI.getModels();
        if (response.success) {
          setModels(response.data);
        }
      } catch {
        // Silently fail for dropdown data
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { models, loading };
}
