import { useQuery } from "@tanstack/react-query";
import {
  FleetVehicle,
  OdooDepartment,
  FleetVehicleState,
  FleetVehicleModel,
} from "@/types/schema.types";
import { fleetAPI } from "@/lib/fleet";

export function useFleetVehicles() {
  const query = useQuery({
    queryKey: ["fleet-vehicles"],
    queryFn: async () => {
      const response = await fleetAPI.getVehicles();
      if (!response.success) throw new Error("Failed to fetch vehicles");
      return response.data as FleetVehicle[];
    },
  });

  return {
    vehicles: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useDepartments() {
  const query = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await fleetAPI.getDepartments();
      if (!response.success) return [];
      return response.data as OdooDepartment[];
    },
  });

  return {
    departments: query.data ?? [],
    loading: query.isPending,
  };
}

export function useVehicleStates() {
  const query = useQuery({
    queryKey: ["vehicle-states"],
    queryFn: async () => {
      const response = await fleetAPI.getStates();
      if (!response.success) return [];
      return response.data as FleetVehicleState[];
    },
  });

  return {
    states: query.data ?? [],
    loading: query.isPending,
  };
}

export function useVehicleModels() {
  const query = useQuery({
    queryKey: ["vehicle-models"],
    queryFn: async () => {
      const response = await fleetAPI.getModels();
      if (!response.success) return [];
      return response.data as FleetVehicleModel[];
    },
  });

  return {
    models: query.data ?? [],
    loading: query.isPending,
  };
}
