import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dish } from "@/types/schema.types";
import { dishAPI } from "@/lib/dish";

interface DishFilters {
  itemType?: string;
  search?: string;
}

export function useDishes(filters: DishFilters = {}) {
  const query = useQuery({
    queryKey: ["dishes", filters],
    queryFn: async () => {
      const response = await dishAPI.list(filters);
      if (!response.success) throw new Error("Failed to fetch dishes");
      return response.data as Dish[];
    },
  });

  return {
    dishes: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useDishMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["dishes"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; imageUrl?: string | null; itemType: "meal_1" | "meal_2" | "drink" }) =>
      dishAPI.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; imageUrl?: string | null; itemType?: "meal_1" | "meal_2" | "drink" } }) =>
      dishAPI.update(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => dishAPI.delete(id),
    onSuccess: invalidate,
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}
