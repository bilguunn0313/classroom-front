import api from "./axios";

export interface CreateComputerSpecPayload {
  odooAssetId: number;
  odooAssetCode?: string | null;
  odooAssetName?: string | null;
  descr?: string | null;
  notes?: string | null;
}

export interface UpdateComputerSpecPayload {
  odooAssetCode?: string | null;
  odooAssetName?: string | null;
  descr?: string | null;
  notes?: string | null;
}

export const computerSpecsAPI = {
  getAll: async (page = 1, limit = 20, search?: string) => {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const res = await api.get("/assets/specs", { params });
    return res.data;
  },

  getSpecifiedIds: async () => {
    const res = await api.get("/assets/specs/ids");
    return res.data;
  },

  getByOdooId: async (odooAssetId: number) => {
    const res = await api.get(`/assets/specs/${odooAssetId}`);
    return res.data;
  },

  getByCode: async (code: string) => {
    const res = await api.get(`/assets/specs/code/${code}`);
    return res.data;
  },

  create: async (data: CreateComputerSpecPayload) => {
    const res = await api.post("/assets/specs", data);
    return res.data;
  },

  update: async (id: number, data: UpdateComputerSpecPayload) => {
    const res = await api.put(`/assets/specs/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/assets/specs/${id}`);
    return res.data;
  },

  // Fetch Odoo assets (existing endpoint)
  getOdooAssets: async (categoryId = 12) => {
    const res = await api.get("/assets", { params: { category_id: categoryId } });
    return res.data;
  },

  // ── Computer Inspections ──
  getInspections: async (page = 1, limit = 20, search?: string) => {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const res = await api.get("/assets/inspections", { params });
    return res.data;
  },

  getInspectionHistory: async (specId: number, page = 1, limit = 20) => {
    const res = await api.get(`/assets/inspections/spec/${specId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  createInspection: async (data: {
    computerSpecId: number;
    inspectionDate: string;
    status: "pass" | "fail";
    notes?: string | null;
  }) => {
    const res = await api.post("/assets/inspections", data);
    return res.data;
  },

  updateInspection: async (
    id: number,
    data: {
      inspectionDate?: string;
      status?: "pass" | "fail";
      notes?: string | null;
    }
  ) => {
    const res = await api.put(`/assets/inspections/${id}`, data);
    return res.data;
  },

  deleteInspection: async (id: number) => {
    const res = await api.delete(`/assets/inspections/${id}`);
    return res.data;
  },
};
