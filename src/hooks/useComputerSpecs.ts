import { useQuery } from "@tanstack/react-query";
import {
  ComputerSpec,
  ComputerInspection,
  ComputerSpecHistory,
  OdooAsset,
} from "@/types/schema.types";
import { computerSpecsAPI } from "@/lib/computer-specs";

export function useComputerSpecs(
  page: number = 1,
  limit: number = 20,
  search?: string
) {
  const query = useQuery({
    queryKey: ["computer-specs", page, limit, search],
    queryFn: async () => {
      const response = await computerSpecsAPI.getAll(page, limit, search);
      if (!response.success)
        throw new Error("Мэдээлэл ачаалахад алдаа гарлаа");
      return { data: response.data as ComputerSpec[], total: response.total as number };
    },
  });

  return {
    specs: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useOdooAssets(categoryId = 12) {
  const query = useQuery({
    queryKey: ["odoo-assets", categoryId],
    queryFn: async () => {
      const response = await computerSpecsAPI.getOdooAssets(categoryId);
      if (!response.success)
        throw new Error("Төхөөрөмж ачаалахад алдаа гарлаа");
      return response.data as OdooAsset[];
    },
  });

  return {
    assets: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useSpecifiedAssetIds() {
  const query = useQuery({
    queryKey: ["specified-asset-ids"],
    queryFn: async () => {
      const response = await computerSpecsAPI.getSpecifiedIds();
      if (!response.success) return [];
      return response.data as number[];
    },
  });

  return {
    specifiedIds: query.data ?? [],
    loading: query.isPending,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useComputerInspections(
  page: number = 1,
  limit: number = 20,
  search?: string
) {
  const query = useQuery({
    queryKey: ["computer-inspections", page, limit, search],
    queryFn: async () => {
      const response = await computerSpecsAPI.getInspections(
        page,
        limit,
        search
      );
      if (!response.success)
        throw new Error("Мэдээлэл ачаалахад алдаа гарлаа");
      return { data: response.data as ComputerInspection[], total: response.total as number };
    },
  });

  return {
    inspections: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useInspectionHistory(
  specId: number | null,
  page: number = 1,
  limit: number = 20
) {
  const query = useQuery({
    queryKey: ["inspection-history", specId, page, limit],
    queryFn: async () => {
      const response = await computerSpecsAPI.getInspectionHistory(
        specId!,
        page,
        limit
      );
      if (!response.success)
        throw new Error("Мэдээлэл ачаалахад алдаа гарлаа");
      return { data: response.data as ComputerInspection[], total: response.total as number };
    },
    enabled: !!specId,
  });

  return {
    inspections: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useSpecHistory(
  specId: number | null,
  page: number = 1,
  limit: number = 20
) {
  const query = useQuery({
    queryKey: ["spec-history", specId, page, limit],
    queryFn: async () => {
      const response = await computerSpecsAPI.getSpecHistory(
        specId!,
        page,
        limit
      );
      if (!response.success)
        throw new Error("Мэдээлэл ачаалахад алдаа гарлаа");
      return { data: response.data as ComputerSpecHistory[], total: response.total as number };
    },
    enabled: !!specId,
  });

  return {
    history: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
