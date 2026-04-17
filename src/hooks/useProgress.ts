import { useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonProgressAPI } from "@/lib/progress";
import { toast } from "sonner";

interface LessonProgress {
  id: number;
  student_id: number;
  lesson_id: number;
  completed: boolean;
  completed_at: string | null;
  last_position: number;
}

interface LocalProgress extends LessonProgress {
  duration?: number;
}

export function useProgress(courseId: number) {
  const queryClient = useQueryClient();
  const durationMapRef = useRef(new Map<number, number>());

  const query = useQuery({
    queryKey: ["progress", courseId],
    queryFn: async () => {
      try {
        const progressList = await lessonProgressAPI.getByCourse(courseId);
        return Array.isArray(progressList) ? progressList : [];
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: !!courseId,
  });

  const progressMap = useMemo(() => {
    const map = new Map<number, LocalProgress>();
    (query.data ?? []).forEach((p: LessonProgress) => {
      map.set(p.lesson_id, {
        ...p,
        duration: durationMapRef.current.get(p.lesson_id),
      });
    });
    return map;
  }, [query.data]);

  const updateMutation = useMutation({
    mutationFn: ({
      lessonId,
      position,
    }: {
      lessonId: number;
      position: number;
    }) =>
      lessonProgressAPI.update(lessonId, {
        lastPosition: Math.floor(position),
      }),
    onSuccess: (updated, { lessonId }) => {
      queryClient.setQueryData(
        ["progress", courseId],
        (old: LessonProgress[] | undefined) => {
          if (!old) return [updated];
          const exists = old.some((p) => p.lesson_id === lessonId);
          if (exists)
            return old.map((p) => (p.lesson_id === lessonId ? updated : p));
          return [...old, updated];
        }
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: (lessonId: number) => lessonProgressAPI.markComplete(lessonId),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["progress", courseId],
        (old: LessonProgress[] | undefined) => {
          if (!old) return [updated];
          return old.map((p) =>
            p.lesson_id === updated.lesson_id ? updated : p
          );
        }
      );
      toast.success("Хичээл дууссан гэж тэмдэглэгдлээ!");
    },
    onError: () => {
      toast.error("Явцыг шинэчлэхэд алдаа гарлаа");
    },
  });

  const updateProgress = useCallback(
    async (lessonId: number, position: number, duration?: number) => {
      if (duration) durationMapRef.current.set(lessonId, duration);
      try {
        await updateMutation.mutateAsync({ lessonId, position });
      } catch {
        // Silent - progress update failure during playback is non-critical
      }
    },
    [updateMutation]
  );

  const markComplete = useCallback(
    async (lessonId: number) => {
      await completeMutation.mutateAsync(lessonId);
    },
    [completeMutation]
  );

  const isCompleted = useCallback(
    (lessonId: number) => {
      return progressMap.get(lessonId)?.completed || false;
    },
    [progressMap]
  );

  const getProgress = useCallback(
    (lessonId: number) => {
      const progress = progressMap.get(lessonId);
      if (!progress) return 0;
      if (progress.completed) return 100;
      const duration =
        progress.duration ?? durationMapRef.current.get(lessonId);
      if (duration && duration > 0) {
        return Math.min(100, (progress.last_position / duration) * 100);
      }
      return 0;
    },
    [progressMap]
  );

  const getLastPosition = useCallback(
    (lessonId: number) => {
      return progressMap.get(lessonId)?.last_position || 0;
    },
    [progressMap]
  );

  return {
    progressMap,
    loading: query.isPending,
    updateProgress,
    markComplete,
    isCompleted,
    getProgress,
    getLastPosition,
    refetch: async () => {
      await query.refetch();
    },
  };
}
