import api from "./axios";
import { CreateVehicleData, UpdateVehicleData } from "@/types/schema.types";

export const fleetAPI = {
  getVehicles: async () => {
    const res = await api.get("/fleet/vehicles");
    return res.data;
  },
  getVehicle: async (id: number) => {
    const res = await api.get(`/fleet/vehicles/${id}`);
    return res.data;
  },
  createVehicle: async (data: CreateVehicleData) => {
    const res = await api.post("/fleet/vehicles", data);
    return res.data;
  },
  updateVehicle: async (id: number, data: UpdateVehicleData) => {
    const res = await api.put(`/fleet/vehicles/${id}`, data);
    return res.data;
  },
  deleteVehicle: async (id: number) => {
    const res = await api.delete(`/fleet/vehicles/${id}`);
    return res.data;
  },
  getDepartments: async () => {
    const res = await api.get("/fleet/departments");
    return res.data;
  },
  getStates: async () => {
    const res = await api.get("/fleet/states");
    return res.data;
  },
  getModels: async () => {
    const res = await api.get("/fleet/models");
    return res.data;
  },
};
