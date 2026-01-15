import { useMemo } from "react";

interface Lesson {
  video_duration: number | null;
}

interface UseDurationReturn {
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalFormatted: string;
  formatDuration: (seconds: number | null) => string;
  formatDetailedDuration: (seconds: number | null) => string;
}

export function useDuration(lessons: Lesson[]): UseDurationReturn {
  const totalSeconds = useMemo(() => {
    return lessons.reduce(
      (acc, lesson) => acc + (lesson.video_duration || 0),
      0
    );
  }, [lessons]);

  const totalMinutes = useMemo(() => {
    return Math.floor(totalSeconds / 60);
  }, [totalSeconds]);

  const totalHours = useMemo(() => {
    return Math.floor(totalSeconds / 3600);
  }, [totalSeconds]);

  const totalFormatted = useMemo(() => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, [totalSeconds]);

  // Format as MM:SS (for video progress)
  const formatDuration = (seconds: number | null): string => {
    if (!seconds || seconds === 0) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format as "X hours Y minutes" or "Y minutes" (for course total)
  const formatDetailedDuration = (seconds: number | null): string => {
    if (!seconds || seconds === 0) return "0 minutes";

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
    }
    return `${mins} minutes`;
  };

  return {
    totalSeconds,
    totalMinutes,
    totalHours,
    totalFormatted,
    formatDuration,
    formatDetailedDuration,
  };
}
