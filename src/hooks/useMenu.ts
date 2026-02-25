import { useState, useEffect } from "react";
import { DailyMenu } from "@/types/schema.types";
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
