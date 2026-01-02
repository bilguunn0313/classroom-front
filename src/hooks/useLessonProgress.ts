import { useState, useEffect } from "react";

interface LessonProgress {
  [lessonId: number]: {
    completed: boolean;
    progress: number; // 0-100
    lastWatchedAt?: string;
  };
}

interface UseLessonProgressReturn {
  progress: LessonProgress;
  markAsCompleted: (lessonId: number) => void;
  updateProgress: (lessonId: number, progress: number) => void;
  isCompleted: (lessonId: number) => boolean;
  getProgress: (lessonId: number) => number;
}

export function useLessonProgress(courseId: number): UseLessonProgressReturn {
  const [progress, setProgress] = useState<LessonProgress>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`course_progress_${courseId}`);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse progress:", err);
      }
    }
  }, [courseId]);

  // Save progress to localStorage when it changes
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem(
        `course_progress_${courseId}`,
        JSON.stringify(progress)
      );
    }
  }, [progress, courseId]);

  const markAsCompleted = (lessonId: number) => {
    setProgress((prev) => ({
      ...prev,
      [lessonId]: {
        completed: true,
        progress: 100,
        lastWatchedAt: new Date().toISOString(),
      },
    }));
  };

  const updateProgress = (lessonId: number, progressPercent: number) => {
    setProgress((prev) => ({
      ...prev,
      [lessonId]: {
        completed: progressPercent >= 90, // Mark as completed at 90%
        progress: progressPercent,
        lastWatchedAt: new Date().toISOString(),
      },
    }));
  };

  const isCompleted = (lessonId: number) => {
    return progress[lessonId]?.completed || false;
  };

  const getProgress = (lessonId: number) => {
    return progress[lessonId]?.progress || 0;
  };

  return {
    progress,
    markAsCompleted,
    updateProgress,
    isCompleted,
    getProgress,
  };
}
