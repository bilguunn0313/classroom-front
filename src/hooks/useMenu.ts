import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DailyMenu,
  MenuResponse,
  MenuResponseSummary,
  MenuResponseWithUser,
} from "@/types/schema.types";
import { menuAPI } from "@/lib/menu";

export function useTodayMenu() {
  const query = useQuery({
    queryKey: ["today-menu"],
    queryFn: async () => {
      const response = await menuAPI.getToday();
      if (!response.success) throw new Error("Failed to fetch menu");
      return response.data as DailyMenu;
    },
  });

  return {
    menu: query.data ?? null,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useMonthlyMenus(year: number, month: number) {
  const query = useQuery({
    queryKey: ["monthly-menus", year, month],
    queryFn: async () => {
      const response = await menuAPI.getMonthly(year, month);
      if (!response.success) throw new Error("Failed to fetch menus");
      return response.data as DailyMenu[];
    },
  });

  return {
    menus: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useMenuByDate(date: string) {
  const query = useQuery({
    queryKey: ["menu-by-date", date],
    queryFn: async () => {
      const response = await menuAPI.getByDate(date);
      if (!response.success) throw new Error("Failed to fetch menu");
      return response.data as DailyMenu;
    },
    enabled: !!date,
  });

  return {
    menu: query.data ?? null,
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useMenuResponse(menuId: number | null) {
  const queryClient = useQueryClient();

  const myResponseQuery = useQuery({
    queryKey: ["menu-my-response", menuId],
    queryFn: async () => {
      const res = await menuAPI.getMyResponse(menuId!);
      return res.success ? (res.data as MenuResponse) : null;
    },
    enabled: !!menuId,
  });

  const summaryQuery = useQuery({
    queryKey: ["menu-response-summary", menuId],
    queryFn: async () => {
      const res = await menuAPI.getResponseSummary(menuId!);
      return res.success ? (res.data as MenuResponseSummary) : null;
    },
    enabled: !!menuId,
  });

  const respondMutation = useMutation({
    mutationFn: (willAttend: boolean) => menuAPI.respond(menuId!, willAttend),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["menu-my-response", menuId],
      });
      queryClient.invalidateQueries({
        queryKey: ["menu-response-summary", menuId],
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => menuAPI.cancelResponse(menuId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["menu-my-response", menuId],
      });
      queryClient.invalidateQueries({
        queryKey: ["menu-response-summary", menuId],
      });
    },
  });

  return {
    myResponse: myResponseQuery.data ?? null,
    summary: summaryQuery.data ?? null,
    loading: myResponseQuery.isPending || summaryQuery.isPending,
    responding: respondMutation.isPending || cancelMutation.isPending,
    respond: async (willAttend: boolean) => {
      await respondMutation.mutateAsync(willAttend);
    },
    cancel: async () => {
      await cancelMutation.mutateAsync();
    },
    refetch: async () => {
      await Promise.all([
        myResponseQuery.refetch(),
        summaryQuery.refetch(),
      ]);
    },
  };
}

export function useMenuResponses(menuId: number | null) {
  const query = useQuery({
    queryKey: ["menu-responses", menuId],
    queryFn: async () => {
      const res = await menuAPI.getAllResponses(menuId!);
      if (!res.success) throw new Error("Failed to load responses");
      return res.data as MenuResponseWithUser[];
    },
    enabled: !!menuId,
  });

  return {
    responses: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
