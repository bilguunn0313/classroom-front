import { useState, useEffect, useCallback } from "react";
import { DailyMenu, MenuResponse, MenuResponseSummary, MenuResponseWithUser } from "@/types/schema.types";
import { menuAPI } from "@/lib/menu";

interface UseMenuReturn {
  menu: DailyMenu | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTodayMenu(): UseMenuReturn {
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuAPI.getToday();
      if (response.success) {
        setMenu(response.data);
      } else {
        throw new Error("Failed to fetch menu");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return { menu, loading, error, refetch: fetchMenu };
}

interface UseMonthlyMenuReturn {
  menus: DailyMenu[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMonthlyMenus(
  year: number,
  month: number
): UseMonthlyMenuReturn {
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuAPI.getMonthly(year, month);
      if (response.success) {
        setMenus(response.data);
      } else {
        throw new Error("Failed to fetch menus");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [year, month]);

  return { menus, loading, error, refetch: fetchMenus };
}

export function useMenuByDate(date: string): UseMenuReturn {
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!date) return;
    try {
      setLoading(true);
      setError(null);
      const response = await menuAPI.getByDate(date);
      if (response.success) {
        setMenu(response.data);
      } else {
        throw new Error("Failed to fetch menu");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { menu, loading, error, refetch: fetchMenu };
}

interface UseMenuResponseReturn {
  myResponse: MenuResponse | null;
  summary: MenuResponseSummary | null;
  loading: boolean;
  responding: boolean;
  respond: (willAttend: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useMenuResponse(menuId: number | null): UseMenuResponseReturn {
  const [myResponse, setMyResponse] = useState<MenuResponse | null>(null);
  const [summary, setSummary] = useState<MenuResponseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);

  const fetchData = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const [responseRes, summaryRes] = await Promise.all([
        menuAPI.getMyResponse(menuId),
        menuAPI.getResponseSummary(menuId),
      ]);
      if (responseRes.success) setMyResponse(responseRes.data);
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch {
      // Silently handle — user may not have responded yet
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const respond = async (willAttend: boolean) => {
    if (!menuId) return;
    try {
      setResponding(true);
      const res = await menuAPI.respond(menuId, willAttend);
      // Optimistically update local state immediately
      if (res.success && res.data) {
        setMyResponse(res.data);
      }
      // Then refresh summary in background
      try {
        const [responseRes, summaryRes] = await Promise.all([
          menuAPI.getMyResponse(menuId),
          menuAPI.getResponseSummary(menuId),
        ]);
        if (responseRes.success) setMyResponse(responseRes.data);
        if (summaryRes.success) setSummary(summaryRes.data);
      } catch {
        // Summary refresh failed, but response was saved
      }
    } finally {
      setResponding(false);
    }
  };

  return { myResponse, summary, loading, responding, respond, refetch: fetchData };
}

interface UseMenuResponsesReturn {
  responses: MenuResponseWithUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMenuResponses(menuId: number | null): UseMenuResponsesReturn {
  const [responses, setResponses] = useState<MenuResponseWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await menuAPI.getAllResponses(menuId);
      if (res.success) setResponses(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load responses");
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  return { responses, loading, error, refetch: fetchResponses };
}
