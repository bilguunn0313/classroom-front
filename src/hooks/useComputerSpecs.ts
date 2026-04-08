import { useState, useEffect, useCallback } from "react";
import { ComputerSpec, ComputerInspection, OdooAsset } from "@/types/schema.types";
import { computerSpecsAPI } from "@/lib/computer-specs";

interface UseComputerSpecsReturn {
  specs: ComputerSpec[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useComputerSpecs(
  page: number = 1,
  limit: number = 20,
  search?: string,
): UseComputerSpecsReturn {
  const [specs, setSpecs] = useState<ComputerSpec[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await computerSpecsAPI.getAll(page, limit, search);
      if (response.success) {
        setSpecs(response.data);
        setTotal(response.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Мэдээлэл ачаалахад алдаа гарлаа",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs]);

  return { specs, total, loading, error, refetch: fetchSpecs };
}

interface UseOdooAssetsReturn {
  assets: OdooAsset[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOdooAssets(categoryId = 12): UseOdooAssetsReturn {
  const [assets, setAssets] = useState<OdooAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await computerSpecsAPI.getOdooAssets(categoryId);
      if (response.success) {
        setAssets(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Төхөөрөмж ачаалахад алдаа гарлаа",
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
}

interface UseSpecifiedAssetIdsReturn {
  specifiedIds: number[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useSpecifiedAssetIds(): UseSpecifiedAssetIdsReturn {
  const [specifiedIds, setSpecifiedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await computerSpecsAPI.getSpecifiedIds();
      if (response.success) {
        setSpecifiedIds(response.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIds();
  }, [fetchIds]);

  return { specifiedIds, loading, refetch: fetchIds };
}

interface UseComputerInspectionsReturn {
  inspections: ComputerInspection[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useComputerInspections(
  page: number = 1,
  limit: number = 20,
  search?: string
): UseComputerInspectionsReturn {
  const [inspections, setInspections] = useState<ComputerInspection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await computerSpecsAPI.getInspections(page, limit, search);
      if (response.success) {
        setInspections(response.data);
        setTotal(response.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Мэдээлэл ачаалахад алдаа гарлаа"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  return { inspections, total, loading, error, refetch: fetchInspections };
}

interface UseInspectionHistoryReturn {
  inspections: ComputerInspection[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInspectionHistory(
  specId: number | null,
  page: number = 1,
  limit: number = 20
): UseInspectionHistoryReturn {
  const [inspections, setInspections] = useState<ComputerInspection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!specId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await computerSpecsAPI.getInspectionHistory(specId, page, limit);
      if (response.success) {
        setInspections(response.data);
        setTotal(response.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Мэдээлэл ачаалахад алдаа гарлаа"
      );
    } finally {
      setLoading(false);
    }
  }, [specId, page, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { inspections, total, loading, error, refetch: fetchHistory };
}
