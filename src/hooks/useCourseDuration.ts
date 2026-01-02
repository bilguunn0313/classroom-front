import { useMemo } from "react";
import { Lesson } from "@/types/schema.types";

interface UseCourseDurationReturn {
  totalSeconds: number;
  totalFormatted: string;
  formatDuration: (seconds: number | null) => string;
}

export function useCourseDuration(lessons: Lesson[]): UseCourseDurationReturn {
  const totalSeconds = useMemo(() => {
    return lessons.reduce(
      (acc, lesson) => acc + (lesson.video_duration || 0),
      0
    );
  }, [lessons]);

  const totalFormatted = useMemo(() => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }, [totalSeconds]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    totalSeconds,
    totalFormatted,
    formatDuration,
  };
}
