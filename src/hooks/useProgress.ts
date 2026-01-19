import { useState, useEffect, useCallback } from "react";
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
  duration?: number; // Video duration for percentage calculation
}

interface UseProgressReturn {
  progressMap: Map<number, LocalProgress>;
  loading: boolean;
  updateProgress: (lessonId: number, position: number, duration?: number) => Promise<void>;
  markComplete: (lessonId: number) => Promise<void>;
  isCompleted: (lessonId: number) => boolean;
  getProgress: (lessonId: number) => number;
  getLastPosition: (lessonId: number) => number;
  refetch: () => Promise<void>;
}

export function useProgress(courseId: number): UseProgressReturn {
  const [progressMap, setProgressMap] = useState<Map<number, LocalProgress>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const progressList = await lessonProgressAPI.getByCourse(courseId);
      const map = new Map<number, LocalProgress>();
      if (Array.isArray(progressList)) {
        progressList.forEach((p: LessonProgress) => {
          map.set(p.lesson_id, p);
        });
      }
      setProgressMap(map);
    } catch (error: any) {
      console.error("Failed to fetch progress:", error);
      // It's OK if there's no progress yet (empty course or new user)
      if (error.response?.status !== 404) {
        console.warn("Unexpected error fetching progress:", error.message);
      }
      setProgressMap(new Map());
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchProgress();
    }
  }, [courseId, fetchProgress]);

  const updateProgress = useCallback(
    async (lessonId: number, position: number, duration?: number) => {
      try {
        const updated = await lessonProgressAPI.update(lessonId, {
          lastPosition: Math.floor(position),
        });

        setProgressMap((prev) => {
          const newMap = new Map(prev);
          const existing = prev.get(lessonId);
          newMap.set(lessonId, {
            ...updated,
            duration: duration || existing?.duration,
          });
          return newMap;
        });
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    },
    []
  );

  const markComplete = useCallback(async (lessonId: number) => {
    try {
      const updated = await lessonProgressAPI.markComplete(lessonId);

      setProgressMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(lessonId, updated);
        return newMap;
      });

      toast.success("Lesson marked as complete!");
    } catch (error) {
      console.error("Failed to mark complete:", error);
      toast.error("Failed to update progress");
    }
  }, []);

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
      // Calculate actual percentage if we have duration
      if (progress.duration && progress.duration > 0) {
        return Math.min(100, (progress.last_position / progress.duration) * 100);
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
    loading,
    updateProgress,
    markComplete,
    isCompleted,
    getProgress,
    getLastPosition,
    refetch: fetchProgress,
  };
}
